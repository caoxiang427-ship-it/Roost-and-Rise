/* 
 * Root layout for the app.
 * Set up the stack navigator that manages the screens.
 * Screens stack on top of each other and the "back" button pops the top screen off.
 * Every screen file is registered here.
 * Check login status and redirects users.
 * If not logged in, users are forced to sign in.
 * If users have logged in already, they should be kept out of auth screens.
*/

import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);

  // Load any saved session and track login/logout changes
  useEffect(() => {
    async function checkUser() {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (error) {
        console.error('Failed to load user session: ', error);
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, []); 

  // Track for auth state changes
  useEffect(() => {
    const { data: tracker } = supabase.auth
      .onAuthStateChange((_event, loadedSession) => {
        setSession(loadedSession);
    });
    
    // turn off the login tracker, which can prevent app from slowing down
    return () => tracker.subscription.unsubscribe();
  }, []);

  // Redirect the user based on login status
  useEffect(() => {
    if (isLoading) return;

    const isViewingAuth = segments[0] === '(auth)';

    if (!session && !isViewingAuth) {
      router.replace('/(auth)/sign-in');
    } else if (session && isViewingAuth) {
      router.replace('/'); 
    }
  }, [session, isLoading, segments]);

  // Loading UI
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8A33D" />
      </View>
    );
  }
  
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="explore" options={{ title: 'Explore' }} />
      <Stack.Screen name="(auth)/sign-up" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="(auth)/sign-in" options={{ title: 'Sign In' }} />
      <Stack.Screen name="(auth)/forgot_password" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/reset_password" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)/pomodoro_timer" options={{ title: 'Focus' }} />
      <Stack.Screen name="(tabs)/care" options={{ title: 'Recharge Time' }} />
      <Stack.Screen
        name="(tabs)/edit_categories"
        options={{
          headerShown: true,
          title: 'Edit Categories',
          headerStyle: { backgroundColor: '#FFE8B8' },
          headerTintColor: '#3D2914',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack>
  );
}
   
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9E6'
  },
});  
