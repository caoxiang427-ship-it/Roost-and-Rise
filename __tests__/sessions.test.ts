/*
 * Integration tests for the session helpers.
 * Supabase is mocked. 
 * sessionRecorder is a write helper, so we verify that it sends the correct payload.
 * The remaining helpers read session data, so we mock the query result and verfiy
 * that the returned value is computed correctly. 
*/

import { supabase } from '../src/lib/supabase';

import {
  getRecentDailyTotals,
  getTodaysBreakCount,
  getTodaySessionStats,
  getTodaysFocusSessionCount,
  getTodayStudyMinutes,
  sessionRecorder,
} from '../src/lib/sessions';

jest.mock('../src/lib/supabase');

const mockedSupabase = supabase as any;

function mockDataQuery(rows: any[]) {
  const chain: any = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    gte: jest.fn(() => Promise.resolve({ data: rows, error: null })),
  };
  return chain;
}

function mockCountQuery(count: number) {
  const chain: any = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    gte: jest.fn(() => Promise.resolve({ count, error: null })),
  };
  return chain;
}

function mockErrorQuery() {
  const chain: any = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    gte: jest.fn(() => Promise.resolve({ data: null, error: { message: 'boom' } })),
  };
  return chain;
}

function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function dayKey(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toDateString();
}

let insertMock: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  insertMock = jest.fn(() => Promise.resolve({ data: null, error: null }));
  mockedSupabase.auth = {
    getUser: jest.fn(async () => ({ data: { user: { id: 'test-user' } } })),
  };
});

describe('sessionRecorder — write', () => {
  beforeEach(() => {
    mockedSupabase.from = jest.fn(() => ({ insert: insertMock }));
  });

  test('inserts into the sessions table', async () => {
    await sessionRecorder(25, 'focus');
    expect(mockedSupabase.from).toHaveBeenCalledWith('sessions');
  });

  test('inserts the correct payload for a completed focus session', async () => {
    await sessionRecorder(25, 'focus');
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'test-user',
      duration_in_min: 25,
      type_of_session: 'focus',
      was_cancelled: false,
    });
  });

  test('records a cancelled session when wasCancelled is true', async () => {
    await sessionRecorder(12, 'focus', true);
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'test-user',
      duration_in_min: 12,
      type_of_session: 'focus',
      was_cancelled: true,
    });
  });

  test('records a break session', async () => {
    await sessionRecorder(5, 'break');
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'test-user',
      duration_in_min: 5,
      type_of_session: 'break',
      was_cancelled: false,
    });
  });

  test('returns an error and does not insert when not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    const result = await sessionRecorder(25, 'focus');

    expect(result).toEqual({ error: 'Not signed in' });
    expect(insertMock).not.toHaveBeenCalled();
  });
});

describe('getTodayStudyMinutes', () => {
  test('sums the duration of all focus sessions today', async () => {
    const rows = [
      { duration_in_min: 25 },
      { duration_in_min: 25 },
      { duration_in_min: 10 },
    ];
    mockedSupabase.from = jest.fn(() => mockDataQuery(rows));

    const result = await getTodayStudyMinutes();
    expect(result).toBe(60);
  });

  test('returns 0 when there are no sessions today', async () => {
    mockedSupabase.from = jest.fn(() => mockDataQuery([]));
    const result = await getTodayStudyMinutes();
    expect(result).toBe(0);
  });

  test('returns 0 when not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    const result = await getTodayStudyMinutes();
    expect(result).toBe(0);
  });
});

describe('getTodaysFocusSessionCount', () => {
  test('returns the counted number of focus sessions', async () => {
    mockedSupabase.from = jest.fn(() => mockCountQuery(3));
    const result = await getTodaysFocusSessionCount();
    expect(result).toBe(3);
  });

  test('queries the sessions table', async () => {
    mockedSupabase.from = jest.fn(() => mockCountQuery(0));
    await getTodaysFocusSessionCount();
    expect(mockedSupabase.from).toHaveBeenCalledWith('sessions');
  });

  test('returns 0 when count is null', async () => {
    mockedSupabase.from = jest.fn(() => mockCountQuery(null as any));
    const result = await getTodaysFocusSessionCount();
    expect(result).toBe(0);
  });

  test('returns 0 when not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    const result = await getTodaysFocusSessionCount();
    expect(result).toBe(0);
  });
});

describe('getTodaysBreakCount', () => {
  test('returns the counted number of break sessions', async () => {
    mockedSupabase.from = jest.fn(() => mockCountQuery(2));
    const result = await getTodaysBreakCount();
    expect(result).toBe(2);
  });

  test('returns 0 when not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    const result = await getTodaysBreakCount();
    expect(result).toBe(0);
  });
});

describe('getTodaySessionStats', () => {
  test('splits focus and break, and counts started vs completed', async () => {
    const rows = [
      { type_of_session: 'focus', duration_in_min: 25, was_cancelled: false },
      { type_of_session: 'focus', duration_in_min: 25, was_cancelled: false },
      { type_of_session: 'focus', duration_in_min: 10, was_cancelled: true },
      { type_of_session: 'break', duration_in_min: 5, was_cancelled: false },
      { type_of_session: 'break', duration_in_min: 3, was_cancelled: true },
    ];
    mockedSupabase.from = jest.fn(() => mockDataQuery(rows));

    const result = await getTodaySessionStats();
    expect(result).toEqual({
      studyMinutes: 60,     
      breakMinutes: 8,      
      focusStarted: 3,
      focusCompleted: 2,
    });
  });

  test('a cancelled focus session still counts toward study minutes', async () => {
    const rows = [{ type_of_session: 'focus', duration_in_min: 40, was_cancelled: true }];
    mockedSupabase.from = jest.fn(() => mockDataQuery(rows));

    const result = await getTodaySessionStats();
    expect(result.studyMinutes).toBe(40);
    expect(result.focusStarted).toBe(1);
    expect(result.focusCompleted).toBe(0);
  });

  test('a cancelled break still counts toward break minutes', async () => {
    const rows = [{ type_of_session: 'break', duration_in_min: 10, was_cancelled: true }];
    mockedSupabase.from = jest.fn(() => mockDataQuery(rows));

    const result = await getTodaySessionStats();
    expect(result.breakMinutes).toBe(10);
  });

  test('a day with only breaks has no study minutes and no focus sessions started', async () => {
    const rows = [{ type_of_session: 'break', duration_in_min: 15, was_cancelled: false }];
    mockedSupabase.from = jest.fn(() => mockDataQuery(rows));

    const result = await getTodaySessionStats();
    expect(result.studyMinutes).toBe(0);
    expect(result.focusStarted).toBe(0);
  });

  test('returns all zeros when there are no sessions', async () => {
    mockedSupabase.from = jest.fn(() => mockDataQuery([]));
    const result = await getTodaySessionStats();
    expect(result).toEqual({
      studyMinutes: 0, breakMinutes: 0, focusStarted: 0, focusCompleted: 0,
    });
  });

  test('returns all zeros on a query error', async () => {
    mockedSupabase.from = jest.fn(() => mockErrorQuery());
    const result = await getTodaySessionStats();
    expect(result.studyMinutes).toBe(0);
  });

  test('returns all zeros when users not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    const result = await getTodaySessionStats();
    expect(result).toEqual({
      studyMinutes: 0, breakMinutes: 0, focusStarted: 0, focusCompleted: 0,
    });
  });

  test('only filters by user, never by was_cancelled', async () => {
    const chain = mockDataQuery([]);
    mockedSupabase.from = jest.fn(() => chain);

    await getTodaySessionStats();
    expect(chain.eq).toHaveBeenCalledTimes(1);
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'test-user');
  });
});

describe('getRecentDailyTotals', () => {
  test('groups study and break minutes by day', async () => {
    const rows = [
      { type_of_session: 'focus', duration_in_min: 25, stopped_at: isoDaysAgo(1) },
      { type_of_session: 'focus', duration_in_min: 35, stopped_at: isoDaysAgo(1) },
      { type_of_session: 'break', duration_in_min: 5, stopped_at: isoDaysAgo(1) },
      { type_of_session: 'focus', duration_in_min: 50, stopped_at: isoDaysAgo(3) },
    ];
    mockedSupabase.from = jest.fn(() => mockDataQuery(rows));

    const result = await getRecentDailyTotals(7);
    expect(result[dayKey(1)]).toEqual({ studyMinutes: 60, breakMinutes: 5 });
    expect(result[dayKey(3)]).toEqual({ studyMinutes: 50, breakMinutes: 0 });
  });

  test('days with no focus sessions are not included in the result', async () => {
    const rows = [
      { type_of_session: 'focus', duration_in_min: 25, stopped_at: isoDaysAgo(2) },
    ];
    mockedSupabase.from = jest.fn(() => mockDataQuery(rows));

    const result = await getRecentDailyTotals(7);
    expect(result[dayKey(2)]).toBeDefined();
    expect(result[dayKey(5)]).toBeUndefined();
  });

  test('returns an empty object when there are no sessions', async () => {
    mockedSupabase.from = jest.fn(() => mockDataQuery([]));
    expect(await getRecentDailyTotals(7)).toEqual({});
  });

  test('returns an empty object on a query error', async () => {
    mockedSupabase.from = jest.fn(() => mockErrorQuery());
    expect(await getRecentDailyTotals(7)).toEqual({});
  });

  test('returns an empty object when users not signed in', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };
    expect(await getRecentDailyTotals(7)).toEqual({});
  });

  test('only filters by user, never by was_cancelled', async () => {
    const chain = mockDataQuery([]);
    mockedSupabase.from = jest.fn(() => chain);

    await getRecentDailyTotals(7);
    expect(chain.eq).toHaveBeenCalledTimes(1);
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'test-user');
  });
});
