/*
 * Integration tests for calculateBurnoutScore.
 * This helper function composes four other helpers
 * Those modules are mocked with factory mocks rather than Supabase. 
 * Supabase itself is mocked only for the internal chronic-load query
*/

jest.mock('../src/lib/supabase');

jest.mock('../src/lib/sessions', () => ({
  getTodayStudyMinutes: jest.fn(),
  getTodaysBreakCount: jest.fn(),
}));

jest.mock('../src/lib/self-care', () => ({
  getTodaySelfCareCounts: jest.fn(),
  getTodaysMood: jest.fn(),
}));

import { supabase } from '../src/lib/supabase';
import { calculateBurnoutScore } from '../src/lib/burnout';
import { getTodaySelfCareCounts, getTodaysMood } from '../src/lib/self-care';
import { getTodayStudyMinutes, getTodaysBreakCount } from '../src/lib/sessions';

const mockedSupabase = supabase as any;
const mockTodaysMood = getTodaysMood as jest.Mock;
const mockBreakCount = getTodaysBreakCount as jest.Mock;
const mockStudyMinutes = getTodayStudyMinutes as jest.Mock;
const mockSelfCareCounts = getTodaySelfCareCounts as jest.Mock;

function mockChronicQuery(rows: any[]) {
  const chain: any = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    gte: jest.fn(() => Promise.resolve({ data: rows, error: null })),
  };
  return chain;
}

// Build a heavy-study day (> 360 min threshold) 
function heavyDay(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return { duration_in_min: 400, stopped_at: d.toISOString() };
}

beforeEach(() => {
  jest.clearAllMocks();

  mockStudyMinutes.mockResolvedValue(0);
  mockBreakCount.mockResolvedValue(0);
  mockSelfCareCounts.mockResolvedValue({});
  mockTodaysMood.mockResolvedValue(null);

  mockedSupabase.auth = {
    getUser: jest.fn(async () => ({ data: { user: { id: 'test-user' } } })),
  };
  mockedSupabase.from = jest.fn(() => mockChronicQuery([]));
});

describe('calculateBurnoutScore — baseline', () => {
  test('returns the baseline score of 80 with no activity', async () => {
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(80);
    expect(result.status).toBe('engaged');
    expect(result.factors).toEqual([]);
  });
});

describe('calculateBurnoutScore — study penalties', () => {
  test('no penalty at exactly the overwork threshold (360 min)', async () => {
    mockStudyMinutes.mockResolvedValue(360);
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(80);
  });

  test('applies the long-study penalty just above the threshold (361 min)', async () => {
    mockStudyMinutes.mockResolvedValue(361);
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(65); // 80-15
    expect(result.factors).toContain('Long study day');
  });

  test('still only the long-study penalty at exactly 480 min', async () => {
    mockStudyMinutes.mockResolvedValue(480);
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(65); 
    expect(result.factors).toContain('Long study day');
  });

  test('applies the severe penalty just above 480 min (481 min)', async () => {
    mockStudyMinutes.mockResolvedValue(481);
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(50); // 80-30
    expect(result.factors).toContain('Heavy study load (8+ hrs)');
  });
});

describe('calculateBurnoutScore — self-care and break bonuses', () => {
  test('no bonus with only 2 self-care logs', async () => {
    mockSelfCareCounts.mockResolvedValue({ sleep: 1, exercise: 1 });
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(80);
  });

  test('awards the self-care bonus at exactly 3 logs', async () => {
    mockSelfCareCounts.mockResolvedValue({ sleep: 2, exercise: 1 });
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(90); // 80+10
    expect(result.factors).toContain('Great self-care 🌿');
  });

  test('awards the break bonus when at least one break is taken', async () => {
    mockBreakCount.mockResolvedValue(1);
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(90); // 80+10
    expect(result.factors).toContain('Taking breaks');
  });
});

describe('calculateBurnoutScore — mood logs', () => {
  test('a great mood raises the score', async () => {
    mockTodaysMood.mockResolvedValue('great');
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(95); // 80+15
    expect(result.factors).toContain('Feeling great');
  });

  test('an exhausted mood lowers the score', async () => {
    mockTodaysMood.mockResolvedValue('exhausted');
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(60); // 80-20
    expect(result.factors).toContain('Feeling exhausted');
  });

  test('a neutral mood does not change the score or add a factor', async () => {
    mockTodaysMood.mockResolvedValue('okay');
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(80);
    expect(result.factors).toEqual([]);
  });
});

describe('calculateBurnoutScore — chronic load', () => {
  test('applies the chronic penalty when two or more heavy days occurred', async () => {
    mockedSupabase.from = jest.fn(() => mockChronicQuery([heavyDay(1), heavyDay(2)]));
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(65); // 80-15
    expect(result.factors).toContain('Heavy days in a row');
  });

  test('no chronic penalty for a single heavy day', async () => {
    mockedSupabase.from = jest.fn(() => mockChronicQuery([heavyDay(1)]));
    const result = await calculateBurnoutScore();
    expect(result.score).toBe(80);
  });
});

describe('calculateBurnoutScore — score clamping and tiers', () => {
  test('caps the score at 100 when all bonuses apply', async () => {
    mockSelfCareCounts.mockResolvedValue({ sleep: 3 }); // +10
    mockBreakCount.mockResolvedValue(2); // +10
    mockTodaysMood.mockResolvedValue('great'); // +15

    const result = await calculateBurnoutScore(); // 80 + 35 = 115
    expect(result.score).toBe(100);
    expect(result.status).toBe('engaged');
  });

  test('a heavily penalised day falls into the burnout tier', async () => {
    mockStudyMinutes.mockResolvedValue(500); // -30
    mockTodaysMood.mockResolvedValue('exhausted'); // -20
    mockedSupabase.from = jest.fn(() => mockChronicQuery([heavyDay(1), heavyDay(2)])); // -15

    const result = await calculateBurnoutScore(); // 80 - 65 = 15
    expect(result.score).toBe(15);
    expect(result.status).toBe('burnout');
  });

  test('never returns a score below 0 or above 100', async () => {
    mockSelfCareCounts.mockResolvedValue({ sleep: 5 });
    mockBreakCount.mockResolvedValue(3);
    mockTodaysMood.mockResolvedValue('great');

    const result = await calculateBurnoutScore();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
