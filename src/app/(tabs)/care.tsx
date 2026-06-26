/*
 * Self-Care & recovery screen.
 * Log self-care activities & daily mood.
 */

import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  logSelfCare,
  getTodaySelfCareData,
  getTodaySelfCareCounts,
  logMood,
  hasLoggedMoodToday,
  getUserCategories,
  SelfCareCategory,
  getTodaysMood,
} from '@/lib/self-care';
import BurnoutIndicator from '@/components/BurnoutIndicator';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOODS = [
  { id: 'exhausted', emoji: '😩', label: 'Exhausted' }, 
  { id: 'stressed', emoji: '😣', label: 'Stressed' },
  { id: 'okay', emoji: '😐', label: 'Okay' },
  { id: 'good', emoji: '🙂', label: 'Good' },
  { id: 'great', emoji: '😄', label: 'Great' },
];

export default function SelfCareScreen() {
  const [activityCateg, setActivityCateg] = useState<string | null>(null);
  const [activityInput, setActivityInput] = useState('');
  const [selfCareCounts, setSelfCareCounts] = useState<Record<string, number>>({});
  const [isMoodLogged, setIsMoodLogged] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<SelfCareCategory[]>([]);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadLogs();
    loadCategories();
    loadCurrentMood();
  }, []);

  async function handleSelfCareLog(categoryId: string) {
    const result = await logSelfCare(categoryId, activityInput || null);
    
    if (result.error) {
      Alert.alert('Error:', 'Could not log. Please try again.');
      return;
    }

    setActivityInput('');
    
    setActivityCateg(null);
    
    loadLogs();
  }

  async function loadLogs() {
    const { counts, recentActivities } = await getTodaySelfCareData();
    
    setSelfCareCounts(counts);
    setRecentActivities(recentActivities);
  
    const moodLogged = await hasLoggedMoodToday();
    setIsMoodLogged(moodLogged);
  }

  async function loadCategories() {
    const categs = await getUserCategories();
    setCategories(categs);
  }

  async function handleMoodLog(moodId: string) {
    const result = await logMood(moodId);
    
    if (result.error) {
      Alert.alert('Error:', 'Could not log mood.');
      return;
    }
 
    setCurrentMood(moodId);  
  }

  async function loadCurrentMood() {
    const mood = await getTodaysMood();
    setCurrentMood(mood);
  }

  function getMoodEmoji(mood: string | null): string {
    const found = MOODS.find(m => m.id === mood);
    return found ? `${found.emoji} ${found.label}` : '';
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { 
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 100,
        } 
      ]}
    >
      <Text style={styles.title}>Recharge Time 🌿</Text>

      <BurnoutIndicator />

      <View style={styles.moodCard}>
        {currentMood ? (
          <View style={styles.moodQuestionWrap}>
            <Text style={styles.moodQuestion}>
              Today's mood: {getMoodEmoji(currentMood)}
            </Text>
            <Text style={styles.moodSubtext}>
              Update if it changed?
            </Text>
          </View>
        ) : (
          <Text style={styles.moodQuestion}>
            How are you feeling today?
          </Text>
        )}
        <View style={styles.moodOptions}>
          {MOODS.map(mood => (
            <Pressable
              key={mood.id}
              onPress={() => handleMoodLog(mood.id)}
              style={styles.moodButton}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={styles.moodLabel}>{mood.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Self-care category list */}
      <Text style={styles.careTitle}>Recovery list</Text>

      {categories.map(cat => (
        <View 
          key={cat.id} 
          style={styles.careCard}
        >
          <Pressable
            onPress={() => setActivityCateg(
              activityCateg === cat.id ? null : cat.id
            )}
            style={styles.categoryOptions}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryLabel}>
                {cat.emoji} {cat.label}
              </Text>
              {recentActivities[cat.id] && (
                <Text style={styles.recentActivity}>
                  Latest: {recentActivities[cat.id]}
                </Text>
              )}
            </View>
            <Text style={styles.selfCareCounts}>
              {selfCareCounts[cat.id] || 0}
            </Text>
          </Pressable>

          {/* Expanded input -- only shown if the user choose the category */}
          {activityCateg === cat.id && (
            <View style={styles.expandedField}>
              <TextInput
                style={styles.input}
                onChangeText={setActivityInput}
                value={activityInput}
                placeholder="What's the activity? (optional)"
              />
              <Pressable
                style={styles.logButton}
                onPress={() => handleSelfCareLog(cat.id)}
              >
                <Text style={styles.logButtonText}>Log</Text>
              </Pressable>
            </View>
          )}
        </View>
      ))}

      <Link href="/(tabs)/edit_categories" asChild>
        <Pressable style={styles.manageCard}>
          <Text style={styles.manageText}>⚙️  Manage categories</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE8B8',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    gap: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3D2914',
    marginBottom: 4,
  },
  moodCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  moodQuestion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3D2914',
    textAlign: 'center',
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  moodButton: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    color: '#8B6F3F',
    fontWeight: '600',
  },
  careTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D2914',
    marginTop: 8,
    marginBottom: 4,
  },
  careCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#3D2914',
    fontWeight: '600',
  },
  selfCareCounts: {
    fontSize: 16,
    color: '#A67C2E',
    fontWeight: 'bold',
  },
  expandedField: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0E4C8',
    paddingTop: 12,
  },
  input: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#3D2914',
    borderWidth: 1,
    borderColor: '#E0D4A8',
  },
  logButton: {
    backgroundColor: '#E8A33D',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recentActivity: {
    fontSize: 12,
    color: '#8B6F3F',
    fontStyle: 'italic',
    marginTop: 2,
  },
  manageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0D4A8',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  manageText: {
    fontSize: 18,                
    color: '#A67C2E',
    fontWeight: 'bold',
  },
  moodQuestionWrap: {
    alignItems: 'center',
    gap: 4,
  },
  moodSubtext: {
    fontSize: 12,
    color: '#8B6F3F',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});



























