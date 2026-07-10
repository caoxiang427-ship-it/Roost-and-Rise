/*
 * Integration tests for getSelfCareFrequency.
 * The query joins selfcare_categories, so mocked rows carry a nested category object.
*/

import { supabase } from '../src/lib/supabase';

jest.mock('../src/lib/supabase');

import { getSelfCareFrequency } from '../src/lib/analytics';

const mockedSupabase = supabase as any;

let chain: any;

function mockQuery(rows: any[]) {
  chain = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    gte: jest.fn(() => Promise.resolve({ data: rows, error: null })),
  };
  return chain;
}

function row(categoryId: string, label: string, icon: string) {
  return {
    category_id: categoryId,
    selfcare_categories: { label, icon },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedSupabase.auth = {
    getUser: jest.fn(async () => ({ data: { user: { id: 'test-user' } } })),
  };
});

describe('getSelfCareFrequency — counting and sorting', () => {
  test('counts logs per category', async () => {
    const rows = [
      row('sleep', 'Sleep', 'moon-outline'),
      row('sleep', 'Sleep', 'moon-outline'),
      row('ex', 'Exercise', 'barbell-outline'),
    ];
    mockedSupabase.from = jest.fn(() => mockQuery(rows));

    const result = await getSelfCareFrequency('week');
    const sleep = result.find(c => c.label == 'Sleep');
    const exercise = result.find(c => c.label == 'Exercise');

    expect(sleep?.count).toBe(2);
    expect(exercise?.count).toBe(1);
  });

  test('sorts categories by count, highest first', async () => {
    const rows = [
      row('ex', 'Exercise', 'barbell-outline'),
      row('sleep', 'Sleep', 'moon-outline'),
      row('sleep', 'Sleep', 'moon-outline'),
      row('sleep', 'Sleep', 'moon-outline'),
    ];
    mockedSupabase.from = jest.fn(() => mockQuery(rows));

    const result = await getSelfCareFrequency('week');
    expect(result[0].label).toBe('Sleep');    
    expect(result[1].label).toBe('Exercise');
  });

  test('returns the icon from joined category', async () => {
    mockedSupabase.from = jest.fn(() => mockQuery([row('sleep', 'Sleep', 'moon-outline')]));
    const result = await getSelfCareFrequency('week');
    expect(result[0].icon).toBe('moon-outline');
  });

  test('skips rows whose category join is missing', async () => {
    const rows = [
      row('sleep', 'Sleep', 'moon-outline'),
      { category_id: 'orphan', selfcare_categories: null },
    ];
    mockedSupabase.from = jest.fn(() => mockQuery(rows));

    const result = await getSelfCareFrequency('week');
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Sleep');
  });

  test('returns an empty array when there are no logs', async () => {
    mockedSupabase.from = jest.fn(() => mockQuery([]));
    const result = await getSelfCareFrequency('week');
    expect(result).toEqual([]);
  });
});

describe('getSelfCareFrequency — query correctness', () => {
  test('queries the selfcare_logs table and filters by the signed-in user', async () => {
    mockedSupabase.from = jest.fn(() => mockQuery([]));
    await getSelfCareFrequency('week');

    expect(mockedSupabase.from).toHaveBeenCalledWith('selfcare_logs');
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'test-user');
  });
});

describe('getSelfCareFrequency — not signed in', () => {
  test('returns an empty array when there is no user', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    const result = await getSelfCareFrequency('week');
    expect(result).toEqual([]);
  });
});
