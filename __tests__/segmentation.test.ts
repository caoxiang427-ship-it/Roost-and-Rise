/*
 * Unit tests for user segmentation pure functions.
 * Covers the seeded RNG, normalisation, distance, k-means, inertia,
 * centroid-to-profile matching, and the end-to-end determinism fix.
*/

jest.mock('../src/lib/supabase');

import { __testables } from '../src/lib/segmentation';

const { makeRng, rand, normalise, distance, kMeans, kMeansBest, inertia, matchCentroidsToProfiles } = __testables;

describe('makeRng (seeded RNG)', () => {
  test('same seed produces identical sequence', () => {
    const a = makeRng(42);
    const b = makeRng(42);
    const seqA = [a(), a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  test('different seeds produce different sequences', () => {
    const a = makeRng(42);
    const b = makeRng(43);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).not.toEqual(seqB);
  });

  test('output is always within [0, 1)', () => {
    const rng = makeRng(7);

    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('rand', () => {
  test('output stays within [min, max)', () => {
    const rng = makeRng(1);

    for (let i = 0; i < 100; i++) {
      const v = rand(rng, 10, 20);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThan(20);
    }
  });

  test('a midpoint rng value maps to the range midpoint', () => {
    const half = () => 0.5;
    expect(rand(half, 0, 10)).toBe(5);
    expect(rand(half, 10, 30)).toBe(20);
  });
});

describe('normalise', () => {
  test('scales min to 0 and max to 1 per dimension', () => {
    const users = [
      { studySessions: 0,  selfCareLogs: 0,  avgSessionLength: 0,  avgMood: 0 },
      { studySessions: 10, selfCareLogs: 20, avgSessionLength: 40, avgMood: 5 },
    ];
    const result = normalise(users);

    expect(result[0]).toEqual([0, 0, 0, 0]);
    expect(result[1]).toEqual([1, 1, 1, 1]);
  });

  test('a value halfway between min and max normalises to 0.5', () => {
    const users = [
      { studySessions: 0,  selfCareLogs: 0, avgSessionLength: 0, avgMood: 0 },
      { studySessions: 5,  selfCareLogs: 0, avgSessionLength: 0, avgMood: 0 },
      { studySessions: 10, selfCareLogs: 0, avgSessionLength: 0, avgMood: 0 },
    ];
    const result = normalise(users);

    expect(result[1][0]).toBe(0.5);
  });

  test('zero-range dimension returns 0 (no divide-by-zero)', () => {
    const users = [
      { studySessions: 7, selfCareLogs: 3, avgSessionLength: 25, avgMood: 4 },
      { studySessions: 7, selfCareLogs: 3, avgSessionLength: 25, avgMood: 4 },
    ];
    const result = normalise(users);

    expect(result[0]).toEqual([0, 0, 0, 0]);
    expect(result[1]).toEqual([0, 0, 0, 0]);
    expect(result.flat().some(Number.isNaN)).toBe(false);
  });
});

describe('distance', () => {
  test('computes Euclidean distance for known vectors', () => {
    expect(distance([0, 0], [3, 4])).toBe(5);
  });

  test('identical points have distance 0', () => {
    expect(distance([1, 2, 3, 4], [1, 2, 3, 4])).toBe(0);
  });
});

describe('inertia', () => {
  test('is 0 when every point sits exactly on its centroid', () => {
    const data = [[0, 0], [1, 1]];
    const centroids = [[0, 0], [1, 1]];
    const assignments = [0, 1];
    expect(inertia(data, assignments, centroids)).toBe(0);
  });

  test('tighter clustering gives a lower value than looser', () => {
    const data = [[0, 0], [1, 0]];
    const tightCentroids = [[0, 0], [1, 0]];
    const looseCentroids = [[5, 5], [5, 5]];
    const assignments = [0, 1];
    const tight = inertia(data, assignments, tightCentroids);
    const loose = inertia(data, assignments, looseCentroids);
    expect(tight).toBeLessThan(loose);
  });
});

describe('kMeans / kMeansBest', () => {
  // Two clearly separated blobs: near origin and near (10,10)
  const data = [
    [0, 0], [0.1, 0.1], [0.2, 0],
    [10, 10], [10.1, 9.9], [9.9, 10.1],
  ];

  test('returns exactly k centroids', () => {
    const rng = makeRng(42);
    const { centroids } = kMeans(data, 2, rng);
    expect(centroids).toHaveLength(2);
  });

  test('every point is assigned to a valid cluster', () => {
    const rng = makeRng(42);
    const { assignments } = kMeans(data, 2, rng);
    expect(assignments).toHaveLength(data.length);
    
    // k = 2, we expects 0 or 1 valid cluster
    for (const a of assignments) {
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThan(2);
    }
  });

  // Checks that kmeans correctly separate 2 obivous grps of points
  test('groups the two obvious blobs together', () => {
    const rng = makeRng(42);
    const { assignments } = kMeans(data, 2, rng);
    // first three points share a cluster and last three share the other
    expect(assignments[0]).toBe(assignments[1]);
    expect(assignments[1]).toBe(assignments[2]);
    expect(assignments[3]).toBe(assignments[4]);
    expect(assignments[4]).toBe(assignments[5]);
    expect(assignments[0]).not.toBe(assignments[3]);
  });

  test('kMeansBest is never worse than a single run', () => {
    const rng1 = makeRng(42);
    const single = kMeans(data, 2, rng1);
    const singleInertia = inertia(data, single.assignments, single.centroids);

    const rng2 = makeRng(42);
    const best = kMeansBest(data, 2, rng2);
    const bestInertia = inertia(data, best.assignments, best.centroids);

    expect(bestInertia).toBeLessThanOrEqual(singleInertia);
  });
});

describe('matchCentroidsToProfiles', () => {
  // e.g. 2 centroids got the same profile, leaving one unassigned
  test('assigns all four profiles uniquely (no duplicates, none missing)', () => {
    const centroids = [
      [0.1, 0.1, 0.5, 0.5],
      [0.9, 0.1, 0.5, 0.5],
      [0.1, 0.9, 0.5, 0.5],
      [0.9, 0.9, 0.5, 0.5],
    ];
    const mapping = matchCentroidsToProfiles(centroids);
    expect([...mapping].sort()).toEqual([0, 1, 2, 3]);
  });

  test('maps each centroid to the correct profile by study/self-care', () => {
    // dims: [study, selfCare, sessionLength, mood]
    const centroids = [
      [0.1, 0.1, 0.5, 0.5], // low both, Fresh starter (0)
      [0.9, 0.1, 0.5, 0.5], // high study, Grinder (1)
      [0.1, 0.9, 0.5, 0.5], // high self-care, Seeker (2)
      [0.9, 0.9, 0.5, 0.5], // high both, Balanced (3)
    ];
    const mapping = matchCentroidsToProfiles(centroids);
    expect(mapping[0]).toBe(0);
    expect(mapping[1]).toBe(1);
    expect(mapping[2]).toBe(2);
    expect(mapping[3]).toBe(3);
  });
});

describe('determinism (the stability fix)', () => {
  test('same seed yields identical k-means assignments across runs', () => {
    const data = [
      [0, 0], [0.1, 0.1],
      [10, 10], [10.1, 9.9],
    ];
    const run1 = kMeans(data, 2, makeRng(42));
    const run2 = kMeans(data, 2, makeRng(42));
    expect(run1.assignments).toEqual(run2.assignments);
    expect(run1.centroids).toEqual(run2.centroids);
  });
});
