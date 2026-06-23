/* 
 * Test whether wellness scores is mapped to the correct tier
*/

import { BURNOUT_CONFIG } from '../src/lib/burnout_constants';

function getStatus(score: number) {
  if (score >= BURNOUT_CONFIG.THRESHOLDS.ENGAGED) return 'engaged';
  if (score >= BURNOUT_CONFIG.THRESHOLDS.BALANCED) return 'balanced';
  if (score >= BURNOUT_CONFIG.THRESHOLDS.OVEREXTENDED) return 'overextended';
  return 'burnout';
}

describe('Wellness status tiers', () => {
  test('score of 80 maps to engaged', () => {
    expect(getStatus(80)).toBe('engaged');
  });

  test('score of 50 maps to balanced', () => {
    expect(getStatus(50)).toBe('balanced');
  });

  test('score of 30 maps to overextended', () => {
    expect(getStatus(30)).toBe('overextended');
  });

  test('score of 10 maps to burnout', () => {
    expect(getStatus(10)).toBe('burnout');
  });

  test('threshold boundaries map to correct tiers', () => {
    expect(getStatus(70)).toBe('engaged');
    expect(getStatus(69)).toBe('balanced');
    expect(getStatus(45)).toBe('balanced');
    expect(getStatus(44)).toBe('overextended');
    expect(getStatus(25)).toBe('overextended');
    expect(getStatus(24)).toBe('burnout');
  });
});
