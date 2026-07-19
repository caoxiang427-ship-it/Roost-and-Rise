/*
 * Integration tests for logMood.
 * logMood writes a row to Supabase. 
 * This test checks the correct table, payload, and not-signed-in behaviour.
 */

import { supabase } from '../src/lib/supabase';

jest.mock('../src/lib/supabase');

import { logMood } from '../src/lib/self-care';

const mockedSupabase = supabase as any;

// A jest.fn we can inspect after the call to see what was inserted.
let insertMock: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();

  insertMock = jest.fn(() => Promise.resolve({ data: null, error: null }));

  mockedSupabase.auth = {
    getUser: jest.fn(async () => ({ data: { user: { id: 'test-user' } } })),
  };
  mockedSupabase.from = jest.fn(() => ({ insert: insertMock }));
}); // from: captures what logMood internally did

describe('logMood — signed in', () => {
  test('inserts into the mood_logs table', async () => {
    await logMood('great'); // recorded
    expect(mockedSupabase.from).toHaveBeenCalledWith('mood_logs'); // whether 'from'so f is called
  });

  test('inserts the correct payload (user id and mood)', async () => {
    await logMood('great');
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'test-user',
      mood: 'great',
    });
  });

  test('inserts the exact mood string it receives', async () => {
    await logMood('exhausted');
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'test-user',
      mood: 'exhausted',
    });
  });
});

describe('logMood — not signed in', () => {
  test('returns an error and does not insert when there is no user', async () => {
    mockedSupabase.auth = {
      getUser: jest.fn(async () => ({ data: { user: null } })),
    };

    const result = await logMood('great');

    expect(result).toEqual({ error: 'Not signed in' });
    expect(insertMock).not.toHaveBeenCalled();
  });
});

