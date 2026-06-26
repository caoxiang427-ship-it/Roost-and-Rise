/* 
 * Self-care and mood logs helper functions.
*/

import { supabase } from './supabase';

export interface SelfCareCategory {
  id: string;
  label: string;
  emoji: string;
  display_order: number;
}

// Get all active categories, ordered by display_order
export async function getUserCategories(): Promise<SelfCareCategory[]> {
  const { data: { user } } = await supabase.auth.getUser();
 
  if (!user) return [];

  const { data, error } = await supabase
    .from('selfcare_categories')
    .select('id, label, emoji, display_order')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (!data || error) return [];

  return data;
}

export async function addCategory(label: string, emoji: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not signed in' };

  const { data: existing } = await supabase
    .from('selfcare_categories')
    .select('display_order')
    .eq('user_id', user.id)
    .order('display_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0
    ? existing[0].display_order + 1 : 1;

  const result = await supabase
    .from('selfcare_categories')
    .insert({
      user_id: user.id,
      label,
      emoji,
      display_order: nextOrder,
    });

  return result;
}

export async function updateCategory(id: string, label: string, emoji: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not signed in' };

  const result = await supabase
    .from('selfcare_categories')
    .update({ label, emoji })
    .eq('id', id)
    .eq('user_id', user.id);

  return result;
}

export async function deleteCategory(id: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not signed in' };

  const result = await supabase
    .from('selfcare_categories')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', user.id);

  return result;
}

export async function logSelfCare(
  categoryId: string,
  activity?: string | null,
  amount?: number | null
) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) { 
    return { error: 'Not signed in' };
  }

  return await supabase.from('selfcare_logs').insert({
    user_id: user.id,
    category_id: categoryId,
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
    .select('category_id')
    .eq('user_id', user.id)
    .gte('logged_at', today.toISOString());

  if (!data || error) return {};

  return data.reduce<Record<string, number>>((acc, log) => {
    acc[log.category_id] = (acc[log.category_id] || 0) + 1;
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
    .select('category_id, activity, logged_at')
    .eq('user_id', user.id)
    .gte('logged_at', today.toISOString())
    .order('logged_at', { ascending: false });

  if (!data || error) return { counts: {}, recentActivities: {} };

  const counts = data.reduce<Record<string, number>>((acc, log) => {
    acc[log.category_id] = (acc[log.category_id] || 0) + 1;
    return acc;
  }, {});

  const recentActivities = data.reduce<Record<string, string>>((acc, log) => {
    if (log.activity && !acc[log.category_id]) {
      acc[log.category_id] = log.activity;
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

export async function getTodaysMood() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('mood_logs')
    .select('mood')
    .eq('user_id', user.id)
    .gte('logged_at', today.toISOString())
    .order('logged_at', { ascending: false })  
    .limit(1);

  if (!data || error || data.length === 0) return null;
  return data[0].mood;
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
  
