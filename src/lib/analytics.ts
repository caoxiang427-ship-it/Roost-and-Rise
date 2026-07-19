/* Analytics helper functions
 * 1. mood, sessions, selfcare data visualisation (bar chart, line chart)
 * 2. personalised insights
 * 3. habit prediction
 * 4. user segmentation
 */

import { supabase } from './supabase';

export interface DailyMood {
  date: string;  
  dateKey: string;   
  value: number; 
  raw: string; 
}

export interface DailySession {
  date: string;
  count: number;
  minutes: number;
}

export interface CategoryCount {
  label: string;
  icon: string;
  count: number;
}

export interface Insight {
  icon: string;
  color: 'accent' | 'amber' | 'pink';
  text: string;
  suggestion: string;
}

export interface DayPattern {
  label: string;
  icon: string;
  days: string[];
}

export interface HabitStreak { 
  label: string;
  icon: string;
  streak: number;
  atRisk: boolean;
}

export interface HabitPrediction {
  streaks: HabitStreak[];
  patterns: DayPattern[];
}

// Map mood emojis to numeric values
const MOOD_VALUES: Record<string, number> = {
  'exhausted': 1, 'stressed': 2, 'okay': 3, 'good': 4, 'great': 5,
};

// Data visualisation helpers
function moodToNumber(mood: string): number {
  return MOOD_VALUES[mood] ?? 3;
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatLabel(d: Date, mode: 'week' | 'month'): string {
  if (mode === 'week') {
    return SHORT_DAYS[d.getDay()];
  }
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function getSinceDate(days: number): Date {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);
  return since;
}

export async function getMoodData(mode: 'week' | 'month'): Promise<DailyMood[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const days = mode === 'week' ? 7 : 30;
  const since = getSinceDate(days);

  const { data, error } = await supabase
    .from('mood_logs')
    .select('mood, logged_at')
    .eq('user_id', user.id)
    .gte('logged_at', since.toISOString())
    .order('logged_at', { ascending: true });

  if (!data || error) return [];

  // Group by date, take latest mood per day
  const byDay: Record<string, string> = {};
  for (const row of data) {
    const key = new Date(row.logged_at).toDateString();
    byDay[key] = row.mood;
  }

  // Loop is either 7 times or 30 times
  const result: DailyMood[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
  
    const key = d.toDateString();
    const mood = byDay[key] || '';
  
    result.push({
      date: formatLabel(d, mode),
      dateKey: d.toDateString(),
      value: mood ? moodToNumber(mood) : 0,  // 0 = no data
      raw: mood,
    });
  }

  return result;
}

export async function getSessionData(mode: 'week' | 'month'): Promise<DailySession[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const days = mode === 'week' ? 7 : 30;
  const since = getSinceDate(days);

  const { data, error } = await supabase
    .from('sessions')
    .select('duration_in_min, stopped_at')
    .eq('user_id', user.id)
    .eq('type_of_session', 'focus')
    .eq('was_cancelled', false)
    .gte('stopped_at', since.toISOString())
    .order('stopped_at', { ascending: true });

  if (!data || error) return [];

  const byDay: Record<string, { count: number; minutes: number }> = {};
  for (const row of data) {
    const key = new Date(row.stopped_at).toDateString();
  
    if (!byDay[key]) {
      byDay[key] = { count: 0, minutes: 0 };
    }

    byDay[key].count += 1;
    byDay[key].minutes += row.duration_in_min;
  }

  const result: DailySession[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);

    const key = d.toDateString();
    const entry = byDay[key] || { count: 0, minutes: 0 };

    result.push({
      date: formatLabel(d, mode),
      count: entry.count,
      minutes: entry.minutes,
    });
  }

  return result;
}

export async function getSelfCareFrequency(mode: 'week' | 'month'): Promise<CategoryCount[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const days = mode === 'week' ? 7 : 30;
  const since = getSinceDate(days);

  const { data, error } = await supabase
    .from('selfcare_logs')
    .select('category_id, selfcare_categories(label, icon)')
    .eq('user_id', user.id)
    .gte('logged_at', since.toISOString());

  if (!data || error) return [];

  const counts: Record<string, { label: string; icon: string; count: number }> = {};
  for (const row of data) {
    const cat = row.selfcare_categories as any;
  
    if (!cat) continue;

    const id = row.category_id;
    if (!counts[id]) {
      counts[id] = { label: cat.label, icon: cat.icon, count: 0 };
    }
    counts[id].count += 1;
  }

  return Object.values(counts).sort((a, b) => b.count - a.count);
}

// Personal insights
export async function getInsights(
  moodData: DailyMood[],
  sessionData: DailySession[],
  selfCareData: CategoryCount[],
): Promise<Insight[]> {
  const insights: Insight[] = [];

  // Mood trend insights
  const logged = moodData.filter(d => d.value > 0);

  if (logged.length >= 3) {
    const half = Math.floor(logged.length / 2);
    const firstHalf = logged.slice(0, half);
    const secondHalf = logged.slice(half);
    const avgFirst = firstHalf.reduce((s, d) => s + d.value, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, d) => s + d.value, 0) / secondHalf.length;
    const overallAvg = logged.reduce((s, d) => s + d.value, 0) / logged.length;
    const diff = avgSecond - avgFirst;

    if (overallAvg <= 2 && Math.abs(diff) < 0.5) {
      insights.push({
        icon: 'heart-outline',
        color: 'pink',
        text: 'You\'ve been feeling low for a while now.',
        suggestion: 'It\'s okay to not be okay. Consider reaching out to someone you trust, or take one small step that feels manageable today.',
      });
    } else if (diff >= 0.5) {
      insights.push({
        icon: 'trending-up',
        color: 'accent',
        text: 'Your mood has been improving recently.',
        suggestion: 'Keep doing what feels good. Consistency in small habits builds resilience.',
      });
    } else if (diff <= -0.5) {
      insights.push({
        icon: 'trending-down',
        color: 'pink',
        text: 'Your mood has been dipping lately.',
        suggestion: 'Try to get enough sleep and take breaks. Rest is productive too.',
      });
    } else {
      insights.push({
        icon: 'remove-outline',
        color: 'accent',
        text: 'Your mood has been steady this period.',
        suggestion: 'Stability is a strength. A short walk or stretch can keep the balance going.',
      });
    }
  }

  // Mood + self-care correlation
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const days = 7;
    const since = getSinceDate(days);

    const { data: logs } = await supabase
      .from('selfcare_logs')
      .select('logged_at, selfcare_categories(label)')
      .eq('user_id', user.id)
      .gte('logged_at', since.toISOString());

    if (logs && logs.length > 0 && logged.length >= 3) {
      const categDays: Record<string, Set<string>> = {}; // key: category; value: set of days
      
      for (const log of logs) {
        const categ = (log.selfcare_categories as any)?.label;
        if (! categ) continue;
        const day = new Date(log.logged_at).toDateString();
        if (!categDays[categ]) {
          categDays[categ] = new Set();
        }
        categDays[categ].add(day);
      }

      let bestCateg = '';
      let bestAvg = 0;
      const overallAvg = logged.reduce((s, d) => s + d.value, 0) / logged.length;

      for (const[categ, daySet] of Object.entries(categDays)) {
        const moodsOnDays = moodData.filter(  // mood log should match the day they did this specific self-care category
          d => d.value > 0 && daySet.has(d.dateKey)
        );
        if (moodsOnDays.length < 2) continue;
        const avg = moodsOnDays.reduce((s, d) => s + d.value, 0) / moodsOnDays.length;
        if (avg > bestAvg) {
          bestAvg = avg;
          bestCateg = categ;
        }
      }
 
      if (bestCateg && bestAvg > overallAvg + 0.3) {
        insights.push({
          icon: 'heart-outline',
          color: 'accent',
          text: `Your mood tends to be higher on days you log ${bestCateg}.`,
          suggestion: 'Self-care isn\'t a luxury. It can directly support how you feel. Prioritise what works for you.',
        });
      }
    }
  }   

  // Find best study day
  const daysWithSessions = sessionData.filter(d => d.count > 0);
  if (daysWithSessions.length > 0) {
    const best = daysWithSessions.reduce((a, b) => a.count > b.count ? a : b);
    if (best.count > 2) {
      insights.push({
        icon: 'star-outline',
        color: 'amber',
        text: `Your most productive day was ${best.date} with ${best.count} sessions!`,
        suggestion: 'Notice what made that day work - timing, mood, environment all matter.',
      });
    }
  }

  // How many days in a row that the user logged a session (loop backwards)
  let streak = 0;
  for (let i = sessionData.length - 1; i >= 0; i--) {
    if (sessionData[i].count > 0) {
      streak++;
    } else {
      break;
    }
  }

  if (streak >= 3) {
    insights.push({
      icon: 'flame-outline',
      color: 'amber',
      text: `You've studied ${streak} days in a row!`,
      suggestion: 'Great momentum! Remember to schedule rest days. Your brain consolidates learning during downtime.',
    });
  }

  // Neglected category
  if (user) {
    const { data: categories } = await supabase
      .from('selfcare_categories')
      .select('id, label, icon')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (categories && categories.length > 0) {
      const sinceThreeDays = new Date();
      sinceThreeDays.setDate(sinceThreeDays.getDate() - 3);
      sinceThreeDays.setHours(0, 0, 0, 0);

      const { data: recentLogs } = await supabase
        .from('selfcare_logs')
        .select('category_id')
        .eq('user_id', user.id)
        .gte('logged_at', sinceThreeDays.toISOString());

      const recentCatIds = new Set((recentLogs || []).map(l => l.category_id));
      const prevUsedCatIds = new Set(selfCareData.map(c => {
        const match = categories.find(categ => categ.label === c.label);
        return match?.id;
      }).filter(Boolean));

      const neglected =  categories.find(
        c => prevUsedCatIds.has(c.id) && !recentCatIds.has(c.id)
      );

      if (neglected) { 
        insights.push({
          icon: 'leaf-outline',
          color: 'pink',
          text: `You haven't logged ${neglected.label} in the last 3 days.`,
          suggestion: 'Even small acts of self-care add up!',
        });
      }
    }
  }

  return insights;
}
      
// Habit prediction
export async function getHabitPrediction(): Promise<HabitPrediction> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { streaks: [], patterns: [] };
  }

  const since = new Date();
  since.setDate(since.getDate() - 13); // Use 14 days of data
  since.setHours(0, 0, 0, 0);

  const { data: logs } = await supabase
    .from('selfcare_logs')
    .select('logged_at, category_id, selfcare_categories(label, icon)')
    .eq('user_id', user.id)
    .gte('logged_at', since.toISOString())
    .order('logged_at', { ascending: true });

  if (!logs || logs.length === 0) {
    return { streaks: [], patterns: [] };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // key: category ID; value: label + icon + dates
  const categDays: Record<string, { label: string; icon: string; dates: Set<string> }> = {};
  for (const log of logs) {
    const categ = (log.selfcare_categories as any);
    if (!categ) continue;
    const id = log.category_id;
    if (!categDays[id]) {
      categDays[id] = { label: categ.label, icon: categ.icon, dates: new Set() };
    }
    categDays[id].dates.add(new Date(log.logged_at).toDateString());
  }

  const streaks: HabitStreak[] = [];
  const patterns: DayPattern[] = [];
  const todayStr = today.toDateString();

  for (const [, categ] of Object.entries(categDays)) {
    // Streak counting
    let streak = 0;
    const loggedToday = categ.dates.has(todayStr); // If user log a categ today, start counting streak from today

    const startDay = new Date(today);
    if (!loggedToday) {
      startDay.setDate(startDay.getDate() - 1); // If not, then yesterday
    }

    // count backwards from start day (consecutive)
    for (let i = 0; i < 14; i++) {
      const checkDate = new Date(startDay);
      checkDate.setDate(startDay.getDate() - i);
      if (categ.dates.has(checkDate.toDateString())) {
        streak++;
      } else {
        break;
      }
    }

    if (streak >= 2) {
      streaks.push({
        label: categ.label,
        icon: categ.icon,
        streak,
        atRisk: !loggedToday && streak >= 3, // If user have 3+ streak but haven't logged today
      });
    }

    // Pattern detection
    // count how many times each day of the week appears over 14 days
    if (categ.dates.size >= 3) {
      const dayCounts: Record<number, number> = {};
      for (const dateStr of categ.dates) {
        const dayIndex = new Date(dateStr).getDay();
        dayCounts[dayIndex] = (dayCounts[dayIndex] || 0) + 1;
      }

      // A day is a patternDay if it appears at least twice in 14 days
      const patternDays: string[] = [];
      for (const [dayIndex, count] of Object.entries(dayCounts)) {
        if (count >= 2) {
          patternDays.push(SHORT_DAYS[Number(dayIndex)]);
        }
      }

      // Only show patterns with 2-5 days
      // < 2 is not a pattern; > 5 means user do this everyday
      if (patternDays.length >= 2 && patternDays.length <= 5) {
        patterns.push({
          label: categ.label,
          icon: categ.icon,
          days: patternDays,
        });
      }
    }
  }
  
  streaks.sort((a, b) => b.streak - a.streak);

  return { streaks, patterns };
}
