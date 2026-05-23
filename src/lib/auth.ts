/*
 * Authentication helper function.
 * All Supabase login/signup/logout logic is here.
*/

import { supabase } from './supabase';

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Pass display name as metadata into auth.users table
      // Database trigger reads this to auto-create the user's row in profiles table
      data: { display_name: name },
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth
    .signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
