/* User segmentation via k-means clustering (demo)
 * Clusters the real user against a pool of simulated users into 1 of 4 behavioural profiles
 * Runs on a fixed 30-day window
 * Fix: uses a seeded RNG so that the result is stable across reloads.
*/

import {
  getMoodData,
  getSessionData,
  getSelfCareFrequency,
} from './analytics';

export interface UserSegment {
  clusterLabel: string;
  clusterDescription: string;
  userStats: {
    studySessions: number;
    selfCareLogs: number;
    avgSessionLength: number;
    avgMood: number;
  };
  percentile: number;
}

interface UserVector {
  studySessions: number;
  selfCareLogs: number;
  avgSessionLength: number;
  avgMood: number;
}

export const __testables = { makeRng, rand, normalise, distance, kMeans, kMeansBest, inertia, matchCentroidsToProfiles };

const CLUSTER_PROFILES = [
  { label: 'Fresh starter', description: 'Light activity for now. The journey is just beginning.' },
  { label: 'Focused grinder', description: 'Strong study output, but self-care takes a back seat.' },
  { label: 'Wellness seeker', description: 'Self-care is a priority. Study sessions are lighter.' },
  { label: 'Balanced achiever', description: 'A healthy balance of study and self-care.' },
];

// Mulberry32
// Return a function that generates random numbers btw 0 and 1
// Given the same seed, it always produces the same sequence of numbers
function makeRng(seed: number): () => number {
  let s = seed;
  return function () {
    s |= 0; // s: 32 bit int
    s = (s + 0x6D2B79F5) | 0; // makes each call produce a diff result
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// scale to a range
function rand(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min;
}

function generateSimulatedUsers(count: number, rng: () => number): UserVector[] {
  const users: UserVector[] = [];
  for (let i = 0; i < count; i++) {
    const type = Math.floor(rng() * 4);
    switch (type) {
      case 0: // Fresh starter (low study + low self-care)
        users.push({
          studySessions: rand(rng, 0, 15),
          selfCareLogs: rand(rng, 0, 12),
          avgSessionLength: rand(rng, 10, 30),
          avgMood: rand(rng, 2.0, 4.0),
        });
        break;
      case 1: // Focused grinder (high study + low self-care)
        users.push({
          studySessions: rand(rng, 40, 85),
          selfCareLogs: rand(rng, 0, 15),
          avgSessionLength: rand(rng, 25, 50),
          avgMood: rand(rng, 2.5, 4.5),
        });
        break;
      case 2: // Wellness seeker (low study + high self-care)
        users.push({
          studySessions: rand(rng, 0, 25),
          selfCareLogs: rand(rng, 30, 60),
          avgSessionLength: rand(rng, 15, 35),
          avgMood: rand(rng, 2.5, 4.5),
        });
        break;
      case 3: // Balanced achiever (high study + high self-care)
        users.push({
          studySessions: rand(rng, 35, 80),
          selfCareLogs: rand(rng, 25, 55),
          avgSessionLength: rand(rng, 20, 45),
          avgMood: rand(rng, 3.0, 4.5),
        });
        break;
    }
  }
  return users;
}

// Normalise to a scale btw 0.0 - 1.0
function normalise(users: UserVector[]): number[][] {
  const keys: (keyof UserVector)[] = ['studySessions', 'selfCareLogs', 'avgSessionLength', 'avgMood'];
  const mins = keys.map(k => Math.min(...users.map(u => u[k])));
  const maxes = keys.map(k => Math.max(...users.map(u => u[k])));

  return users.map(u => {
    return keys.map((k, i) => {
      const min = mins[i];
      const max = maxes[i];

      const range = max - min;

      if (range == 0) return 0;
  
      const userDiff = u[k] - min;

      return userDiff / range;
    });
  });
}

function distance(pointA: number[], pointB: number[]): number {
  const sumOfSquares = pointA.reduce((total, valueA, index) => {
    const valueB = pointB[index];
    const diff = valueA - valueB;

    return total + diff ** 2;
  }, 0);

  return Math.sqrt(sumOfSquares);
}

function kMeans(
  data: number[][],
  k: number,
  rng: () => number,
  maxIter: number = 20
): { assignments: number[]; centroids: number[][] } {
  const n = data.length;
  const dims = data[0].length;

  const indices = new Set<number>();
  while (indices.size < k) {
    indices.add(Math.floor(rng() * n));
  }

  let centroids = [...indices].map(i => [...data[i]]);
  let assignments = new Array(n).fill(0);

  // Assign every point to its nearst centroid
  for (let iter = 0; iter < maxIter; iter++) {
    const newAssignments = data.map(point => {
      let bestCluster = 0;
      let bestDist = distance(point, centroids[0]);
      for (let ci = 1; ci < centroids.length; ci++) {
        const dist = distance(point, centroids[ci]);
        if (dist < bestDist) {
          bestDist = dist;
          bestCluster = ci;
        }
      }
      return bestCluster;
    });

    // Stop if nothing changed since the last round
    const converged = newAssignments.every((a, i) => a == assignments[i]);
    if (converged) break;
    assignments = newAssignments;

    // Move each centroid to the avg of its members
    centroids = centroids.map((oldCentroid, ci) => {
      const members = data.filter((_, di) => assignments[di] == ci);
      if (members.length === 0) {
        return oldCentroid;
      }

      const newCentroid: number[] = [];
      for (let d = 0; d < dims; d++) {
        const sum = members.reduce((total, m) => total + m[d], 0);
        newCentroid[d] = sum / members.length;
      }
      return newCentroid;
    });
  }

  return { assignments, centroids };
}

// Total within-cluster squared distance -> measure how good a clustering is
// Lower -> tighter
function inertia(data: number[][], assignments: number[], centroids: number[][]): number {
  let total = 0;

  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const assignedCentroid = centroids[assignments[i]];
    const dist = distance(point, assignedCentroid);

    total += dist ** 2;
  }

  return total;
}

// Run k-means several times, keep the tightest result.
function kMeansBest(
  data: number[][],
  k: number,
  rng: () => number,
  restarts: number = 8
): { assignments: number[]; centroids: number[][] } {
  let best = kMeans(data, k, rng);
  let bestInertia = inertia(data, best.assignments, best.centroids);

  for (let r = 1; r < restarts; r++) {
    const candidate = kMeans(data, k, rng);
    const candidateInertia = inertia(data, candidate.assignments, candidate.centroids);

    if (candidateInertia < bestInertia) {
      best = candidate;
      bestInertia = candidateInertia;
    }
  }

  return best;
}

function matchCentroidsToProfiles(centroids: number[][]): number[] {
  const mapping: number[] = [];
  const used = new Set<number>();

  const scores = centroids.map(c => {
    const study = c[0];
    const selfCare = c[1];
    return [
      1 - study - selfCare,
      study - selfCare,
      selfCare - study,
      study + selfCare,
    ];
  });

  for (let profile = 0; profile < 4; profile++) {
    let bestCentroid = -1;
    let bestScore = -Infinity;

    for (let ci = 0; ci < centroids.length; ci++) {
      if (used.has(ci)) continue;

      if (scores[ci][profile] > bestScore) {
        bestScore = scores[ci][profile];
        bestCentroid = ci;
      }
    }

    if (bestCentroid >= 0) {
      mapping[bestCentroid] = profile;
      used.add(bestCentroid);
    }
  }

  return mapping;
}

export async function getUserSegment(): Promise<UserSegment | null> {
  const [moodData, sessionData, selfCareData] = await Promise.all([
    getMoodData('month'),
    getSessionData('month'),
    getSelfCareFrequency('month'),
  ]);

  const logged = moodData.filter(d => d.value > 0);
  const avgMood = logged.length > 0
    ? logged.reduce((s, d) => s + d.value, 0) / logged.length
    : 3;
  const totalSessions = sessionData.reduce((s, d) => s + d.count, 0);
  const totalMinutes = sessionData.reduce((s, d) => s + d.minutes, 0);
  const avgSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0;
  const totalSelfCare = selfCareData.reduce((s, c) => s + c.count, 0);

  if (totalSessions == 0 && totalSelfCare == 0 && logged.length == 0) {
    return null;
  }

  const realUser: UserVector = {
    studySessions: totalSessions,
    selfCareLogs: totalSelfCare,
    avgSessionLength: Math.round(avgSessionLength),
    avgMood: Math.round(avgMood * 10) / 10,
  };

  const rng = makeRng(42);
  const simulated = generateSimulatedUsers(80, rng);
  const allUsers = [...simulated, realUser];
  const realIndex = allUsers.length - 1;

  const normalised = normalise(allUsers);
  const { assignments, centroids } = kMeansBest(normalised, 4, rng);
  const centroidToProfile = matchCentroidsToProfiles(centroids);

  const userCluster = assignments[realIndex];
  const profileIndex = centroidToProfile[userCluster] ?? 0;
  const profile = CLUSTER_PROFILES[profileIndex];

  const userActivity = totalSessions + totalSelfCare;
  const lowerCount = simulated.filter(
    user => (user.studySessions + user.selfCareLogs) < userActivity
  ).length;
  const percentile = Math.round((lowerCount / simulated.length) * 100);

  return {
    clusterLabel: profile.label,
    clusterDescription: profile.description,
    userStats: realUser,
    percentile,
  };
}
