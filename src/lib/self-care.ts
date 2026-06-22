/* 
 * Self-care and mood logs helper functions.
*/

import { supabase } from './supabase';

export async function logSelfCare(
  category: string,
  activity?: string | null,
  amount?: number | null
) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) { 
    return { error: 'Not signed in' };
  }

  return await supabase.from('selfcare_logs').insert({
    user_id: user.id,
    category: category,
    activity: activity || null, 
    amount: amount || null,
  });
}

export async function getTodaySelfCareCounts() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('selfcare_logs')
    .select('category')
    .eq('user_id', user.id)
    .gte('logged_at', today.toISOString());

  if (!data || error) return {};

  return data.reduce<Record<string, number>>((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {});
}

export async function getTodaySelfCareData() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { counts: {}, recentActivities: {} };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('selfcare_logs')
    .select('category, activity')
    .eq('user_id', user.id)
    .gte('logged_at', today.toISOString())
    .order('logged_at', { ascending: false });

  if (!data || error) return { counts: {}, recentActivities: {} };

  const counts = data.reduce<Record<string, number>>((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {});

  const recentActivities = data.reduce<Record<string, string>>((acc, log) => {
    if (log.activity && !acc[log.category]) {
      acc[log.category] = log.activity;
    }
    return acc;
  }, {});

  return { counts, recentActivities };
}

export async function logMood(mood: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not signed in' };
  }

  return await supabase.from('mood_logs').insert({
    user_id: user.id,
    mood: mood
  });
}

// for burnout scores
export async function getRecentMood(days: number = 7) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from('mood_logs')
    .select('mood, logged_at')
    .eq('user_id', user.id)
    .gte('logged_at', since.toISOString())
    .order('logged_at', { ascending: false });

  return data || [];
}  

export async function hasLoggedMoodToday() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('mood_logs')
    .select('id')
    .eq('user_id', user.id)
    .gte('logged_at', today.toISOString())
    .limit(1);

  if (!data || error) return false;

  return data.length > 0; // check whether data exists && it's not an empty array
}
  
