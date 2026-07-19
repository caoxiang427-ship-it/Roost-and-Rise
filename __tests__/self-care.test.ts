/*
 * Integration tests for the self-care and mood helpers.
*/

import { supabase } from '../src/lib/supabase';

import {
  addCategory,
  deleteCategory,
  getMoodsByDay,
  getSelfCareCountsByDay,
  getTodayLogEntries,
  getTodaySelfCareCounts,
  getTodaysMood,
  getTodaysMoods,
  getUserCategories,
  hasLoggedMoodToday,
  logSelfCare,
} from '../src/lib/self-care';

jest.mock('../src/lib/supabase');

const mockedSupabase = supabase as any;

function mockChain(terminal: string, result: any) {
  const chain: any = {};
  for (const m of ['select', 'eq', 'gte', 'order', 'limit', 'update']) {
    chain[m] = m === terminal
      ? jest.fn(() => Promise.resolve(result))
      : jest.fn(() => chain);
  }
  return chain;
}

function dayKey(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toDateString();
}

function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

let insertMock: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  insertMock = jest.fn(() => Promise.resolve({ data: null, error: null }));
  mockedSupabase.auth = {
    getUser: jest.fn(async () => ({ data: { user: { id: 'test-user' } } })),
  };
});

describe('logSelfCare — write', () => {
  beforeEach(() => {
    mockedSupabase.from = jest.fn(() => ({ insert: insertMock }));
  });

  test('inserts into the selfcare_logs table', async () => {
    await logSelfCare('cat-1');
    expect(mockedSupabase.from).toHaveBeenCalledWith('selfcare_logs');
  });

  test('inserts the category id and the activity note', async () => {
    await logSelfCare('cat-1', 'Went for a run');
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'test-user',
      category_id: 'cat-1',
      activity: 'Went for a run',
      amount: null,
    });
  });

  test('stores null when no activity note is given', async () => {
    await logSelfCare('cat-1');
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'test-user',
      category_id: 'cat-1',
      activity: null,
      amount: null,
    });
  });

  test('returns an error and does not insert when not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };

    const result = await logSelfCare('cat-1');
    expect(result).toEqual({ error: 'Not signed in' });
    expect(insertMock).not.toHaveBeenCalled();
  });
});

describe('getTodaySelfCareCounts', () => {
  test('counts logs per category', async () => {
    const rows = [
      { category_id: 'sleep' },
      { category_id: 'sleep' },
      { category_id: 'exercise' },
    ];

    mockedSupabase.from = jest.fn(() => mockChain('gte', { data: rows, error: null }));

    const result = await getTodaySelfCareCounts();
    expect(result).toEqual({ sleep: 2, exercise: 1 });
  });

  test('returns an empty object when there are no logs', async () => {
    mockedSupabase.from = jest.fn(() => mockChain('gte', { data: [], error: null }));
    const result = await getTodaySelfCareCounts();
    expect(result).toEqual({});
  });

  test('returns an empty object when not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    const result = await getTodaySelfCareCounts();
    expect(result).toEqual({});
  });
});

describe('getUserCategories', () => {
  test('returns the active categories in display order', async () => {
    const rows = [
      { id: '1', label: 'Sleep', icon: 'moon-outline', display_order: 1 },
      { id: '2', label: 'Exercise', icon: 'barbell-outline', display_order: 2 },
    ];
    mockedSupabase.from = jest.fn(() => mockChain('order', { data: rows, error: null }));

    const result = await getUserCategories();
    expect(result).toHaveLength(2);
    expect(result[0].label).toBe('Sleep');
  });

  test('queries the selfcare_categories table', async () => {
    mockedSupabase.from = jest.fn(() => mockChain('order', { data: [], error: null }));
    await getUserCategories();
    expect(mockedSupabase.from).toHaveBeenCalledWith('selfcare_categories');
  });

  test('returns an empty array when not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    const result = await getUserCategories();
    expect(result).toEqual([]);
  });
});

describe('getTodaysMood', () => {
  test('returns the latest mood logged today', async () => {
    mockedSupabase.from = jest.fn(() =>
      mockChain('limit', { data: [{ mood: 'great' }], error: null })
    );
    const result = await getTodaysMood();
    expect(result).toBe('great');
  });

  test('returns null when no mood is logged today', async () => {
    mockedSupabase.from = jest.fn(() => mockChain('limit', { data: [], error: null }));
    const result = await getTodaysMood();
    expect(result).toBeNull();
  });

  test('returns null when not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    const result = await getTodaysMood();
    expect(result).toBeNull();
  });
});

describe('hasLoggedMoodToday', () => {
  test('returns true when a mood row exists for today', async () => {
    mockedSupabase.from = jest.fn(() =>
      mockChain('limit', { data: [{ id: 'x' }], error: null })
    );
    const result = await hasLoggedMoodToday();
    expect(result).toBe(true);
  });

  test('returns false when no mood row exists for today', async () => {
    mockedSupabase.from = jest.fn(() => mockChain('limit', { data: [], error: null }));
    const result = await hasLoggedMoodToday();
    expect(result).toBe(false);
  });

  test('returns false when not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    const result = await hasLoggedMoodToday();
    expect(result).toBe(false);
  });
});

describe('deleteCategory', () => {
  test('marks the category as inactive rather than deleting the row', async () => {
    const updateMock = jest.fn(() => chain);
    const chain: any = {
      update: updateMock,
      eq: jest.fn(() => chain),
    };

    mockedSupabase.from = jest.fn(() => chain);

    await deleteCategory('cat-1');
    expect(updateMock).toHaveBeenCalledWith({ is_active: false });
  });

  test('returns an error when not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    const result = await deleteCategory('cat-1');
    expect(result).toEqual({ error: 'Not signed in' });
  });
});

describe('getTodayLogEntries', () => {
  test('returns the log entries for today', async () => {
    const rows = [
      { id: '1', category_id: 'sleep', activity: 'Napped', logged_at: '2026-07-10T18:00:00Z' },
      { id: '2', category_id: 'ex', activity: null, logged_at: '2026-07-10T12:00:00Z' },
    ];
    mockedSupabase.from = jest.fn(() => mockChain('order', { data: rows, error: null }));

    const result = await getTodayLogEntries();
    
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
  });

  test('returns an empty array when there are no entries', async () => {
    mockedSupabase.from = jest.fn(() => mockChain('order', { data: [], error: null }));
    const result = await getTodayLogEntries();
    expect(result).toEqual([]);
  });

  test('returns an empty array when not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    const result = await getTodayLogEntries();
    expect(result).toEqual([]);
  });
});

describe('addCategory — write', () => {
  test('assigns display_order 1 when the user has no categories yet', async () => {
    const insertMock = jest.fn(() => Promise.resolve({ data: null, error: null }));
    
    const readChain: any = {
      select: jest.fn(() => readChain),
      eq: jest.fn(() => readChain),
      order: jest.fn(() => readChain),
      limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
    };

    mockedSupabase.from = jest.fn()
      .mockReturnValueOnce(readChain)
      .mockReturnValueOnce({ insert: insertMock });

    await addCategory('Journal', 'book-outline');
    
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'test-user',
      label: 'Journal',
      icon: 'book-outline',
      display_order: 1,
    });
  });

  test('places the new category after the existing highest display_order', async () => {
    const insertMock = jest.fn(() => Promise.resolve({ data: null, error: null }));
    
    const readChain: any = {
      select: jest.fn(() => readChain),
      eq: jest.fn(() => readChain),
      order: jest.fn(() => readChain),
      limit: jest.fn(() => Promise.resolve({ data: [{ display_order: 6 }], error: null })),
    };
    
    mockedSupabase.from = jest.fn()
      .mockReturnValueOnce(readChain)
      .mockReturnValueOnce({ insert: insertMock });

    await addCategory('Breathe', 'pulse-outline');
    
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ display_order: 7 })
    );
  });

  test('returns an error when not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    const result = await addCategory('Journal', 'book-outline');
    expect(result).toEqual({ error: 'Not signed in' });
  });
});

describe('getTodaysMoods', () => {
  test('returns every mood logged today (newest first)', async () => {
    const rows = [{ mood: 'great' }, { mood: 'okay' }, { mood: 'stressed' }];
    mockedSupabase.from = jest.fn(() => mockChain('order', { data: rows, error: null }));

    const result = await getTodaysMoods();
    expect(result).toEqual(['great', 'okay', 'stressed']);
  });

  test('returns all moods where the singular version (getTodaysMood) returns only the latest', async () => {
    const rows = [{ mood: 'great' }, { mood: 'exhausted' }];
    mockedSupabase.from = jest.fn(() => mockChain('order', { data: rows, error: null }));
    expect(await getTodaysMoods()).toHaveLength(2);

    mockedSupabase.from = jest.fn(() => mockChain('limit', { data: rows, error: null }));
    expect(await getTodaysMood()).toBe('great');
  });

  test('returns an empty array when nothing was logged today', async () => {
    mockedSupabase.from = jest.fn(() => mockChain('order', { data: [], error: null }));
    expect(await getTodaysMoods()).toEqual([]);
  });

  test('returns an empty array on a query error', async () => {
    mockedSupabase.from = jest.fn(() =>
      mockChain('order', { data: null, error: { message: 'boom' } })
    );
    expect(await getTodaysMoods()).toEqual([]);
  });

  test('returns an empty array when users not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    expect(await getTodaysMoods()).toEqual([]);
  });
});

describe('getMoodsByDay', () => {
  test('groups moods under the day they were logged', async () => {
    const rows = [
      { mood: 'great', logged_at: isoDaysAgo(1) },
      { mood: 'okay', logged_at: isoDaysAgo(1) },
      { mood: 'exhausted', logged_at: isoDaysAgo(2) },
    ];
    mockedSupabase.from = jest.fn(() => mockChain('gte', { data: rows, error: null }));

    const result = await getMoodsByDay(4);
    expect(result[dayKey(1)]).toEqual(['great', 'okay']);
    expect(result[dayKey(2)]).toEqual(['exhausted']);
  });

  test('days with no moods are absent rather than empty', async () => {
    const rows = [{ mood: 'good', logged_at: isoDaysAgo(1) }];
    mockedSupabase.from = jest.fn(() => mockChain('gte', { data: rows, error: null }));

    const result = await getMoodsByDay(4);
    expect(result[dayKey(3)]).toBeUndefined();
  });

  test('returns an empty object when there are no moods', async () => {
    mockedSupabase.from = jest.fn(() => mockChain('gte', { data: [], error: null }));
    expect(await getMoodsByDay(4)).toEqual({});
  });

  test('returns an empty object when users not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    expect(await getMoodsByDay(4)).toEqual({});
  });
});

describe('getSelfCareCountsByDay', () => {
  test('counts logs per day', async () => {
    const rows = [
      { logged_at: isoDaysAgo(1) },
      { logged_at: isoDaysAgo(1) },
      { logged_at: isoDaysAgo(1) },
      { logged_at: isoDaysAgo(4) },
    ];
    mockedSupabase.from = jest.fn(() => mockChain('gte', { data: rows, error: null }));

    const result = await getSelfCareCountsByDay(7);
    expect(result[dayKey(1)]).toBe(3);
    expect(result[dayKey(4)]).toBe(1);
  });

  test('queries the selfcare_logs table', async () => {
    mockedSupabase.from = jest.fn(() => mockChain('gte', { data: [], error: null }));
    await getSelfCareCountsByDay(7);
    expect(mockedSupabase.from).toHaveBeenCalledWith('selfcare_logs');
  });

  test('returns an empty object when there are no logs', async () => {
    mockedSupabase.from = jest.fn(() => mockChain('gte', { data: [], error: null }));
    expect(await getSelfCareCountsByDay(7)).toEqual({});
  });

  test('returns an empty object when users not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    expect(await getSelfCareCountsByDay(7)).toEqual({});
  });
});