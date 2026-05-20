/*
 * Authentication helper function for Supabase.
 * Wraps Supabase auth calls so screens can import them from one place.
*/

import { supabase } from './supabase';

// Create a new account with email and password
export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Pass display name as metadata into auth.users table
      // Database trigger reads this to auto-create the user's row in profiles table
      data: { display_name: displayName },
    },
  });
  return { data, error };
}

// Log in an existing acocunt with email and password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

// Log out the current user account and clear the saved session from the device
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
