/* 
 * Burnout calculator
*/

import { supabase } from './supabase';
import { BURNOUT_CONFIG } from './burnout_constants';
import { getTodayStudyMinutes, getTodaysBreakCount } from './sessions';
import { getTodaySelfCareCounts, getRecentMood } from './self-care';

export type BurnoutStatus = 'engaged' | 'balanced' | 'overextended' | 'burnout';

export interface BurnoutResult {
  score: number;
  status: BurnoutStatus;
  factors: string[];
}

async function calculateChronicLoad(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - BURNOUT_CONFIG.RECENT_DAYS_FOR_CHRONIC);
  startDate.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from('sessions')
    .select('duration_in_min, stopped_at')
    .eq('user_id', user.id)
    .eq('type_of_session', 'focus')
    .eq('was_cancelled', false)
    .gte('stopped_at', startDate.toISOString());

  if (!data) return false;

  const minutesByDay = data.reduce<Record<string, number>>((acc, s) => {
    const dateKey = new Date(s.stopped_at).toDateString();
    acc[dateKey] = (acc[dateKey] || 0) + s.duration_in_min;
    return acc;
  }, {});

  const heavyDays = Object.values(minutesByDay).filter(
    mins => mins > BURNOUT_CONFIG.STUDY_OVERWORK_MINUTES
  ).length;

  return heavyDays >= 2;
}

export async function calculateBurnoutScore(): Promise<BurnoutResult> {
  let score = 80; //baseline
  const factors: string[] = [];

  const studyMinutes = await getTodayStudyMinutes();
  const breaksTaken = await getTodaysBreakCount();
  const selfCareCounts = await getTodaySelfCareCounts();
  const recentMoods = await getRecentMood(3);
  const isChronic = await calculateChronicLoad();

  if (studyMinutes > BURNOUT_CONFIG.STUDY_SEVERE_OVERWORK_MINUTES) {
    score -= BURNOUT_CONFIG.STUDY_SEVERE_PENALTY;
    factors.push('Heavy study load (8+ hrs)');
  } else if (studyMinutes > BURNOUT_CONFIG.STUDY_OVERWORK_MINUTES) {
    score -= BURNOUT_CONFIG.STUDY_OVERWORK_PENALTY;
    factors.push('Long study day');
  }

  if (isChronic) {
    score -= BURNOUT_CONFIG.CONSECUTIVE_NO_BREAK_PENALTY;
    factors.push('Heavy days in a row');
  }

  const selfCareTotal = Object.values(selfCareCounts).reduce(
    (sum, n) => sum + n, 0
  );

  if (selfCareTotal >= BURNOUT_CONFIG.GOOD_SELFCARE_COUNT) {
    score += BURNOUT_CONFIG.SELFCARE_BONUS;
    factors.push('Great self-care 🌿');
  }

  if (breaksTaken > 0) {
    score += BURNOUT_CONFIG.BREAK_BONUS;
    factors.push('Taking breaks');
  }

  if (recentMoods.length > 0) {
    const latestMood = recentMoods[0].mood as keyof typeof BURNOUT_CONFIG.MOOD_SCORES;
    const moodAdj = BURNOUT_CONFIG.MOOD_SCORES[latestMood] || 0;
    score += moodAdj;
    if (moodAdj !== 0) factors.push(`Feeling ${latestMood}`);
  }

  score = Math.max(0, Math.min(100, score));

  const status = getStatus(score);
  return { score, status, factors };
}

function getStatus(score: number): BurnoutStatus {
  if (score >= BURNOUT_CONFIG.THRESHOLDS.ENGAGED) return 'engaged';
  if (score >= BURNOUT_CONFIG.THRESHOLDS.BALANCED) return 'balanced';
  if (score >= BURNOUT_CONFIG.THRESHOLDS.OVEREXTENDED) return 'overextended';
  return 'burnout';
}
