/* 
 * Root layout for the app.
 * Set up the stack navigator that manages the screens.
 * Screens stack on top of each other and the "back" button pops the top screen off.
 * Every screen file is registered here.
 * Check login status and redirects users.
 * If not logged in, users are forced to sign in.
 * If users have logged in already, they should be kept out of auth screens.
*/

import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

SplashScreen.preventAutoHideAsync().catch(() => {});

configureReanimatedLogger({
  level: ReanimatedLogLevel.error,
  strict: false,
});

export default function RootLayout() {

  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  // after checking if onboarding is completed -> set is Ready
  const [isReady, setIsReady] = useState(false);

    // load custom fonts
  const [fontLoaded, error] = useFonts({
      InterRegular: require("../../assets/fonts/Inter_18pt-Regular.ttf"),
      InterSemiBold: require("../../assets/fonts/Inter_18pt-SemiBold.ttf"),
      InterBold: require("../../assets/fonts/Inter_18pt-Bold.ttf"),
      Fredoka: require("../../assets/fonts/Fredoka-SemiBold.ttf"), 
    });

    // if fonts aren't loaded, keep splashscreen until it's loaded
  useEffect(() => {
    if (fontLoaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
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
  }, []); 

  // Track for auth state changes
  useEffect(() => {
    const { data: tracker } = supabase.auth
      .onAuthStateChange((_event, loadedSession) => {
        setSession(loadedSession);
    });
    
    return () => tracker.subscription.unsubscribe();
  }, []);

  // Redirect the user based on login + onboarding status.
  // Re-reads AsyncStorage on every navigation so it always sees the latest value written by the onboarding screen.
  useEffect(() => {
    const evaluate = async () => {
      if (isLoading) return;

      const onboardedValue = await AsyncStorage.getItem('hasOnboarded');
      const hasOnboarded = onboardedValue === 'true';

      const isViewingAuth = segments[0] === '(auth)';
      const isViewingOnboarding = segments[0] === 'onboarding';

      if (!session && !isViewingAuth) {
        router.replace('/(auth)/sign-in');
      } else if (session && !hasOnboarded && !isViewingOnboarding) {
        router.replace('/onboarding');
      } else if (session && hasOnboarded && (isViewingAuth || isViewingOnboarding)) {
        router.replace('/');
      }

      setIsReady(true);
    };
    evaluate();
  }, [session, isLoading, segments]);

  if (isLoading || !isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5E90A1" />
      </View>
    );
  }
  
  if (!fontLoaded && !error) return null;
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)/sign-up" options={{ title: 'Sign Up' }} />
            <Stack.Screen name="(auth)/sign-in" options={{ title: 'Sign In' }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name='(tabs)' options={{ headerShown: false }}/>
            <Stack.Screen name='profile' options={{ animation: 'slide_from_right' }}/>
          </Stack>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
