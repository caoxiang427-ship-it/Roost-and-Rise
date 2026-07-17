/*
 * Integration tests for calculateBurnoutScore.
 * The two data modules are mocked, so Supabase never loads
*/

import { calculateBurnoutScore } from '../src/lib/burnout';
import {
  getMoodsByDay,
  getSelfCareCountsByDay,
  getTodaySelfCareCounts,
  getTodaysMoods,
} from '../src/lib/self-care';
import { getRecentDailyTotals, getTodaySessionStats } from '../src/lib/sessions';

jest.mock('../src/lib/sessions', () => ({
  getTodaySessionStats: jest.fn(),
  getRecentDailyTotals: jest.fn(),
}));

jest.mock('../src/lib/self-care', () => ({
  getTodaySelfCareCounts: jest.fn(),
  getSelfCareCountsByDay: jest.fn(),
  getTodaysMoods: jest.fn(),
  getMoodsByDay: jest.fn(),
}));

const mockStats = getTodaySessionStats as jest.Mock;
const mockDailyTotals = getRecentDailyTotals as jest.Mock;
const mockSelfCareCounts = getTodaySelfCareCounts as jest.Mock;
const mockSelfCareByDay = getSelfCareCountsByDay as jest.Mock;
const mockMoodsToday = getTodaysMoods as jest.Mock;
const mockMoodsByDay = getMoodsByDay as jest.Mock;

function dayKey(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toDateString();
}

function stats(over: Partial<{
  studyMinutes: number; breakMinutes: number;
  focusStarted: number; focusCompleted: number;
}> = {}) {
  return {
    studyMinutes: 0, breakMinutes: 0, focusStarted: 0, focusCompleted: 0, ...over,
  };
}

// Builds a history where each of the given days had that many study minutes. 
function history(minutesByDaysAgo: Record<number, number>) {
  const out: Record<string, { studyMinutes: number; breakMinutes: number }> = {};
  for (const [daysAgo, mins] of Object.entries(minutesByDaysAgo)) {
    out[dayKey(Number(daysAgo))] = { studyMinutes: mins, breakMinutes: 0 };
  }
  return out;
}

beforeEach(() => {
  jest.clearAllMocks();

  mockStats.mockResolvedValue(stats());
  mockDailyTotals.mockResolvedValue({});
  mockSelfCareCounts.mockResolvedValue({});
  mockSelfCareByDay.mockResolvedValue({});
  mockMoodsToday.mockResolvedValue([]);
  mockMoodsByDay.mockResolvedValue({});
});

describe('calculateBurnoutScore — baseline', () => {
  test('returns the baseline score of 65 with no data', async () => {
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(65);
    expect(result.status).toBe('balanced');
  });

  test('no data produces no factors', async () => {
    const result = await calculateBurnoutScore();
    expect(result.factors).toEqual([]);
  });
});

describe('calculateBurnoutScore — study load', () => {
  test('4 hours of study is inside the free zone and costs nothing', async () => {
    mockStats.mockResolvedValue(stats({ studyMinutes: 240 }));
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(65);
  });

  test('6 hours of study drops the score to Balanced', async () => {
    mockStats.mockResolvedValue(stats({ studyMinutes: 360 }));
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(51); // 65 - 14
    expect(result.status).toBe('balanced');
  });

  test('8 hours of study drops the score to Overextended', async () => {
    mockStats.mockResolvedValue(stats({ studyMinutes: 480 }));
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(37); // 65 - 28
    expect(result.status).toBe('overextended');
  });

  test('the exhaustion penalty stops increasing past 11 hours', async () => {
    mockStats.mockResolvedValue(stats({ studyMinutes: 720 }));
    const result = await calculateBurnoutScore();
    expect(result.breakdown.exhaustion).toBe(40);
    expect(result.score).toBe(25); // 65 - 40
  });

  test('there is no jump around the 4-hour mark', async () => {
    mockStats.mockResolvedValue(stats({ studyMinutes: 239 }));
    const below = (await calculateBurnoutScore()).breakdown.exhaustion;

    mockStats.mockResolvedValue(stats({ studyMinutes: 241 }));
    const above = (await calculateBurnoutScore()).breakdown.exhaustion;

    expect(Math.abs(above - below)).toBeLessThan(0.5);
  });
});

describe('calculateBurnoutScore — recovery offsets load', () => {
  test('8 hours with no recovery is Overextended', async () => {
    mockStats.mockResolvedValue(stats({ studyMinutes: 480 }));
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(37);
    expect(result.status).toBe('overextended');
  });

  test('the same 8 hours with full recovery is Balanced', async () => {
    mockStats.mockResolvedValue(stats({ studyMinutes: 480, breakMinutes: 60 }));
    mockSelfCareCounts.mockResolvedValue({ sleep: 2, move: 2 });
    const result = await calculateBurnoutScore();

    expect(result.breakdown.effectiveLoad).toBe(6);  
    expect(result.score).toBe(61);                  
    expect(result.status).toBe('balanced');
  });

  test('a pure rest day without any studying is Engaged', async () => {
    mockStats.mockResolvedValue(stats({ breakMinutes: 0 }));
    mockSelfCareCounts.mockResolvedValue({ sleep: 2, unwind: 2 });
    mockMoodsToday.mockResolvedValue(['good']);
    const result = await calculateBurnoutScore();

    expect(result.score).toBe(77); // 65 + 6 + 6
    expect(result.status).toBe('engaged');
  });
});

describe('calculateBurnoutScore — mood', () => {
  test('an exhausted check-in lowers the score by 16', async () => {
    mockMoodsToday.mockResolvedValue(['exhausted']);
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(49);
  });

  test('a great check-in raises the score by 12', async () => {
    mockMoodsToday.mockResolvedValue(['great']);
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(77);
    expect(result.status).toBe('engaged');
  });

  test('a bad check-in and a good one on the same day cancel out (baseline)', async () => {
    mockMoodsToday.mockResolvedValue(['exhausted', 'great']);
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(65);
  });

  test('when today has no check-ins, yesterday’s mood counts at half weight', async () => {
    mockMoodsByDay.mockResolvedValue({ [dayKey(1)]: ['great'] });
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(71); // 65 + (0.5 * 2 * 6)
  });

  test('today’s mood outweighs the previous days', async () => {
    mockMoodsToday.mockResolvedValue(['great']);
    mockMoodsByDay.mockResolvedValue({ [dayKey(1)]: ['exhausted'] });
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(70); // 65 + 4.8
  });

  test('prevent today’s mood from being counted twice', async () => {
    mockMoodsToday.mockResolvedValue(['good']);
    mockMoodsByDay.mockResolvedValue({ [dayKey(0)]: ['exhausted'] });
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(71); // 65 + 6, exhausted ignored
  });
});

describe('calculateBurnoutScore — chronic load', () => {
  test('one heavy day on its own carries no chronic penalty', async () => {
    mockStats.mockResolvedValue(stats({ studyMinutes: 360 }));
    const result = await calculateBurnoutScore();
    expect(result.breakdown.chronic).toBe(0);
  });

  test('a whole week at 6h/day adds a chronic penalty on top of today’s', async () => {
    mockStats.mockResolvedValue(stats({ studyMinutes: 360 }));
    mockDailyTotals.mockResolvedValue(
      history({ 1: 360, 2: 360, 3: 360, 4: 360, 5: 360, 6: 360 })
    );
    const result = await calculateBurnoutScore();

    expect(result.breakdown.chronic).toBeCloseTo(13, 5);
    expect(result.score).toBe(38); // 65 - 14 - 13
    expect(result.status).toBe('overextended');
  });

  test('taking today off after a heavy week breaks the streak', async () => {
    mockDailyTotals.mockResolvedValue(
      history({ 1: 360, 2: 360, 3: 360, 4: 360, 5: 360, 6: 360 })
    );
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(62); // streak resets, only the average remains
    expect(result.status).toBe('balanced');
  });

  test('self-care reduces the effective load of past days', async () => {
    mockDailyTotals.mockResolvedValue(
      history({ 1: 360, 2: 360, 3: 360, 4: 360, 5: 360, 6: 360 })
    );
    mockSelfCareByDay.mockResolvedValue({
      [dayKey(1)]: 4, [dayKey(2)]: 4, [dayKey(3)]: 4,
      [dayKey(4)]: 4, [dayKey(5)]: 4, [dayKey(6)]: 4,
    });

    const withCare = await calculateBurnoutScore();

    mockSelfCareByDay.mockResolvedValue({});

    const withoutCare = await calculateBurnoutScore();

    expect(withCare.breakdown.chronic).toBeLessThan(withoutCare.breakdown.chronic);
  });

  test('the chronic penalty caps at 20', async () => {
    mockStats.mockResolvedValue(stats({ studyMinutes: 720 }));
    mockDailyTotals.mockResolvedValue(
      history({ 1: 720, 2: 720, 3: 720, 4: 720, 5: 720, 6: 720 })
    );
    const result = await calculateBurnoutScore();
    expect(result.breakdown.chronic).toBe(20);
  });
});

describe('calculateBurnoutScore — efficacy and the gate', () => {
  test('finishing every session on a light day earns the full bonus', async () => {
    mockStats.mockResolvedValue(
      stats({ studyMinutes: 120, focusStarted: 4, focusCompleted: 4 })
    );
    const result = await calculateBurnoutScore();

    expect(result.breakdown.efficacy).toBeCloseTo(12, 5);
    expect(result.score).toBe(77);
    expect(result.status).toBe('engaged');
  });

  test('abandoning half the sessions halves the bonus', async () => {
    mockStats.mockResolvedValue(
      stats({ studyMinutes: 120, focusStarted: 4, focusCompleted: 2 })
    );
    const result = await calculateBurnoutScore();
    expect(result.breakdown.efficacy).toBeCloseTo(6, 5);
  });

  test('one session alone is not enough data to earn the bonus', async () => {
    mockStats.mockResolvedValue(
      stats({ studyMinutes: 60, focusStarted: 1, focusCompleted: 1 })
    );
    const result = await calculateBurnoutScore();

    expect(result.breakdown.efficacy).toBe(0);
    expect(result.score).toBe(65);
  });

  test('being productive does not offset an exhausting day - Overextended', async () => {
    mockStats.mockResolvedValue(
      stats({ studyMinutes: 510, focusStarted: 8, focusCompleted: 8 })
    );
    const result = await calculateBurnoutScore();

    expect(result.breakdown.exhaustion).toBe(30);
    expect(result.breakdown.efficacy).toBeCloseTo(3, 5); 
    expect(result.score).toBe(38);
    expect(result.status).toBe('overextended');
  });
});

describe('calculateBurnoutScore — the scenario from README', () => {
  test('8.5 hours with no breaks and no self-care scores 31 (Overextended)', async () => {
    mockStats.mockResolvedValue(
      stats({ studyMinutes: 510, focusStarted: 9, focusCompleted: 9 })
    );
    mockDailyTotals.mockResolvedValue(
      history({ 1: 510, 2: 510, 3: 510, 4: 240, 5: 240, 6: 0 })
    );

    const result = await calculateBurnoutScore();

    expect(result.breakdown.effectiveLoad).toBe(8.5);
    expect(result.breakdown.exhaustion).toBe(30);
    expect(result.breakdown.chronic).toBeCloseTo(7, 5);
    expect(result.breakdown.efficacy).toBeCloseTo(3, 5);
    expect(result.score).toBe(31);
    expect(result.status).toBe('overextended');
  });
});

describe('calculateBurnoutScore — range', () => {
  test('the best possible day reaches 99, no need to clamp', async () => {
    mockStats.mockResolvedValue(
      stats({ breakMinutes: 60, focusStarted: 4, focusCompleted: 4 })
    );
    mockSelfCareCounts.mockResolvedValue({ sleep: 2, move: 2 });
    mockMoodsToday.mockResolvedValue(['great']);

    const result = await calculateBurnoutScore();
    expect(result.score).toBe(99);
    expect(result.status).toBe('engaged');
  });

  test('the worst possible day (-11) clamps to 0 and lands in Burnout', async () => {
    mockStats.mockResolvedValue(
      stats({ studyMinutes: 720, focusStarted: 5, focusCompleted: 0 })
    );
    mockDailyTotals.mockResolvedValue(
      history({ 1: 720, 2: 720, 3: 720, 4: 720, 5: 720, 6: 720 })
    );
    mockMoodsToday.mockResolvedValue(['exhausted']);

    const result = await calculateBurnoutScore();
    expect(result.score).toBe(0);                   
    expect(result.status).toBe('burnout');
  });

  test('the score is always a whole number between 0 and 100', async () => {
    mockStats.mockResolvedValue(
      stats({ studyMinutes: 9999, breakMinutes: 9999, focusStarted: 50, focusCompleted: 50 })
    );
    mockSelfCareCounts.mockResolvedValue({ sleep: 99 });
    mockMoodsToday.mockResolvedValue(['great']);

    const result = await calculateBurnoutScore();
    expect(Number.isInteger(result.score)).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe('calculateBurnoutScore — factors', () => {
  test('picks the biggest reasons, in order of size', async () => {
    mockStats.mockResolvedValue(
      stats({ studyMinutes: 510, focusStarted: 9, focusCompleted: 9 })
    );
    mockDailyTotals.mockResolvedValue(
      history({ 1: 510, 2: 510, 3: 510, 4: 240, 5: 240, 6: 0 })
    );

    const result = await calculateBurnoutScore();
    expect(result.factors).toEqual([
      'Very heavy study load today',
      'Barely any breaks today',
      'Load creeping up this week',
    ]);
  });

  test('never returns more than 3 factors', async () => {
    mockStats.mockResolvedValue(stats({ studyMinutes: 510 }));
    mockDailyTotals.mockResolvedValue(
      history({ 1: 360, 2: 360, 3: 360, 4: 360, 5: 360, 6: 360 })
    );
    mockMoodsToday.mockResolvedValue(['exhausted']);

    const result = await calculateBurnoutScore();
    expect(result.factors).toHaveLength(3);
  });

  test('a moderate day reads as a long study day, not a very heavy one', async () => {
    mockStats.mockResolvedValue(stats({ studyMinutes: 360 }));
    const result = await calculateBurnoutScore();
    expect(result.factors).toContain('Long study day');
    expect(result.factors).not.toContain('Very heavy study load today');
  });

  test('good behaviour shows up as positive factors', async () => {
    mockStats.mockResolvedValue(stats({ breakMinutes: 45 }));
    mockSelfCareCounts.mockResolvedValue({ sleep: 3 });
    mockMoodsToday.mockResolvedValue(['great']);

    const result = await calculateBurnoutScore();
    expect(result.factors).toContain('Great self-care 🌿');
    expect(result.factors).toContain('Feeling good lately');
  });
});

describe('calculateBurnoutScore — data fetching', () => {
  test('fetches every source exactly once', async () => {
    await calculateBurnoutScore();
    expect(mockStats).toHaveBeenCalledTimes(1);
    expect(mockDailyTotals).toHaveBeenCalledTimes(1);
    expect(mockSelfCareCounts).toHaveBeenCalledTimes(1);
    expect(mockSelfCareByDay).toHaveBeenCalledTimes(1);
    expect(mockMoodsToday).toHaveBeenCalledTimes(1);
    expect(mockMoodsByDay).toHaveBeenCalledTimes(1);
  });

  test('asks for a 7-day window of history', async () => {
    await calculateBurnoutScore();
    expect(mockDailyTotals).toHaveBeenCalledWith(7);
    expect(mockSelfCareByDay).toHaveBeenCalledWith(7);
  });
});