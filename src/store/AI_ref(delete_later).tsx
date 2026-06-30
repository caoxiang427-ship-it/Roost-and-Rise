{/* global state and functions regarding user goes here (e.g. XP and coins) */}

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// used in formula to calculate XP level, it controls how fast or slow leveling up feels.
const LEVEL_COEFFICIENT = 85;     

// XP cap per day for the 2 pillars
const FOCUS_DAILY_CAP = 580;
const PROGRESS_DAILY_CAP = 180;

const DIFFICULTY_XP = {
  easy: 5,
  moderate: 10,
  difficult: 15,
} as const;


function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// total amount of XP required to hit a certain level
export function cumulativeXPForLevel(level: number): number {
  return LEVEL_COEFFICIENT * level * (level - 1);
}

// function to calculate level given XP
export function calculateXPLevel(xp: number): number {
  if (xp <= 0) return 1;
  const L = (LEVEL_COEFFICIENT + Math.sqrt(LEVEL_COEFFICIENT ** 2 + 4 * LEVEL_COEFFICIENT * xp)) / (2 * LEVEL_COEFFICIENT);
  let level = Math.floor(L);

  // safety checks in case of floating point error
  while (cumulativeXPForLevel(level + 1) <= xp) level++;
  while (cumulativeXPForLevel(level) > xp) level--;
  return Math.max(1, level);
}

// calculates amount of coins gained for each level increase
export function calculateCoinsEarned(level: number): number {
  return Math.round(10 * Math.pow(1.15, level));
}

// sums coin rewards for every level crossed in one XP gain (handles multi-level jumps)
// should not be possible with the XP design but this is just in case
function checkLevelUps(oldXP: number, newXP: number) {
  const oldLevel = calculateXPLevel(oldXP);
  const newLevel = calculateXPLevel(newXP);
  let coinsEarned = 0;
  for (let L = oldLevel + 1; L <= newLevel; L++) coinsEarned += calculateCoinsEarned(L);
  return { newLevel, coinsEarned };
}

// pending level up is a "waiting room" for a level up that happened but hasn't been shown to the user yet.
// (e.g. XP gain happens in the middle of another action (completing a task, finishing a timer) and you don't want the modal to interrupt that flow)
type PendingLevelUp = { level: number; coinsEarned: number } | null;

type Difficulty = keyof typeof DIFFICULTY_XP | '';

type XPState = {
  userID: string | null;
  xp: number;
  coins: number;
  focusXPToday: number;
  progressXPToday: number;
  dailyResetDate: string;
  loading: boolean;
  pendingLevelUp: PendingLevelUp;

  init: () => Promise<void>;
  ensureDailyResetCurrent: () => void;
  addFocusXP: (minutes: number, mode: 'focus' | 'break', sessionStreak?: number) => Promise<void>;
  addProgressXP: (difficulty: Difficulty) => Promise<void>;
  addWellbeingXP: (xpAmount: number, coinsBonus?: number) => Promise<void>;
  spendCoins: (amount: number) => Promise<boolean>;
  clearLevelUp: () => void;
};

export const useXPStore = create<XPState>((set, get) => ({
  userID: null,
  xp: 0,
  coins: 0,
  focusXPToday: 0,
  progressXPToday: 0,
  dailyResetDate: todayString(),
  loading: true,
  pendingLevelUp: null,

  init: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ loading: false }); return; }

    const { data, error } = await supabase
      .from('profiles')
      .select('xp, coins, focus_xp_today, progress_xp_today, daily_xp_reset_date')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      console.log(error);
      set({ userID: user.id, loading: false });
      return;
    }

    set({
      userID: user.id,
      xp: data.xp ?? 0,
      coins: data.coins ?? 0,
      focusXPToday: data.focus_xp_today ?? 0,
      progressXPToday: data.progress_xp_today ?? 0,
      dailyResetDate: data.daily_xp_reset_date ?? todayString(),
      loading: false,
    });

    // call function getDailyResetCurrent -> checks if it's a new day and resets the daily XP counters if so:
    get().ensureDailyResetCurrent();
  },

  // if a calendar day has passed since the stored reset date, zero the capped pillars locally;
  // gets persisted on the next XP-earning write rather than firing an update for nothing
  ensureDailyResetCurrent: () => {
    const today = todayString();
    // if stored reset date is different from today, reset the caps and set reset date to today
    if (get().dailyResetDate !== today) {
      set({ focusXPToday: 0, progressXPToday: 0, dailyResetDate: today });
    }
  },

  addFocusXP: async (minutes, mode, sessionStreak) => {
    const { userID } = get();
    if (!userID || minutes <= 0) return;
    get().ensureDailyResetCurrent();

    const rate = mode === 'focus' ? 1 : 0.5; // 1 XP/min focused, 0.5 XP/min on break
    let rawXP = minutes * rate;

    // consistency bonus: +10% per consecutive completed focus session today, capped +50%
    if (mode === 'focus' && sessionStreak) {
      rawXP *= 1 + Math.min(sessionStreak, 5) * 0.1;
    }

    // apply daily cap
    const { focusXPToday, xp, coins } = get();
    const remaining = Math.max(0, FOCUS_DAILY_CAP - focusXPToday);
    const awarded = Math.min(rawXP, remaining);
    if (awarded <= 0) return;

    const newFocusToday = focusXPToday + awarded;
    const newXP = xp + awarded;
    const { newLevel, coinsEarned } = checkLevelUps(xp, newXP);
    const newCoins = coins + coinsEarned;

    set({
      focusXPToday: newFocusToday,
      xp: newXP,
      coins: newCoins,
      dailyResetDate: todayString(),
      pendingLevelUp: coinsEarned > 0 ? { level: newLevel, coinsEarned } : get().pendingLevelUp,
    });

    await supabase.from('profiles').update({
      xp: newXP, coins: newCoins, focus_xp_today: newFocusToday, daily_xp_reset_date: todayString(),
    }).eq('id', userID);
  },

  addProgressXP: async (difficulty) => {
    const { userID } = get();
    if (!userID || !difficulty) return;
    get().ensureDailyResetCurrent();

    const rawXP = DIFFICULTY_XP[difficulty];
    const { progressXPToday, xp, coins } = get();
    const remaining = Math.max(0, PROGRESS_DAILY_CAP - progressXPToday);
    const awarded = Math.min(rawXP, remaining);
    if (awarded <= 0) return;

    const newProgressToday = progressXPToday + awarded;
    const newXP = xp + awarded;
    const { newLevel, coinsEarned } = checkLevelUps(xp, newXP);
    const newCoins = coins + coinsEarned;

    set({
      progressXPToday: newProgressToday,
      xp: newXP,
      coins: newCoins,
      dailyResetDate: todayString(),
      pendingLevelUp: coinsEarned > 0 ? { level: newLevel, coinsEarned } : get().pendingLevelUp,
    });

    await supabase.from('profiles').update({
      xp: newXP, coins: newCoins, progress_xp_today: newProgressToday, daily_xp_reset_date: todayString(),
    }).eq('id', userID);
  },

  // no daily cap on wellbeing; coinsBonus is the small direct trickle (e.g. +2 self-care, +3 mood)
  addWellbeingXP: async (xpAmount, coinsBonus = 0) => {
    const { userID, xp, coins } = get();
    if (!userID || xpAmount <= 0) return;

    const newXP = xp + xpAmount;
    const { newLevel, coinsEarned } = checkLevelUps(xp, newXP);
    const newCoins = coins + coinsEarned + coinsBonus;

    set({
      xp: newXP,
      coins: newCoins,
      pendingLevelUp: coinsEarned > 0 ? { level: newLevel, coinsEarned } : get().pendingLevelUp,
    });

    await supabase.from('profiles').update({ xp: newXP, coins: newCoins }).eq('id', userID);
  },

  spendCoins: async (amount) => {
    const { userID, coins } = get();
    if (!userID || amount > coins) return false;

    const newCoins = coins - amount;
    set({ coins: newCoins });

    const { error } = await supabase.from('profiles').update({ coins: newCoins }).eq('id', userID);
    if (error) { console.log(error); set({ coins }); return false; }
    return true;
  },

  clearLevelUp: () => set({ pendingLevelUp: null }),
}));