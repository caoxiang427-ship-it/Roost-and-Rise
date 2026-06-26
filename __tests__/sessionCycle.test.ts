/* 
 * Test the cycle position:
 * 1. User's current position in the four-session cycle
 * 2. Extended break trigger fires on the fourth session and resets afterwards.
*/

function getCyclePosition(completedToday: number) {
  const nextSession = completedToday + 1;
  return ((nextSession - 1) % 4) + 1;
}

function isLongBreakNext(completedToday: number) {
  const nextSession = completedToday + 1;
  return nextSession % 4 == 0;
}

describe('Session cycle logic', () => {
  test('first session of the day is position 1 of 4', () => {
    expect(getCyclePosition(0)).toBe(1);
  });

  test('after 3 completed sessions is position 4', () => {
    expect(getCyclePosition(3)).toBe(4);
  });

  test('4th session triggers long break', () => {
    expect(isLongBreakNext(3)).toBe(true);
  });

  test('after 4 completed sessions, cycle resets to position 1', () => {
    expect(getCyclePosition(4)).toBe(1);
  });

  test('first 3 sessions do not trigger long break', () => {
    expect(isLongBreakNext(0)).toBe(false);
    expect(isLongBreakNext(1)).toBe(false);
    expect(isLongBreakNext(2)).toBe(false);
  });
});
