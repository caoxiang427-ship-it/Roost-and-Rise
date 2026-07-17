/* 
 * Helper function for Pomodoro timer
*/

import { supabase } from './supabase';

export interface DailySessionTotals {
  studyMinutes: number;
  breakMinutes: number;
}

export interface TodaySessionStats {
  studyMinutes: number; // includes cancelled 
  breakMinutes: number; // includes cancelled
  focusStarted: number;
  focusCompleted: number;  
}

export async function sessionRecorder(
  durationInMin: number, 
  typeOfSession: 'focus' | 'break',
  wasCancelled: boolean = false
) {
  const { data: { user } } = await supabase.auth.getUser(); 

  if (!user) {
    console.log('No user, returning early');
    return { error: 'Not signed in' };
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      duration_in_min: durationInMin,
      type_of_session: typeOfSession,
      was_cancelled: wasCancelled,
    });

  if (error) {
    console.error("Failed to save Pomodoro session:", error.message);
  }

  return { data, error };
}

// Also include partial study session.
export async function getTodayStudyMinutes() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from('sessions')
    .select('duration_in_min')
    .eq('user_id', user.id)
    .eq('type_of_session', 'focus')
    .gte('stopped_at', today.toISOString());

  if (!data) return 0;
 
  const result = data.reduce((sum, s) => sum + s.duration_in_min, 0);
  
  return result;
}

export async function getTodaysFocusSessionCount() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('type_of_session', 'focus')
    .eq('was_cancelled', false)   
    .gte('stopped_at', today.toISOString());

  return count || 0;
}

export async function getTodaysBreakCount() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('type_of_session', 'break')
    .gte('stopped_at', today.toISOString());

  return count || 0;
}

export async function getTodaySessionStats(): Promise<TodaySessionStats> {
  const stats: TodaySessionStats = {
    studyMinutes: 0, breakMinutes: 0, focusStarted: 0, focusCompleted: 0,
  };

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return stats;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('sessions')
    .select('type_of_session, duration_in_min, was_cancelled')
    .eq('user_id', user.id)
    .gte('stopped_at', today.toISOString());

  if (!data || error) return stats;

  for (const s of data) {
    if (s.type_of_session === 'focus') {
      stats.focusStarted += 1;
      stats.studyMinutes += s.duration_in_min;

      if (!s.was_cancelled) {
        stats.focusCompleted += 1;
      }
    } else {
      stats.breakMinutes += s.duration_in_min;
    }
  }
  return stats;
}

export async function getRecentDailyTotals(
  days: number
): Promise<Record<string, DailySessionTotals>> {
  const out: Record<string, DailySessionTotals> = {};

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return out;

  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('sessions')
    .select('type_of_session, duration_in_min, stopped_at')
    .eq('user_id', user.id)
    .gte('stopped_at', start.toISOString());

  if (!data || error) return out;

  for (const s of data) {
    const key = new Date(s.stopped_at).toDateString();

    if (!out[key]) {
      out[key] = { studyMinutes: 0, breakMinutes: 0 };
    }

    if (s.type_of_session === 'focus') out[key].studyMinutes += s.duration_in_min;
    else out[key].breakMinutes += s.duration_in_min;
  }
  return out;
}