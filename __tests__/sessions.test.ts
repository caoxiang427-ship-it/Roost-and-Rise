/*
 * Integration tests for the session helpers.
 * Supabase is mocked. 
 * sessionRecorder is a write helper, so we verify that it sends the correct payload.
 * The remaining helpers read session data, so we mock the query result and verfiy
 * that the returned value is computed correctly. 
*/

import { supabase } from '../src/lib/supabase';

jest.mock('../src/lib/supabase');

import {
  sessionRecorder,
  getTodayStudyMinutes,
  getTodaysFocusSessionCount,
  getTodaysBreakCount,
} from '../src/lib/sessions';

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
