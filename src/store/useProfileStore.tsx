import { create } from "zustand";
import { supabase } from "@/lib/supabase";

// used in formula to calculate XP level, it controls how fast or slow leveling up feels.
const LEVEL_COEFFICIENT = 85;
// daily  XP caps for the 2 pillars: progress (todo) and focus (pomodoro)
const FOCUS_DAILY_CAP = 580;
const PROGRESS_DAILY_CAP = 180; 

// total amount of XP required to hit a certain level
export function totalXpRequiredForLevel(level: number): number {
  return LEVEL_COEFFICIENT * level * (level - 1);
};

// function to calculate level given XP
export function calculateXPLevel(xp: number): number {
  if (xp <= 0) return 1;
  const L = (LEVEL_COEFFICIENT + Math.sqrt(LEVEL_COEFFICIENT ** 2 + 4 * LEVEL_COEFFICIENT * xp)) / (2 * LEVEL_COEFFICIENT);
  let level = Math.floor(L);

  // safety checks in case of floating point error
  while (totalXpRequiredForLevel(level + 1) <= xp) level++;
  while (totalXpRequiredForLevel(level) > xp) level--;
  return Math.max(1, level);
}

// calculates amount of coins gained for each level increase
export function calculateCoinsEarned(level: number): number {
  return Math.round(10 * Math.pow(1.15, level));
}

// sums coin rewards for every level crossed in one XP gain (handles multi-level jumps)
// should not be possible with the XP design but this is just in case
function getLevelUpInfo(oldXP: number, newXP: number) {
  const oldLevel = calculateXPLevel(oldXP);
  const newLevel = calculateXPLevel(newXP);
  let coinsEarned = 0;
  for (let L = oldLevel + 1; L <= newLevel; L++) coinsEarned += calculateCoinsEarned(L);
  return { newLevel, coinsEarned };
}

// if pendingLevelUp = null -> no trigger levelUp modal, if pendingLevelUp = {level, consEarned} -> trigger levelUp modal
type PendingLevelUp = { level: number; coinsEarned: number } | null;

type ProfileState = {
    userID: string | null;
    name: string;
    chickName: string;
    equippedItemId: number | null,
    ownedItemIds: number[],
    xp: number,
    coins: number,
    isLoading: boolean,
    pendingLevelUp: PendingLevelUp,

    init: () => Promise<void>;
    setChickName: (newName: string) => Promise<void>;
    buyItem: (price: number, itemId: number) => Promise<void>;
    equipItem: (itemId: number) => Promise<void>;
    unequipItem: () => Promise<void>;
    addWellbeingXp: (xpAmount: number, coinsBonus?: number) => Promise<void>;
    clearLevelUp: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
    userID: null,
    name: '',
    chickName: '',
    equippedItemId: null,
    ownedItemIds: [],
    xp: 0,
    coins: 0,
    isLoading: true,
    pendingLevelUp: null,

    init: async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
        set({ isLoading: false });
        return;
        }

        const metadataName = user.user_metadata?.display_name;

        const { data } = await supabase
        .from('profiles')
        .select('display_name, chicken_name, equipped_item_id, xp, coins')
        .eq('id', user.id)
        .single();

        if (data) {
        set({
            userID: user.id,
            name: data.display_name ?? metadataName ?? '',
            chickName: data.chicken_name ?? '',
            equippedItemId: data.equipped_item_id,
            xp: data.xp ?? 0,
            coins: data.coins ?? 0,
            });
        }

        const { data: inventoryData } = await supabase
        .from('inventory')
        .select('item_id')
        .eq('user_id', user.id);

        set({
        ownedItemIds: inventoryData ? inventoryData.map(row => row.item_id) : [],
        isLoading: false,
        });
    },

    setChickName: async (newName) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
        .from('profiles')
        .update({ chicken_name: newName })
        .eq('id', user.id);

        if (error) {
        console.error(error);
        return;
        }

        set({ chickName: newName });
    },

    buyItem: async (price, itemId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error: coinsError } = await supabase
        .from('profiles')
        .update({ coins: get().coins - price })
        .eq('id', user.id);

        if (coinsError) {
        console.error(coinsError);
        return;
        }

        const { error: inventoryError } = await supabase
        .from('inventory')
        .insert({ user_id: user.id, item_id: itemId });

        if (inventoryError) {
        console.error(inventoryError);
        return;
        }

        set((state) => ({
        coins: state.coins - price,
        ownedItemIds: [...state.ownedItemIds, itemId],
        }));
    },

    equipItem: async (itemId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
        .from('profiles')
        .update({ equipped_item_id: itemId })
        .eq('id', user.id);

        if (error) {
        console.error(error);
        return;
        }
        set({ equippedItemId: itemId });
    },

    // no need for itemId argument as only one item can be equipped at one time -> do no need to know
    unequipItem: async () => {
        const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ equipped_item_id: null })
      .eq('id', user.id);

        if (error) {
        console.error(error);
        return;
        }
        set({ equippedItemId: null });
    },
    addWellbeingXp: async (xpAmount, coinsBonus = 0) => {
        const { userID, xp, coins } = get();
        if (!userID || xpAmount <= 0) return;
    
        const newXP = xp + xpAmount;
        const { newLevel, coinsEarned } = getLevelUpInfo(xp, newXP);
        const newCoins = coins + coinsEarned + coinsBonus;
    
        set({
          xp: newXP,
          coins: newCoins,
          // if coinsEarned > 0 -> means new level reached, update pendingLevelUp, if not pendingLevelUp remains null
          pendingLevelUp: coinsEarned > 0 ? { level: newLevel, coinsEarned } : get().pendingLevelUp,
        });
    
        await supabase.from('profiles').update({ xp: newXP, coins: newCoins }).eq('id', userID);
      },
    clearLevelUp: () => {
        set({ pendingLevelUp: null });
    }

            
}))