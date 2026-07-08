/*
 * Self-Care & recovery screen.
 * Log self-care activities & daily mood.
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, ImageBackground, Modal, } from 'react-native';
import {
  logSelfCare,
  getTodaySelfCareData,
  getTodaySelfCareCounts,
  logMood,
  hasLoggedMoodToday,
  getUserCategories,
  SelfCareCategory,
  getTodaysMood,
  getTodayLogEntries,
  SelfCareLogEntry,
} from '@/lib/self-care';
import BurnoutIndicator from '@/components/BurnoutIndicator';
import { Link, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfileStore } from '@/store/useProfileStore';
import ShowReward from '@/components/ShowReward';
import { styles } from '@/styles/care_styles';
import { Ionicons } from '@expo/vector-icons';
import WellnessNotice from '@/components/WellnessNotice';
import { calculateBurnoutScore, BurnoutResult } from '@/lib/burnout';
import { shouldShowWellnessNotice } from '@/lib/wellnessNotice';
import WellnessToast from '@/components/WellnessToast';
import { BURNOUT_CONFIG } from '@/lib/burnout_constants';

const HEADER_IMG = require('@/assets/images/care/header.jpg');

const MOODS = [
  { id: 'exhausted', emoji: '😩', label: 'Exhausted' }, 
  { id: 'stressed', emoji: '😣', label: 'Stressed' },
  { id: 'okay', emoji: '😐', label: 'Okay' },
  { id: 'good', emoji: '🙂', label: 'Good' },
  { id: 'great', emoji: '😄', label: 'Great' },
];

export const CATEGORY_CATALOG = [
  // default
  { key: 'sleep',     label: 'Sleep',     icon: 'moon-outline',           isDefault: true },
  { key: 'move',      label: 'Exercise',  icon: 'barbell-outline',        isDefault: true },
  { key: 'connect',   label: 'Connect',   icon: 'people-outline',         isDefault: true },
  { key: 'nourish',   label: 'Eat well',  icon: 'restaurant-outline',     isDefault: true },
  { key: 'unwind',    label: 'Unwind',    icon: 'leaf-outline',           isDefault: true },
  { key: 'play',      label: 'Hobbies',   icon: 'color-palette-outline',  isDefault: true },
  // extra
  { key: 'outdoors',  label: 'Outdoors',  icon: 'sunny-outline',          isDefault: false },
  { key: 'hydrate',   label: 'Hydrate',   icon: 'water-outline',          isDefault: false },
  { key: 'journal',   label: 'Journal',   icon: 'book-outline',           isDefault: false },
  { key: 'breathe',   label: 'Breathe',   icon: 'pulse-outline',          isDefault: false },
];

const CHIP_COLORS = [
  { card: '#EBF1E4', chip: '#D6E3C8', fg: '#4F6B3C' },
  { card: '#E3EDDA', chip: '#CCDDBC', fg: '#4F6B3C' },
  { card: '#DCE8D2', chip: '#C5D8B3', fg: '#4F6B3C' },
];

const LOG_MOOD_XP = 15;
const LOG_RECOVERY_XP = 5;
const LOG_MOOD_COIN_BONUS = 5;
const LOG_RECOVERY_COIN_BONUS = 2;

export default function SelfCareScreen() {
  const [activityCateg, setActivityCateg] = useState<string | null>(null);
  const [activityInput, setActivityInput] = useState('');
  const [selfCareCounts, setSelfCareCounts] = useState<Record<string, number>>({});
  const [isMoodLogged, setIsMoodLogged] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<SelfCareCategory[]>([]);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // for wellnesstoast
  const [wellnessDelta, setWellnessDelta] = useState<number | null>(null);
  const [wellnessReason, setWellnessReason] = useState('');
  const [showWellness, setShowWellness] = useState(false);

  // for the temporary ShowReward display everytime user logs mood/ recovery item
  const [showReward, setShowReward] = useState(false);
  const [rewardXP, setRewardXP] = useState(0);
  const [rewardCoins, setRewardCoins] = useState(0);
  const [todayLogs, setTodayLogs] = useState<SelfCareLogEntry[]>([]);
  const [burnout, setBurnout] = useState<BurnoutResult | null>(null);
  const [showNotice, setShowNotice] = useState(false);
  const {addWellbeingXp} = useProfileStore();

  useFocusEffect(
    useCallback(() => {
      loadCategories();
      loadLogs();
      loadCurrentMood();
      loadBurnout();
    }, [])
  );

  const triggerReward = (xp: number, coins: number) => {
    setRewardXP(xp);
    setRewardCoins(coins);
    setShowReward(true);
    setTimeout(() => setShowReward(false), 2000);
  };

  function triggerWellnessToast(delta: number, reason: string) {
    if (delta <= 0) return; // only celebrate gains
    setWellnessDelta(delta);
    setWellnessReason(reason);
    setShowWellness(true);
    setTimeout(() => setShowWellness(false), 2200);
  }

  async function handleSelfCareLog(categoryId: string) {
    const result = await logSelfCare(categoryId, activityInput || null);
    
    if (result.error) {
      Alert.alert('Error:', 'Could not log. Please try again.');
      return;
    }

    setActivityInput('');
    
    setActivityCateg(null);
    
    loadLogs();

    // for each log XP is awarded
    await addWellbeingXp(LOG_RECOVERY_XP, LOG_RECOVERY_COIN_BONUS);
    triggerReward(LOG_RECOVERY_XP, LOG_RECOVERY_COIN_BONUS)

    // for wellness gain
    const totalToday = Object.values(selfCareCounts).reduce((s, n) => s + n, 0) + 1;
    if (totalToday === BURNOUT_CONFIG.GOOD_SELFCARE_COUNT) {
      triggerWellnessToast(BURNOUT_CONFIG.SELFCARE_BONUS, 'Great self-care today');
    }
  }

  async function loadLogs() {
    const { counts, recentActivities } = await getTodaySelfCareData();
    
    setSelfCareCounts(counts);
    setRecentActivities(recentActivities);

    const entries = await getTodayLogEntries();
    setTodayLogs(entries);
  
    const moodLogged = await hasLoggedMoodToday();
    setIsMoodLogged(moodLogged);
  }

  async function loadCategories() {
    const categs = await getUserCategories();
    setCategories(categs);
  }

  async function handleMoodLog(moodId: string) {
    // check if it's the first time user logs mood today
    const isFirstToday = !isMoodLogged;

    const result = await logMood(moodId);
    
    if (result.error) {
      Alert.alert('Error:', 'Could not log mood.');
      return;
    }
    setCurrentMood(moodId);

    if (isFirstToday) {
      await addWellbeingXp(LOG_MOOD_XP, LOG_MOOD_COIN_BONUS);
      triggerReward(LOG_MOOD_XP, LOG_MOOD_COIN_BONUS)
    }

    const moodAdj = BURNOUT_CONFIG.MOOD_SCORES[moodId as keyof typeof BURNOUT_CONFIG.MOOD_SCORES] || 0;
    if (moodAdj > 0) {
      triggerWellnessToast(
        moodAdj,
        moodId === 'great' ? 'Feeling great today' : 'Feeling good today'
      );
    }

    await loadBurnout(); 
  }

  async function loadCurrentMood() {
    const mood = await getTodaysMood();
    setCurrentMood(mood);
  }

  async function loadBurnout() {
    setBurnout(await calculateBurnoutScore());
  }

  function getMoodEmoji(mood: string | null): string {
    const found = MOODS.find(m => m.id === mood);
    return found ? `${found.emoji} ${found.label}` : '';
  }

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const selectedCategory = categories.find(c => c.id == activityCateg) || null;

  function closeLogModal() {
    setActivityCateg(null);
    setActivityInput('');
  }

  function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getCategory(categoryId: string): SelfCareCategory | undefined {
    return categories.find(c => c.id === categoryId);
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Header: title + date */}
        <ImageBackground
          source={HEADER_IMG}
          style={styles.headerBand}
          imageStyle={styles.headerImage}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: '#13301B' }]}>Recovery</Text>
              <Text style={styles.date}>{todayLabel}</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Hero card = wellness ring (BurnoutIndicator) */}
        <View style={styles.heroCard}>
          <BurnoutIndicator result={burnout} />
        </View>

        {showNotice && burnout && (
          <WellnessNotice status={burnout.status} factors={burnout.factors} />
        )}

        {/* Mood check-in */}
        <View style={styles.moodCard}>
          <Text style={[styles.moodQuestion, { color: '#13301B' }]}>
            {currentMood ? 'How are you feeling now?' : 'How are you feeling today?'}
          </Text>
          <View style={styles.moodOptions}>
            {MOODS.map(mood => {
              const isActive = currentMood === mood.id;
              return (
                <Pressable key={mood.id} onPress={() => handleMoodLog(mood.id)} style={styles.moodButton}>
                  <View style={[styles.moodCircle, isActive && styles.moodCircleActive]}>
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Category grid */}
        <Text style={[styles.sectionTitle, { color: '#13301B' }]}>Self-care</Text>

        <View style={styles.grid}>
          {categories.map((cat, index) => {
            const isSelected = activityCateg === cat.id;
            const shade = CHIP_COLORS[index % CHIP_COLORS.length];
            return (
              <Pressable
              key={cat.id}
              onPress={() => setActivityCateg(isSelected ? null : cat.id)}
              style={[
                styles.careTile,
                { backgroundColor: shade.card, borderColor: shade.card },
                isSelected && styles.careTileActive,
              ]}
            >
              <View style={[styles.tileIcon, { backgroundColor: shade.chip }]}>
                <Ionicons name={cat.icon as any} size={24} color={shade.fg} />
              </View>
              <Text style={styles.tileLabel} numberOfLines={1}>{cat.label}</Text>
            </Pressable>
          );
        })}

          {/* Manage categories tile */}
          <Link href="/(tabs)/edit_categories" asChild>
            <Pressable style={styles.addTile}>
              <Ionicons name="settings-outline" size={22} color="#6E7D67" />
              <Text style={styles.addText}>Manage</Text>
            </Pressable>
          </Link>
        </View>

        {/* Today's log */}
        {todayLogs.length > 0 && (
          <>
            <View style={styles.logHeader}>
              <Text style={[styles.sectionTitle, { color: '#13301B' }]}>Today's log</Text>
              <Text style={styles.logCount}>
                {todayLogs.length} {todayLogs.length === 1 ? 'activity' : 'activities'}
              </Text>
            </View>
            <View style={styles.logList}>
              {todayLogs.map(entry => {
                const cat = getCategory(entry.category_id);
                return (
                  <View key={entry.id} style={styles.logRow}>
                    <View style={styles.logIcon}>
                      <Ionicons name={(cat?.icon ?? 'ellipse-outline') as any} size={20} color="#6E7D67" />
                    </View>
                    <View style={styles.logTextBlock}>
                      <Text style={styles.logMain} numberOfLines={1}>
                        {entry.activity || cat?.label || 'Logged'}
                      </Text>
                      <Text style={styles.logSub} numberOfLines={1}>
                        {entry.activity ? cat?.label : 'No note added'}
                      </Text>
                    </View>
                    <Text style={styles.logTime}>{formatTime(entry.logged_at)}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {(showReward || showWellness) && (
        <View style={styles.toastWrap}>
          {showWellness && wellnessDelta !== null && (
            <WellnessToast amount={wellnessDelta} reason={wellnessReason} />
          )}
          {showReward && (
            <View style={{ marginTop: 8 }}>
              <ShowReward xp={rewardXP} coins={rewardCoins} />
            </View>
          )}
        </View>
      )}

      {/* Centered log modal */}
      <Modal
        visible={!!selectedCategory}
        transparent
        animationType="fade"
        onRequestClose={closeLogModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeLogModal}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {selectedCategory && (
              <>
                <Text style={styles.modalTitle}>
                  Log for {selectedCategory.label}
                </Text>
                <TextInput
                  style={styles.input}
                  onChangeText={setActivityInput}
                  value={activityInput}
                  placeholder="What's the activity? (optional)"
                  placeholderTextColor="#A6B49E"
                  autoFocus
                />
                <View style={styles.logActions}>
                  <Pressable style={styles.cancelButton} onPress={closeLogModal}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.logButton} onPress={() => handleSelfCareLog(selectedCategory.id)}>
                    <Text style={styles.logButtonText}>Log</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
    















