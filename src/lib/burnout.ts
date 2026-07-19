/*
  * Burnout score calculator
  * Fetch the data and do the math in burnout_math.ts
*/

import { BURNOUT_CONFIG as C } from './burnout_constants';
import * as M from './burnout_math';
import {
  getMoodsByDay,
  getSelfCareCountsByDay,
  getTodaySelfCareCounts,
  getTodaysMoods,
} from './self-care';
import {
  DailySessionTotals,
  getRecentDailyTotals,
  getTodaySessionStats
} from './sessions';

export type BurnoutStatus = M.BurnoutStatus;
export const getStatus = M.getStatus;

export interface BurnoutResult {
  score: number;
  status: BurnoutStatus;
  factors: string[];
  breakdown: {
    effectiveLoad: number;
    exhaustion: number;
    chronic: number;
    mood: number;
    recovery: number;
    efficacy: number;
  };
}

// How many days back
function dayKeyOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toDateString();
}

// Build effective load for last 7 days
function buildLoadHistory(
  totals: Record<string, DailySessionTotals>,
  selfCareByDay: Record<string, number>,
  todayLoad: number
): number[] {
  const out: number[] = [];
  for (let i = C.CHRONIC_WINDOW_DAYS - 1; i >= 1; i--) {
    const key = dayKeyOffset(i);
    const t = totals[key];

    // No session that day, 0
    if (!t) {
      out.push(0);
      continue;
    }

    const credit = M.recoveryCredit(t.breakMinutes, selfCareByDay[key] ?? 0);
    out.push(M.effectiveLoad(t.studyMinutes, credit));
  }

  out.push(todayLoad);
  return out;
}

function buildPrevMoodDays(moodsByDay: Record<string, string[]>): string[][] {
  const out: string[][] = [];
  for (let i = 1; i <= C.MOOD_RECENT_DAYS; i++) {
    out.push(moodsByDay[dayKeyOffset(i)] ?? []);
  }
  return out;
}

// Pick the 3 biggest reasons the score is where it is
// for WellnessNotice
// E: exhaustion, Ch: chronic, Mo: mood, F: focus efficacy, L: effective load
function buildFactors(p: {
  E: number; Ch: number; Mo: number; F: number;
  L: number; breakMinutes: number; selfCareLogs: number;
}): string[] {
  const f: { text: string; size: number }[] = [];

  if (p.E >= 20) {
    f.push({ text: 'Very heavy study load today', size: p.E });
  } else if (p.E > 0) {
    f.push({ text: 'Long study day', size: p.E });
  }

  if (p.Ch >= 10) {
    f.push({ text: 'Heavy load building up all week', size: p.Ch });
  } else if (p.Ch > 0) {
    f.push({ text: 'Load creeping up this week', size: p.Ch });
  }

  if (p.L > 2 && p.breakMinutes < 15) {
    f.push({ text: 'Barely any breaks today', size: 12 });
  }
  if (p.breakMinutes >= 30) {
    f.push({ text: 'Taking good breaks', size: 4 });
  }

  if (p.Mo < 0) {
    f.push({ text: 'Low mood check-ins', size: -p.Mo });
  }
  if (p.Mo > 0) {
    f.push({ text: 'Feeling good lately', size: p.Mo });
  }

  if (p.selfCareLogs >= 3) {
    f.push({ text: 'Great self-care 🌿', size: 8 });
  }
  if (p.F >= 8) {
    f.push({ text: 'Finishing what you start', size: p.F });
  }

  return f.sort((a, b) => b.size - a.size).slice(0, 3).map(x => x.text);
}

export async function calculateBurnoutScore(): Promise<BurnoutResult> {
  const [stats, dailyTotals, selfCareCounts, selfCareByDay, moodsToday, moodsByDay] =
    await Promise.all([
      getTodaySessionStats(),
      getRecentDailyTotals(C.CHRONIC_WINDOW_DAYS),
      getTodaySelfCareCounts(),
      getSelfCareCountsByDay(C.CHRONIC_WINDOW_DAYS),
      getTodaysMoods(),
      getMoodsByDay(C.MOOD_RECENT_DAYS + 1),
    ]);

  const selfCareLogs = Object.values(selfCareCounts).reduce((s, n) => s + n, 0);

  const credit = M.recoveryCredit(stats.breakMinutes, selfCareLogs);
  const L = M.effectiveLoad(stats.studyMinutes, credit);
  const E = M.exhaustionPenalty(L);
  const Ch = M.chronicPenalty(buildLoadHistory(dailyTotals, selfCareByDay, L));
  const Mo = M.moodAdjustment(moodsToday, buildPrevMoodDays(moodsByDay));
  const R = M.recoveryBonus(stats.breakMinutes, selfCareLogs);
  const F = M.efficacyBonus(stats.focusStarted, stats.focusCompleted, E);

  const score = Math.round(
    M.clamp(C.NEUTRAL_BASELINE - E - Ch + Mo + R + F, 0, 100)
  );

  return {
    score,
    status: M.getStatus(score),
    factors: buildFactors({
      E, Ch, Mo, F, L,
      breakMinutes: stats.breakMinutes,
      selfCareLogs,
    }),
    breakdown: {
      effectiveLoad: L, exhaustion: E, chronic: Ch,
      mood: Mo, recovery: R, efficacy: F,
    },
  };
}