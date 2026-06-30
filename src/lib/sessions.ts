/* 
 * Helper function for Pomodoro timer
*/

import { supabase } from './supabase';

export async function sessionRecorder(
  durationInMin: number, 
  typeOfSession: 'focus' | 'break',
  wasCancelled: boolean = false
) {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Saving session, user:', user?.id, user?.email);  

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

