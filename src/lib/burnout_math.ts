/*
 * Pure burnout math
 * All functions are explained in README (design of burnout indicator)
*/

import { BURNOUT_CONFIG as C } from './burnout_constants';

export type BurnoutStatus = 'engaged' | 'balanced' | 'overextended' | 'burnout';

// v: value to limit; lo: min allowed value; hi: max allowed value
export const clamp = (v: number, lo: number, hi: number) => 
    Math.min(hi, Math.max(lo, v));

export const mean = (xs: number[]) => 
    (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function recoveryCredit(breakMinutes: number, selfCareLogs: number): number {
  return (
    Math.min(C.BREAK_CREDIT_HOURS_CAP, breakMinutes / C.BREAK_CREDIT_MINUTES_FULL) +
    Math.min(C.SELFCARE_CREDIT_CAP, selfCareLogs * C.SELFCARE_CREDIT_PER_LOG)
  );
}

export function effectiveLoad(studyMinutes: number, credit: number): number {
  return Math.max(0, studyMinutes / 60 - credit);
}

export function exhaustionPenalty(L: number): number {
  if (L <= C.LOAD_FREE_HOURS) return 0;

  if (L <= C.LOAD_MID_CEILING_HOURS) {
    return C.LOAD_MID_SLOPE * (L - C.LOAD_FREE_HOURS);
  }

  const mid = C.LOAD_MID_SLOPE * (C.LOAD_MID_CEILING_HOURS - C.LOAD_FREE_HOURS);

  return Math.min(
    C.EXHAUSTION_CAP,
    mid + C.LOAD_HIGH_SLOPE * (L - C.LOAD_MID_CEILING_HOURS)
  );
}

export function chronicPenalty(loads: number[]): number {
  if (loads.length === 0) return 0;

  const excess = C.CHRONIC_MEAN_SLOPE * Math.max(0, mean(loads) - C.LOAD_FREE_HOURS);

  let streak = 0;
  for (let i = loads.length - 1; i >= 0 && loads[i] > C.HEAVY_DAY_HOURS; i--) streak++;
  const noRest = C.CHRONIC_STREAK_SLOPE * Math.max(0, streak - C.CHRONIC_STREAK_GRACE_DAYS);

  return Math.min(C.CHRONIC_CAP, excess + noRest);
}

export function moodAdjustment(moodsToday: string[], moodsPrevDays: string[][]): number {
  const val = (m: string) => C.MOOD_VALUES[m as keyof typeof C.MOOD_VALUES] ?? 0;

  const today = moodsToday.length ? mean(moodsToday.map(val)) : null;
  const prevDaily = moodsPrevDays.filter(d => d.length).map(d => mean(d.map(val)));
  const prev = prevDaily.length ? mean(prevDaily) : null;

  let v: number;
  if (today !== null && prev !== null) {
    v = C.MOOD_TODAY_WEIGHT * today + C.MOOD_RECENT_WEIGHT * prev;
  } else if (today !== null) {
    v = today;
  } else if (prev !== null) {
    v = C.MOOD_STALE_DECAY * prev;  
  } else {
    return 0;
  }

  // Negative moods weigh more than positive ones
  return v < 0 ? C.MOOD_NEG_SLOPE * v : C.MOOD_POS_SLOPE * v;
}

export function recoveryBonus(breakMinutes: number, selfCareLogs: number): number {
  return (
    Math.min(C.SELFCARE_BONUS_CAP, C.SELFCARE_BONUS_PER_LOG * selfCareLogs) +
    C.BREAK_BONUS_CAP * Math.min(1, breakMinutes / C.BREAK_BONUS_MINUTES_FULL)
  );
}

export function efficacyBonus(
  focusStarted: number,
  focusCompleted: number,
  exhaustion: number
): number {
  const rate =
    focusStarted >= C.MIN_SESSIONS_FOR_RATE
      ? clamp(focusCompleted / focusStarted, 0, 1)
      : 0;
  const gate = clamp(1 - exhaustion / C.EXHAUSTION_CAP, 0, 1);
  return C.EFFICACY_MAX * rate * gate;
}

export function getStatus(score: number): BurnoutStatus {
  if (score >= C.THRESHOLDS.ENGAGED) return 'engaged';
  if (score >= C.THRESHOLDS.BALANCED) return 'balanced';
  if (score >= C.THRESHOLDS.OVEREXTENDED) return 'overextended';
  return 'burnout';
}