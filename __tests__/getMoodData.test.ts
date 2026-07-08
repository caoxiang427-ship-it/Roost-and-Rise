/*
 * Integration tests for getMoodData.
 * Supabase client is mocked to return fake data
 * Allowing us to verify mood mapping, daily grouping, missing-day handling & correct week/month ranges.
*/

import { supabase } from '../src/lib/supabase';

jest.mock('../src/lib/supabase');

import { getMoodData } from '../src/lib/analytics';

const mockedSupabase = supabase as any;

// Build a mock query that returns the given rows
// real: supabase.from('mood_logs').select(...).eq(...).gte(...).order(...)
function mockQuery(rows: any[]) {
  const chain: any = {
    select: jest.fn(() => chain), // returns chain, so can call .eq next
    eq: jest.fn(() => chain),
    gte: jest.fn(() => chain),
    order: jest.fn(() => Promise.resolve({ data: rows, error: null })), // ends the chain
  };
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
  // a signed-in user by default
  mockedSupabase.auth = {
    getUser: jest.fn(async () => ({ data: { user: { id: 'test-user' } } })),
  };
});

describe('getMoodData — mood string to number mapping', () => {
  test('maps each mood string to its correct number', async () => {
    // N days ago
    const now = new Date();
    const iso = (daysAgo: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString();
    };

    const rows = [
      { mood: 'exhausted', logged_at: iso(4) },
      { mood: 'okay', logged_at: iso(3) },
      { mood: 'great', logged_at: iso(0) },
    ];

    mockedSupabase.from = jest.fn(() => mockQuery(rows));

    const result = await getMoodData('week');

    // find the entries by their dateKey and check the mapped value
    const byKey = Object.fromEntries(result.map(r => [r.dateKey, r.value]));

    expect(byKey[new Date(iso(4)).toDateString()]).toBe(1); // exhausted
    expect(byKey[new Date(iso(3)).toDateString()]).toBe(3); // okay
    expect(byKey[new Date(iso(0)).toDateString()]).toBe(5); // great
  });
});

describe('getMoodData — same-day grouping', () => {
  test('when a day has multiple logs, the latest one wins', async () => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(9, 0, 0, 0);
    const laterToday = new Date(now);
    laterToday.setHours(18, 0, 0, 0);

    const rows = [
      { mood: 'okay',  logged_at: today.toISOString() },
      { mood: 'great', logged_at: laterToday.toISOString() },
    ];

    mockedSupabase.from = jest.fn(() => mockQuery(rows));

    const result = await getMoodData('week');

    const todayEntry = result.find(r => r.dateKey == today.toDateString());

    expect(todayEntry?.value).toBe(5);
  });
});

describe('getMoodData — gap filling and range length', () => {
  test('week mode returns 7 entries even with no logs', async () => {
    mockedSupabase.from = jest.fn(() => mockQuery([]));
    const result = await getMoodData('week');
    expect(result).toHaveLength(7);
  });

  test('month mode returns 30 entries even with no logs', async () => {
    mockedSupabase.from = jest.fn(() => mockQuery([]));
    const result = await getMoodData('month');
    expect(result).toHaveLength(30);
  });

  test('days with no log have value 0 (not a neutral fallback)', async () => {
    mockedSupabase.from = jest.fn(() => mockQuery([]));
    const result = await getMoodData('week');
    expect(result.every(r => r.value == 0)).toBe(true);
  });
});

describe('getMoodData — not signed in', () => {
  test('returns an empty array when there is no user', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };

    const result = await getMoodData('week');
    expect(result).toEqual([]);
  });
});
