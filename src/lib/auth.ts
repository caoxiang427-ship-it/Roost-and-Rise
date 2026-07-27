import * as AuthSession from 'expo-auth-session';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const BASE_MIN_LOCKOUT = 5;
const MAX_ATTEMPTS_BEFORE_LOCKOUT = 5;

function makeRedirect(path: string) {
  return AuthSession.makeRedirectUri(
    isExpoGo ? { path } : { scheme: 'roostandrise', path }
  );
}

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name },
      emailRedirectTo: makeRedirect('sign-in'),
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { locked, secondsLeft } = await checkLockout(email);

  if (locked) {
    const minutes = Math.ceil(secondsLeft / 60);
    return {
      error: `Account locked. Try again in ${minutes} minute(s).`,
      locked: true,
      secondsLeft,
    };
  }

  const { data, error } = await supabase.auth
    .signInWithPassword({ email, password });

  if (error) {
    await failedLoginRecorder(email);
    return { error: error.message, locked: false };
  }

  await resetFailedLogins(email);

  return { data, error: null };
}

export async function signInWithGoogle() {
  const redirectTo = makeRedirect('sign-in');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) return { error };

  if (!data?.url) return { error: 'No OAuth URL returned' };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'success' && result.url) {
    const authUrl = new URL(result.url);
    const fragment = authUrl.hash.substring(1);
    const params = new URLSearchParams(fragment);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      return { data: sessionData, error: sessionError };
    }
  }

  return { error: 'Google sign-in was cancelled or failed' };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPasswordRequest(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error };
}

export async function verifyResetCode(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery',
  });
  return { data, error };
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth
    .updateUser({ password: newPassword });
  return { error };
}

export async function checkLockout(email: string) {
  const { data } = await supabase
    .from('login_attempts')
    .select('count_fail_times, locked_until')
    .eq('email', email)
    .single();

  if (!data) {
    return { locked: false, secondsLeft: 0 };
  }

  if (data.locked_until) {
    const lockedUntil = new Date(data.locked_until);
    const now = new Date();

    if (lockedUntil > now) {
      const secondsLeft = Math.ceil(
        (lockedUntil.getTime() - now.getTime()) / 1000
      );
      return { locked: true, secondsLeft };
    }
  }

  return { locked: false, secondsLeft: 0 };
}

export async function failedLoginRecorder(email: string) {
  const { data } = await supabase
    .from('login_attempts')
    .select('count_fail_times')
    .eq('email', email)
    .single();

  const currentCount = data?.count_fail_times || 0;
  const newCount = currentCount + 1;

  let lockedUntil: string | null = null;
  if (newCount >= MAX_ATTEMPTS_BEFORE_LOCKOUT) {
    const lockoutTier = newCount - MAX_ATTEMPTS_BEFORE_LOCKOUT + 1;
    const lockoutMinutes = BASE_MIN_LOCKOUT * Math.pow(2, lockoutTier - 1);

    const untilTime = new Date();
    untilTime.setMinutes(untilTime.getMinutes() + lockoutMinutes);
    lockedUntil = untilTime.toISOString();
  }

  const result = await supabase
    .from('login_attempts')
    .upsert({
      email,
      count_fail_times: newCount,
      locked_until: lockedUntil,
      last_attempt_at: new Date().toISOString(),
    });

  return result;
}

export async function resetFailedLogins(email: string) {
  const result = await supabase
    .from('login_attempts')
    .upsert({
      email,
      count_fail_times: 0,
      locked_until: null,
      last_attempt_at: new Date().toISOString(),
    });

  return result;
}