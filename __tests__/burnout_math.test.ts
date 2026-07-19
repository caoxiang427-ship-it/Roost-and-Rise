/*
 * Unit tests for the pure burnout math.
*/

import {
    chronicPenalty,
    clamp,
    effectiveLoad,
    efficacyBonus,
    exhaustionPenalty,
    mean,
    moodAdjustment,
    recoveryBonus,
    recoveryCredit,
} from '../src/lib/burnout_math';

describe('clamp', () => {
  test('returns the original value when it is within the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  test('returns the minimum when the value is below the range', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  test('returns the maximum when the value is above the range', () => {
    expect(clamp(99, 0, 10)).toBe(10);
  });

  test('returns boundary values unchanged', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('mean', () => {
  test('averages a list of numbers', () => {
    expect(mean([1, 2, 3])).toBe(2);
  });

  test('returns 0 for an empty list instead of NaN', () => {
    expect(mean([])).toBe(0);
  });

  test('handles a single value', () => {
    expect(mean([5])).toBe(5);
  });
});

describe('recoveryCredit', () => {
  test('no rest gives no credit', () => {
    expect(recoveryCredit(0, 0)).toBe(0);
  });

  test('60 break minutes gives a full hour of credit', () => {
    expect(recoveryCredit(60, 0)).toBe(1);
  });

  test('break credit is proportional below the cap (30 min gives half)', () => {
    expect(recoveryCredit(30, 0)).toBe(0.5);
  });

  test('break credit caps at 1 hour no matter how long the break', () => {
    expect(recoveryCredit(600, 0)).toBe(1);
  });

  test('each self-care log is worth 15 minutes', () => {
    expect(recoveryCredit(0, 1)).toBe(0.25);
    expect(recoveryCredit(0, 2)).toBe(0.5);
  });

  test('self-care credit caps at 1 hour (4 logs)', () => {
    expect(recoveryCredit(0, 4)).toBe(1);
    expect(recoveryCredit(0, 20)).toBe(1);
  });

  test('break and self-care credits are capped at 2 hours in total', () => {
    expect(recoveryCredit(60, 4)).toBe(2);
    expect(recoveryCredit(600, 20)).toBe(2);
  });
});

describe('effectiveLoad', () => {
  test('with no recovery, load is just the study hours', () => {
    expect(effectiveLoad(360, 0)).toBe(6);
  });

  test('recovery is subtracted from study hours', () => {
    expect(effectiveLoad(480, 2)).toBe(6);
  });

  test('never goes negative when recovery exceeds study time', () => {
    expect(effectiveLoad(60, 2)).toBe(0);
  });

  test('a day with no study at all is zero load', () => {
    expect(effectiveLoad(0, 0)).toBe(0);
  });
});

describe('exhaustionPenalty', () => {
  test.each([
    [0, 0],
    [2, 0],
    [4, 0], // free zone ends here
    [5, 7],
    [6, 14],     
    [8, 28],     
    [8.5, 30],
    [10, 36],
    [11, 40], // cap reached
    [12, 40],
    [100, 40],
  ])('effective load of %p hours gives a penalty of %p', (load, expected) => {
    expect(exhaustionPenalty(load)).toBeCloseTo(expected, 5);
  });

  test('is continuous at the 4-hour mark (no sudden jump in penalty)', () => {
    const diff = Math.abs(exhaustionPenalty(4.01) - exhaustionPenalty(3.99));
    expect(diff).toBeLessThan(0.2);
  });

  test('is continuous at the 8-hour mark (no sudden jump in penalty)', () => {
    const diff = Math.abs(exhaustionPenalty(8.01) - exhaustionPenalty(7.99));
    expect(diff).toBeLessThan(0.2);
  });

  test('never exceeds the cap of 40', () => {
    for (const L of [11, 15, 24, 1000]) {
      expect(exhaustionPenalty(L)).toBeLessThanOrEqual(40);
    }
  });
});

describe('chronicPenalty (7-day window)', () => {
  test('returns 0 for an empty history', () => {
    expect(chronicPenalty([])).toBe(0);
  });

  test('a week of no study gives no penalty', () => {
    expect(chronicPenalty([0, 0, 0, 0, 0, 0, 0])).toBe(0);
  });

  test('exactly 4 hours every day is not considered heavy (the check is strictly above 4)', () => {
    expect(chronicPenalty([4, 4, 4, 4, 4, 4, 4])).toBe(0);
  });

  test('a full week of 5 hour days: average is over 4 AND the streak is not broken', () => {
    // mean 5 -> 2.5 * (5 - 4) = 2.5, streak 7 -> 2 * (7 - 3) = 8
    expect(chronicPenalty([5, 5, 5, 5, 5, 5, 5])).toBeCloseTo(10.5, 5);
  });

  test('a short streak of heavy days with a light average penalises the streak only', () => {
    // mean 20/7 = 2.86 -> 2.5 * 0 = 0, streak 4 -> 2 * 1 = 2
    expect(chronicPenalty([0, 0, 0, 5, 5, 5, 5])).toBeCloseTo(2, 5);
  });

  test('3 heavy days in a row is inside the grace period', () => {
    expect(chronicPenalty([0, 0, 0, 0, 5, 5, 5])).toBeCloseTo(0, 5);
  });

  test('a 4th heavy day in a row breaks the grace period', () => {
    expect(chronicPenalty([0, 0, 0, 5, 5, 5, 5])).toBeCloseTo(2, 5);
  });

  test('resting today breaks the streak even after a heavy week', () => {
    // mean 36/7 = 5.14 -> excess 2.86, streak 0 because today is 0.
    expect(chronicPenalty([6, 6, 6, 6, 6, 6, 0])).toBeCloseTo(2.857, 2);
  });

  test('scattered heavy days do not build a streak', () => {
    expect(chronicPenalty([8, 0, 8, 0, 8, 0, 8])).toBeCloseTo(1.429, 2);
  });

  test('an extremely heavy week is capped at 20', () => {
    // mean 12 -> excess 20, streak 7 -> 8. 28 total, capped to 20.
    expect(chronicPenalty([12, 12, 12, 12, 12, 12, 12])).toBe(20);
  });
});

describe('moodAdjustment', () => {
  test('no mood data at all gives no adjustment', () => {
    expect(moodAdjustment([], [])).toBe(0);
  });

  test('empty day arrays are ignored, not treated as data', () => {
    expect(moodAdjustment([], [[], [], []])).toBe(0);
  });

  test.each([
    ['exhausted', -16], // most negative possible
    ['stressed', -8],
    ['okay', 0],
    ['good', 6],
    ['great', 12], // most positive possible
  ])('a single "%s" check-in today gives %p', (mood, expected) => {
    expect(moodAdjustment([mood], [])).toBeCloseTo(expected, 5);
  });

  test('negative moods weigh more than positive ones of the same size', () => {
    expect(Math.abs(moodAdjustment(['exhausted'], []))).toBeGreaterThan(
      Math.abs(moodAdjustment(['great'], []))
    );
  });

  test('averages several mood check-ins on the same day instead of taking the latest', () => {
    expect(moodAdjustment(['exhausted', 'great'], [])).toBeCloseTo(0, 5);
  });

  test('averaging two positive mood check-ins', () => {
    expect(moodAdjustment(['good', 'great'], [])).toBeCloseTo(9, 5);
  });

  test('an old mood with no check-in today is halved', () => {
    // prev = 2, no today -> 0.5 * 2 = 1 -> 6 * 1
    expect(moodAdjustment([], [['great']])).toBeCloseTo(6, 5);
  });

  test('today counts more than the last few days', () => {
    // 0.7 * 2 + 0.3 * (-2) = 0.8 -> 6 * 0.8
    expect(moodAdjustment(['great'], [['exhausted']])).toBeCloseTo(4.8, 5);
  });

  test('averages across previous days before combining', () => {
    // prevDaily = [2, -2] -> prev = 0. today = -2.
    // v = 0.7 * -2 + 0.3 * 0 = -1.4 -> 8 * -1.4
    expect(moodAdjustment(['exhausted'], [['great'], ['exhausted']])).toBeCloseTo(-11.2, 5);
  });

  test('a consistently great week hits the maximum', () => {
    expect(moodAdjustment(['great'], [['great'], ['great'], ['great']])).toBeCloseTo(12, 5);
  });

  test('an unknown mood string counts as neutral instead of breaking', () => {
    expect(moodAdjustment(['sleepy'], [])).toBe(0);
    expect(moodAdjustment(['great', 'sleepy'], [])).toBeCloseTo(6, 5);
  });
});

describe('recoveryBonus', () => {
  test('nothing logged gives no bonus', () => {
    expect(recoveryBonus(0, 0)).toBe(0);
  });

  test.each([
    [0, 0],
    [1, 2],
    [2, 4],   
    [3, 6],   
    [4, 6], // capped
    [10, 6],
  ])('%p self-care logs gives %p points', (logs, expected) => {
    expect(recoveryBonus(0, logs)).toBeCloseTo(expected, 5);
  });

  test('break bonus scales with minutes and caps at 30 minutes', () => {
    expect(recoveryBonus(15, 0)).toBeCloseTo(2, 5);
    expect(recoveryBonus(30, 0)).toBeCloseTo(4, 5);
    expect(recoveryBonus(90, 0)).toBeCloseTo(4, 5);
  });

  test('the maximum possible recovery bonus is 10', () => {
    expect(recoveryBonus(30, 3)).toBeCloseTo(10, 5);
    expect(recoveryBonus(999, 999)).toBeCloseTo(10, 5);
  });
});

describe('efficacyBonus', () => {
  test('no sessions gives no bonus', () => {
    expect(efficacyBonus(0, 0, 0)).toBe(0);
  });

  test('a single session gives no bonus (too little data)', () => {
    expect(efficacyBonus(1, 1, 0)).toBe(0);
  });

  test('finishing every session on a fresh day gives the full 12', () => {
    expect(efficacyBonus(4, 4, 0)).toBeCloseTo(12, 5);
  });
  
  test('finishing half the sessions gives half the bonus', () => {
    expect(efficacyBonus(4, 2, 0)).toBeCloseTo(6, 5);
  });

  test('abandoning every session gives no bonus', () => {
    expect(efficacyBonus(4, 0, 0)).toBe(0);
    expect(efficacyBonus(4, 0, 0)).toBeGreaterThanOrEqual(0);
  });

  test.each([
    [0, 12],
    [10, 9],
    [20, 6],
    [30, 3],
    [40, 0], // fully exhausted so efficacy worth nothing
  ])('with exhaustion of %p, perfect completion is worth %p (efficacy decreases as exhaustion increases)', (exhaustion, expected) => {
    expect(efficacyBonus(4, 4, exhaustion)).toBeCloseTo(expected, 5);
  });

  test('returns 0 once exhaustion exceeds the cap', () => {
    expect(efficacyBonus(4, 4, 100)).toBe(0);
  });

  test('a completion rate above 100 is clamped rather than trusted', () => {
    expect(efficacyBonus(2, 5, 0)).toBeCloseTo(12, 5);
  });
});