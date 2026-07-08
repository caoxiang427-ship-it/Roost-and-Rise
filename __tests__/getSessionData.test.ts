/*
 * Integration tests for getSessionData (similar logic to getMoodData).
 * The query already filters for focus sessions and excludes cancelled ones
 * This test verifies only the data transformation.
*/

import { supabase } from '../src/lib/supabase';

jest.mock('../src/lib/supabase');

import { getSessionData } from '../src/lib/analytics';

const mockedSupabase = supabase as any;

function mockQuery(rows: any[]) {
  const chain: any = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    gte: jest.fn(() => chain),
    order: jest.fn(() => Promise.resolve({ data: rows, error: null })),
  };
  return chain;
}

const now = new Date();
function iso(daysAgo: number, hour = 12): string {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedSupabase.auth = {
    getUser: jest.fn(async () => ({ data: { user: { id: 'test-user' } } })),
  };
});

describe('getSessionData — per-day aggregation', () => {
  test('counts sessions and sums minutes for the same day', async () => {
    // two focus sessions on one day in the week
    const rows = [
      { duration_in_min: 25, stopped_at: iso(3, 9) },
      { duration_in_min: 25, stopped_at: iso(3, 14) },
    ];
    mockedSupabase.from = jest.fn(() => mockQuery(rows));

    const result = await getSessionData('week');
    const day = result.find(d => d.date && d.count > 0);

    expect(day?.count).toBe(2);
    expect(day?.minutes).toBe(50);
  });

  test('counts separates sessions that fall on different days', async () => {
    const rows = [
      { duration_in_min: 25, stopped_at: iso(3) },
      { duration_in_min: 50, stopped_at: iso(1) },
    ];
    mockedSupabase.from = jest.fn(() => mockQuery(rows));

    const result = await getSessionData('week');
    const daysWithSessions = result.filter(d => d.count > 0);
 
    expect(daysWithSessions).toHaveLength(2);
 
    // total across both days: 2 sessions, 75 minutes
    const totalCount = result.reduce((s, d) => s + d.count, 0);
    const totalMin = result.reduce((s, d) => s + d.minutes, 0);

    expect(totalCount).toBe(2);
    expect(totalMin).toBe(75);
  });
});

describe('getSessionData — gap filling and range length', () => {
  test('week mode returns 7 entries even with no sessions', async () => {
    mockedSupabase.from = jest.fn(() => mockQuery([]));
    const result = await getSessionData('week');
    expect(result).toHaveLength(7);
  });

  test('month mode returns 30 entries', async () => {
    mockedSupabase.from = jest.fn(() => mockQuery([]));
    const result = await getSessionData('month');
    expect(result).toHaveLength(30);
  });

  test('days with no sessions have count 0 and minutes 0', async () => {
    mockedSupabase.from = jest.fn(() => mockQuery([]));
    const result = await getSessionData('week');
    expect(result.every(d => d.count == 0 && d.minutes == 0)).toBe(true);
  });
});

describe('getSessionData — not signed in', () => {
  test('returns an empty array when there is no user', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };

    const result = await getSessionData('week');
    expect(result).toEqual([]);
  });
});
