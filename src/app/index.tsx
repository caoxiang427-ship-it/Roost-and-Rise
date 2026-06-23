/* 
 * Home screen. 
 * Only logged in users reach this page.
 * Handle log out.
*/

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth'; 
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import BurnoutIndicator from '@/components/BurnoutIndicator';
import { getTodaysFocusSessionCount } from '@/lib/sessions';
import EmojiPicker from '@/components/EmojiPicker';

function getDailyGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning 🌄';
  if (hour < 18) return 'Good afternoon ☕️';
  if (hour < 22) return 'Good evening 🌃';
  return 'Time to rest 💤';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

export default function HomeScreen() {
  const[name, setName] = useState('');
  const[daysUsed, setDaysUsed] = useState(1);
  const[isLoggingOut, setIsLoggingOut] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const [testEmoji, setTestEmoji] = useState('😀');

  useEffect(() => {
    async function getUserProfile() {
      const { data: {user} } = await supabase.auth.getUser();
      
      if (!user) return;
 
      const metadataName = user.user_metadata?.display_name;

      if (metadataName) {
        setName(metadataName);
      } else {
        const { data } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();

        if (data) setName(data.display_name ?? '');
      }
      
      // days used for the user
      if (user.created_at) {
        const created = new Date(user.created_at);
        const today = new Date();
        const diff = today.getTime() - created.getTime();   
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
        setDaysUsed(diffDays);
      }
    }
    getUserProfile();
  }, []);

  useEffect(() => {
    async function loadCount() {
      const count = await getTodaysFocusSessionCount();
      setCompletedToday(count);
    }
    loadCount();
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);

    const { error } = await signOut();

    setIsLoggingOut(false);

    if (error) {
      Alert.alert('Error', 'Could not log out. Try again.');
      return;
    }
    router.replace('/(auth)/sign-in');
  }

  function getSessionSubtitle() {
    const nextSession = completedToday + 1;
    const cyclePosition = ((nextSession - 1) % 4) + 1;
    const isNextLongBreak = nextSession % 4 === 0;
    const breakMinutes = isNextLongBreak ? 15 : 5;
    
    return `Session ${cyclePosition} of 4 · then a ${breakMinutes}-min break`;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>
        {getDailyGreeting()}, {name || 'friend'}!
      </Text>
      <Text style={styles.subtitle}>
        {getFormattedDate()} · Day {daysUsed}
      </Text>

      <EmojiPicker selectedEmoji={testEmoji} onSelect={setTestEmoji} />

      <BurnoutIndicator compact />

      {/* Virtual chicken (just placeholder now) */}
      <View style={styles.chickenSection}>
        <Text style={styles.chickenEmoji}>🐔</Text>
        <Text style={styles.chickenName}>Sunny · Lvl 1</Text>
      </View>

      <Link href="/(tabs)/pomodoro_timer" asChild>
        <Pressable style={styles.focusCard}>
          <View style={styles.focusTextBlock}>
            <Text style={styles.focusLabel}>FOCUS SESSION</Text>
            <Text style={styles.focusTime}>25:00</Text>
            <Text style={styles.focusSubtitle}>
              {getSessionSubtitle()}
            </Text>
          </View>

          <View style={styles.focusStartButton}>
            <Text style={styles.focusStartIcon}>▶</Text>
            <Text style={styles.focusStartText}>Start</Text>
          </View>
        </Pressable>
      </Link>
      
      {/* OR a list containing both work and recovery things? */}
      <Link href="/(tabs)/care" asChild>
        <Pressable style={styles.recoveryCard}>
          <Text style={styles.recoveryEmoji}>🔋</Text>
          <View style={styles.recoveryTextBlock}>
            <Text style={styles.recoveryTitle}>Recovery Time</Text>
            <Text style={styles.recoverySubtitle}>Log self-care + mood</Text>
          </View>
        </Pressable>
      </Link>

      <Pressable
        style={[styles.logoutButton, isLoggingOut && styles.buttonDisabled]}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        <Text style={styles.buttonText}>
          {isLoggingOut ? 'Logging out...' : 'Log Out'}
        </Text>
      </Pressable>

      {/* tabs later */}
  
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE8B8',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 14,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3D2914',
  },
  subtitle: {
    fontSize: 13,
    color: '#8B6F3F',
    marginBottom: 4,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#8B6F3F',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    color: '#3D2914',
    fontWeight: 'bold',
    marginTop: 6,
  },
  chickenSection: {
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 12,
  },
  chickenEmoji: {
    fontSize: 140,
    marginBottom: 16,
  },
  chickenName: {
    fontSize: 15,
    color: '#3D2914',
    fontWeight: 'bold',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  focusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  focusTextBlock: {
    flex: 1,
  },
  focusLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: '#8B6F3F',
    marginBottom: 6,
  },
  focusTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3D2914',
    marginBottom: 6,
  },
  focusSubtitle: {
    fontSize: 12,
    color: '#8B6F3F',
  },
  focusStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3D2914',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 999,
    gap: 6,
  },
  focusStartIcon: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  focusStartText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  recoveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recoveryEmoji: {
    fontSize: 28,
  },
  recoveryTextBlock: {
    flex: 1,
  },
  recoveryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3D2914',
  },
  recoverySubtitle: {
    fontSize: 12,
    color: '#8B6F3F',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#E8A33D',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
