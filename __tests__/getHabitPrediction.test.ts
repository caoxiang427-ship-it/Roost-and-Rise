/*
 * Integration tests for getHabitPrediction.
 * The result depends on "today"
*/

import { supabase } from '../src/lib/supabase';

jest.mock('../src/lib/supabase');

import { getHabitPrediction } from '../src/lib/analytics';

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

// Fixed "today" for all tests: Wed 15 July 2026, mid day
const FIXED_NOW = new Date(2026, 6, 15, 12, 0, 0);

function log(daysAgo: number, categoryId: string, label: string, icon: string) {
  const d = new Date(FIXED_NOW);
  d.setDate(d.getDate() - daysAgo);
  
  return {
    logged_at: d.toISOString(),
    category_id: categoryId,
    selfcare_categories: { label, icon },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(FIXED_NOW);   
  mockedSupabase.auth = {
    getUser: jest.fn(async () => ({ data: { user: { id: 'test-user' } } })),
  };
});

afterEach(() => {
  jest.useRealTimers();            
});

describe('getHabitPrediction — streaks', () => {
  test('counts a streak from today when today is logged', async () => {
    const rows = [ 
      log(2, 'sleep', 'Sleep', 'moon-outline'),
      log(1, 'sleep', 'Sleep', 'moon-outline'),
      log(0, 'sleep', 'Sleep', 'moon-outline'),
    ];
    mockedSupabase.from = jest.fn(() => mockQuery(rows));

    const { streaks } = await getHabitPrediction();
    const sleep = streaks.find(s => s.label === 'Sleep');
    
    expect(sleep?.streak).toBe(3);
    expect(sleep?.atRisk).toBe(false); 
  });

  test('counts from yesterday when today is not logged', async () => {
    const rows = [
      log(2, 'sleep', 'Sleep', 'moon-outline'),
      log(1, 'sleep', 'Sleep', 'moon-outline'),
    ];
    mockedSupabase.from = jest.fn(() => mockQuery(rows));

    const { streaks } = await getHabitPrediction();
    const sleep = streaks.find(s => s.label === 'Sleep');
    
    expect(sleep?.streak).toBe(2);
  });

  test('at-risk is true for a 3+ streak not logged today', async () => {
    const rows = [
      log(3, 'sleep', 'Sleep', 'moon-outline'),
      log(2, 'sleep', 'Sleep', 'moon-outline'),
      log(1, 'sleep', 'Sleep', 'moon-outline'), 
    ];
    mockedSupabase.from = jest.fn(() => mockQuery(rows));

    const { streaks } = await getHabitPrediction();
    const sleep = streaks.find(s => s.label === 'Sleep');
    
    expect(sleep?.streak).toBe(3);
    expect(sleep?.atRisk).toBe(true); 
  });

  test('a streak of only 1 day is not returned (min is 2)', async () => {
    const rows = [log(0, 'sleep', 'Sleep', 'moon-outline')];
    mockedSupabase.from = jest.fn(() => mockQuery(rows));

    const { streaks } = await getHabitPrediction();
    expect(streaks.find(s => s.label === 'Sleep')).toBeUndefined();
  });

  test('a gap breaks the streak', async () => {
    const rows = [
      log(3, 'sleep', 'Sleep', 'moon-outline'),
      log(0, 'sleep', 'Sleep', 'moon-outline'),
    ];
    mockedSupabase.from = jest.fn(() => mockQuery(rows));

    const { streaks } = await getHabitPrediction();
  
    expect(streaks.find(s => s.label === 'Sleep')).toBeUndefined();
  });
});

describe('getHabitPrediction — day-of-week patterns', () => {
  test('a weekday logged at least twice becomes a pattern', async () => {
    const rows = [
      log(0, 'ex', 'Exercise', 'barbell-outline'), // Wed
      log(7, 'ex', 'Exercise', 'barbell-outline'), // Wed
      log(2, 'ex', 'Exercise', 'barbell-outline'), // Mon
      log(9, 'ex', 'Exercise', 'barbell-outline'), // Mon
    ];
    mockedSupabase.from = jest.fn(() => mockQuery(rows));

    const { patterns } = await getHabitPrediction();
    const ex = patterns.find(p => p.label === 'Exercise');
    
    expect(ex).toBeDefined();
    
    expect(ex?.days).toEqual(expect.arrayContaining(['Mon', 'Wed']));
  });

  test('a weekday logged only once does not form a pattern', async () => {
    const rows = [
      log(0, 'ex', 'Exercise', 'barbell-outline'), // Wed
      log(1, 'ex', 'Exercise', 'barbell-outline'), // Tue
      log(3, 'ex', 'Exercise', 'barbell-outline'), // Sun
    ];
    mockedSupabase.from = jest.fn(() => mockQuery(rows));

    const { patterns } = await getHabitPrediction();
    expect(patterns.find(p => p.label === 'Exercise')).toBeUndefined();
  });
});

describe('getHabitPrediction — empty / not signed in', () => {
  test('returns empty streaks and patterns when there are no logs', async () => {
    mockedSupabase.from = jest.fn(() => mockQuery([]));
    const result = await getHabitPrediction();
    expect(result).toEqual({ streaks: [], patterns: [] });
  });

  test('returns empty when there is no user', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    const result = await getHabitPrediction();
    expect(result).toEqual({ streaks: [], patterns: [] });
  });
});
