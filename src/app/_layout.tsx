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
import {  useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';


export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);

  SplashScreen.preventAutoHideAsync();

    // load custom fonts
  const [fontLoaded, error] = useFonts({
      InterRegular: require("../../assets/fonts/Inter_18pt-Regular.ttf"),
      InterSemiBold: require("../../assets/fonts/Inter_18pt-SemiBold.ttf"),
      InterBold: require("../../assets/fonts/Inter_18pt-Bold.ttf")
    });

    // if fonts aren't loaded, keep splashscreen until it's loaded
  useEffect(() => {
      if (fontLoaded || error) SplashScreen.hideAsync();
    }, [fontLoaded, error]);

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
  }, []); // this dependency array allows only the code to run once, to avoid phone crash

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
  }, [session, isLoading, segments]);// update whenever login status, loading status, and current screen changes

  // Loading UI
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8A33D" />
      </View>
    );

    if (!fontLoaded && !error) return null;

  }
  
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="explore" options={{ title: 'Explore' }} />
      <Stack.Screen name="(auth)/sign-up" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="(auth)/sign-in" options={{ title: 'Sign In' }} />
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
