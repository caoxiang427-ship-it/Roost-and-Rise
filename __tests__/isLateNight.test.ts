/*
 * Checks that late-night warning on timer screen
 * is correctly triggers for hours between 11pm and 5am
 * does not fire during normal daytime hours.
*/

import { isLateNight } from '../src/lib/timer';

describe('Late-night detection', () => {
  test('11pm triggers late-night warning', () => {
    expect(isLateNight(23)).toBe(true);
  });

  test('5am does not trigger late-night warning', () => {
    expect(isLateNight(5)).toBe(false);
  });

  test('3am triggers late-night warning', () => {
    expect(isLateNight(3)).toBe(true);
  });

  test('6am does not trigger warning', () => {
    expect(isLateNight(6)).toBe(false);
  });

  test('10pm does not trigger warning', () => {
    expect(isLateNight(22)).toBe(false);
  });

  test('noon does not trigger warning', () => {
    expect(isLateNight(12)).toBe(false);
  });
});
