/*
 * Unit tests for getInsights: the three input-driven insight rules:
 * mood trend direction, best study day, and study streak.
 * The correlation and neglected-category rules query Supabase directly
 * and are covered at the integration tier
 * Here, the mocked client returns no rows, so those two rules simply do not fire.
*/

jest.mock('../src/lib/supabase');

import { getInsights } from '../src/lib/analytics';
import type { DailyMood, DailySession, CategoryCount } from '../src/lib/analytics';

// build one mood object
function mood(value: number, i: number): DailyMood {
  const d = new Date(2026, 0, i + 1); // arbitrary distinct days
  return {
    date: `D${i}`,
    dateKey: d.toDateString(),
    value,
    raw: value === 0 ? '' : 'x',
  };
}

// build an array of mood objects
function moods(values: number[]): DailyMood[] {
  return values.map((v, i) => mood(v, i));
}

function session(count: number, i: number): DailySession {
  return { date: `D${i}`, count, minutes: count * 25 };
}

function sessions(counts: number[]): DailySession[] {
  return counts.map((c, i) => session(c, i));
}

const noSessions: DailySession[] = [];
const noSelfCare: CategoryCount[] = [];
const noMood: DailyMood[] = [];

// helper: does any insight's text contain a phrase?
function hasText(insights: { text: string }[], phrase: string): boolean {
  return insights.some(i => i.text.toLowerCase().includes(phrase.toLowerCase()));
}

describe('getInsights — mood trend', () => {
  test('rising mood produces an "improving" insight', async () => {
    // first half low, second half clearly higher
    const data = moods([2, 2, 4, 5]);
    const insights = await getInsights(data, noSessions, noSelfCare);
    expect(hasText(insights, 'improving')).toBe(true);
  });

  test('falling mood produces a "dipping" insight', async () => {
    const data = moods([5, 4, 2, 2]);
    const insights = await getInsights(data, noSessions, noSelfCare);
    expect(hasText(insights, 'dipping')).toBe(true);
  });

  test('flat mid mood produces a "steady" insight', async () => {
    const data = moods([3, 3, 3, 3]);
    const insights = await getInsights(data, noSessions, noSelfCare);
    expect(hasText(insights, 'steady')).toBe(true);
  });

  test('sustained low + flat mood gives the compassionate message, NOT "steady"', async () => {
    // average <= 2, no rise or fall
    const data = moods([2, 1, 2, 1]);
    const insights = await getInsights(data, noSessions, noSelfCare);
    expect(hasText(insights, 'feeling low')).toBe(true);
    expect(hasText(insights, 'steady')).toBe(false);
  });

  test('fewer than 3 logged days produces no mood-trend insight', async () => {
    const data = moods([3, 4]); // only 2 logged days
    const insights = await getInsights(data, noSessions, noSelfCare);
    expect(hasText(insights, 'improving')).toBe(false);
    expect(hasText(insights, 'dipping')).toBe(false);
    expect(hasText(insights, 'steady')).toBe(false);
    expect(hasText(insights, 'feeling low')).toBe(false);
  });

  test('days with value 0 (no log) are ignored in the trend', async () => {
    // only three real logged days, rest are empty days
    const data = moods([0, 2, 0, 2, 0, 5]);
    const insights = await getInsights(data, noSessions, noSelfCare);
    // three logged values [2,2,5] should be "improving"
    expect(hasText(insights, 'improving')).toBe(true);
  });
});

describe('getInsights — best study day', () => {
  test('fires when the best day has more than 2 sessions', async () => {
    const data = sessions([1, 3, 0, 0]); // best day has 3
    const insights = await getInsights(noMood, data, noSelfCare);
    expect(hasText(insights, 'productive day')).toBe(true);
  });

  test('does not fire when the best day has only 2 sessions', async () => {
    const data = sessions([2, 1, 0]); // best is 2, threshold is > 2
    const insights = await getInsights(noMood, data, noSelfCare);
    expect(hasText(insights, 'productive day')).toBe(false);
  });

  test('does not fire when there are no sessions', async () => {
    const insights = await getInsights(noMood, noSessions, noSelfCare);
    expect(hasText(insights, 'productive day')).toBe(false);
  });
});

describe('getInsights — study streak', () => {
  test('fires at 3 consecutive days from the end', async () => {
    const data = sessions([0, 1, 1, 1]); // last 3 days all have sessions
    const insights = await getInsights(noMood, data, noSelfCare);
    expect(hasText(insights, 'in a row')).toBe(true);
  });

  test('does not fire at only 2 consecutive days', async () => {
    const data = sessions([0, 0, 1, 1]);
    const insights = await getInsights(noMood, data, noSelfCare);
    expect(hasText(insights, 'in a row')).toBe(false);
  });

  test('breaks the streak on a gap', async () => {
    const data = sessions([1, 1, 1, 0, 1]);
    const insights = await getInsights(noMood, data, noSelfCare);
    expect(hasText(insights, 'in a row')).toBe(false);
  });
});

describe('getInsights — health suggestions', () => {
  test('every returned insight carries a non-empty suggestion', async () => {
    const data = moods([2, 2, 4, 5]); // guarantees at least one insight
    const insights = await getInsights(data, sessions([3, 3, 3]), noSelfCare);

    expect(insights.length).toBeGreaterThan(0);

    for (const ins of insights) {
      expect(typeof ins.suggestion).toBe('string');
      expect(ins.suggestion.length).toBeGreaterThan(0);
    }
  });
});
