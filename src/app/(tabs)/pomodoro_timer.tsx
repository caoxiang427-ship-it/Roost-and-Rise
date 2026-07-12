/*
 * Pomodoro timer screen.
*/

import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView, Image, Modal, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { sessionRecorder, getTodayStudyMinutes, getTodaysFocusSessionCount } from '@/lib/sessions';
import { displayTime, getCyclePosition, isLongBreakNext, isLateNight } from '@/lib/timer';
import { useProfileStore } from '@/store/useProfileStore';
import ShowReward from '@/components/ShowReward';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '@/styles/timer_styles';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { imageMap } from '@/constants/storeItems';

const DEFAULT_HEADER = require('@/assets/images/timer/header.jpeg');

const RADIUS = 106;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function TimerScreen() {
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [currentBreakMinutes, setCurrentBreakMinutes] = useState(breakDuration);
  const [remainingSeconds, setRemainingSeconds] = useState(focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [todayFocusCount, setTodayFocusCount] = useState(0);
  const [todayStudyMinutes, setTodayStudyMinutes] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const router = useRouter();
  const [modal, setModal] = useState<ModalState | null>(null);
  const [modalBreakMin, setModalBreakMin] = useState(5);

  const [showReward, setShowReward] = useState(false);
  const [rewardXP, setRewardXP] = useState(0);
 
  const { addFocusXp, equippedItemId } = useProfileStore();

  const insets = useSafeAreaInsets();

  const SESSIONS_BEFORE_LONG_BREAK = 4;
  const LONG_BREAK_MINUTES = 15;

  const [headerUri, setHeaderUri] = useState<string | null>(null);

  const triggerReward = (xp: number) => {
    if (xp <= 0) {return;}
    setRewardXP(xp);
    setShowReward(true);
    setTimeout(() => setShowReward(false), 2000);
  };

  // countDown
  useEffect(() => {
    if (!isRunning) return;

    const ticker = setInterval(() => {
      setRemainingSeconds(i => i - 1);
    }, 1000);

    return () => clearInterval(ticker);
  }, [isRunning]);

  // detect when timer hits 0
  useEffect(() => {
    if (remainingSeconds > 0) return;
    if (!isRunning) return; // don't fire when timer already stopped

    setIsRunning(false);

    async function handleZero() {
      if (mode === 'focus') {
        await sessionRecorder(focusDuration, 'focus');
        await loadSummary();

        const newCount = todayFocusCount + 1;
        const awardedXp = await addFocusXp(focusDuration, 'focus', newCount);

        setIsRunning(false);
        if (newCount % SESSIONS_BEFORE_LONG_BREAK === 0) {
          setModalBreakMin(LONG_BREAK_MINUTES); // seed 15 for long break
          setModal({ type: 'recovery', breakMin: LONG_BREAK_MINUTES, xp: awardedXp });
        } else {
          const suggested = getSuggestedBreak(focusDuration);
          setCurrentBreakMinutes(suggested);
          setModalBreakMin(suggested);
          setModal({ type: 'toBreak', breakMin: suggested, xp: awardedXp });
        }
      } else {
        await sessionRecorder(breakDuration, 'break');
        await loadSummary();
        const awardedXp = await addFocusXp(currentBreakMinutes, 'break');
        
        setIsRunning(false);
        setModal({ type: 'toFocus', focusMin: focusDuration, xp: awardedXp });
      }
    }
    handleZero();
  }, [remainingSeconds]);

  useEffect(() => {
    loadSummary();
  }, []);

  // Late-night alert
  useEffect(() => {
    if (isLateNight(new Date().getHours())) {
      Alert.alert(
        "It's getting late 🌙",
        "Consider getting some rest and coming back tomorrow.",
        [{ text: 'I understand' }]
      );
    }
  }, []);

  // Load saved img
  useEffect(() => {
    AsyncStorage.getItem('timerHeaderUri').then(setHeaderUri);
  }, []);

  async function pickHeaderImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to set a custom header.');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 7],   
      quality: 0.8,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setHeaderUri(uri);
      await AsyncStorage.setItem('timerHeaderUri', uri);
    }
  }

  function getSessionSubtitle() {
    const cyclePosition = getCyclePosition(todayFocusCount);
    const isNextLongBreak = isLongBreakNext(todayFocusCount);
    const breakMins = isNextLongBreak ? LONG_BREAK_MINUTES : breakDuration;
    return `Session ${cyclePosition} of 4 · then a ${breakMins}-min break`;
  }

  type ModalState =
    | { type: 'toBreak'; breakMin: number; xp: number }
    | { type: 'toFocus'; focusMin: number; xp: number }
    | { type: 'recovery'; breakMin: number; xp: number };

  function getSuggestedBreak(focusMin: number): number {
    if (focusMin <= 20) return 5;
    if (focusMin <= 40) return 10;
    return 15;
  }

  async function loadSummary() {
    const count = await getTodaysFocusSessionCount();
    const minutes = await getTodayStudyMinutes();

    setTodayFocusCount(count);
    setTodayStudyMinutes(minutes);
  }

  function handleStart() {
    if (isRunning) return;
    setSessionStarted(true);
    setIsRunning(true);
  }

  function handlePause() {
    if (!isRunning) return;
    setIsRunning(false);
  }

 // handle partial session
 // elapsed = (focusDuration * 60) - remainingSeconds
  async function handleCancel() {
    if (!sessionStarted) return;

    const totalSeconds = (mode === 'focus' ? focusDuration : breakDuration) * 60;
    const elapsedSec = totalSeconds - remainingSeconds;
    const elapsedMin = Math.round(elapsedSec / 60);

    // time elapsed below 1 min is not meaningful to save
    if (elapsedMin >= 1) {
      await sessionRecorder(elapsedMin, mode, true);
      const awardedXp = await addFocusXp(elapsedMin, mode);
      await loadSummary();

      triggerReward(awardedXp);
    }

    setIsRunning(false);

    setSessionStarted(false);

    setMode('focus');

    setRemainingSeconds(focusDuration * 60);
  }

  function increaseModalBreak() {
    setModalBreakMin(m => Math.min(m + 5, 60));
  }

  function decreaseModalBreak() {
    setModalBreakMin(m => Math.max(m - 5, 5));
  }

  function startBreak(min: number) {
    setMode('break');
    setCurrentBreakMinutes(min);
    setRemainingSeconds(min * 60);
    setSessionStarted(true);
    setIsRunning(true);
    setModal(null);
  }

  function startFocus(min: number) {
    setMode('focus');
    setRemainingSeconds(min * 60);
    setSessionStarted(true);
    setIsRunning(true);
    setModal(null);
  }

  // Skip break
  function resetToIdleFocus() {
    setMode('focus');
    setRemainingSeconds(focusDuration * 60);
    setSessionStarted(false);
    setIsRunning(false);
    setModal(null);
  }

  function goToRecovery() {
    resetToIdleFocus();
    router.push('/(tabs)/care');
  }

  function increaseFocusTime() {
    if (isRunning) return;

    const newDuration = Math.min(focusDuration + 5, 60);
    setFocusDuration(newDuration);

    if (mode === 'focus') {
      setRemainingSeconds(newDuration * 60);
    }
  }

  function decreaseFocusTime() {
    if (isRunning) return;

    const newDuration = Math.max(focusDuration - 5, 5);
    setFocusDuration(newDuration);

    if (mode === 'focus') {
      setRemainingSeconds(newDuration * 60);
    }
  }

  function increaseBreakTime() {
    if (isRunning) return;

    const newDuration = Math.min(breakDuration + 5, 60);
    setBreakDuration(newDuration);

    if (mode === 'break') {
      setRemainingSeconds(newDuration * 60);
    }
  }

  function decreaseBreakTime() {
    if (isRunning) return;

    const newDuration = Math.max(breakDuration - 5, 5);
    setBreakDuration(newDuration);

    if (mode === 'break') {
      setRemainingSeconds(newDuration * 60);
    }
  }

  // Replace 'sunny' with chicken name later.
  function getChickenMsg() {
    if (!isRunning) {
      return "Tap start when you're ready";
    }
    if (mode === 'focus') {
      return 'Sunny is studying with you';
    }
    if (mode === 'break') {
      return 'Sunny is resting too 💛';
    }
    return '';
  }

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  // For UI: progress ring + cycle dots
  const totalSeconds = (mode === 'focus' ? focusDuration : currentBreakMinutes) * 60;
  const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, remainingSeconds / totalSeconds)) : 0;
  const dashoffset = CIRCUMFERENCE * (1 - progress);
  const ringColor = mode === 'focus' ? '#4E9A87' : '#4E7C9B';
  const ringLabelColor = mode === 'focus' ? '#2F7264' : '#3D6E8A';
  const cyclePosition = getCyclePosition(todayFocusCount);

  const focusInProgress = mode === 'focus' && sessionStarted;
  const completedInCycle = todayFocusCount % 4;
  let filledDots = completedInCycle + (focusInProgress ? 1 : 0)
  if (mode === 'break' && completedInCycle === 0 && todayFocusCount > 0) {
    filledDots = 4;
  }
  filledDots = Math.min(filledDots, 4);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 100 },
        ]}
      >    

      {/* Header */}
      <ImageBackground
        source={headerUri ? { uri: headerUri } : DEFAULT_HEADER}
        style={styles.headerBand}
        imageStyle={styles.headerImage}
        resizeMode="cover"
      >
        <View style={styles.headerOverlay} />
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Focus timer</Text>
            <Text style={styles.date}>{todayLabel}</Text>
          </View>
          <Pressable onPress={pickHeaderImage} style={styles.headerEditBtn} hitSlop={8}>
            <Ionicons name="camera-outline" size={18} color="#173E33" />
          </Pressable>
        </View>
      </ImageBackground>

      <View style={styles.heroRow}>
        {/* Left: chicken */}
        <View style={styles.heroChickenCol}>
          <Image
            source={
              equippedItemId === null
                ? require('@/assets/images/home/chicken.png')
                : imageMap[equippedItemId]
            }
            style={styles.portraitChicken}
            resizeMode="contain"
          />
        </View>

        {/* Summary tiles */}
        <View style={styles.heroSummaryCol}>
          <View style={styles.tile}>
            <View style={[styles.tileIcon, styles.tileIconGreen]}>
              <Ionicons name="leaf-outline" size={20} color="#3E8574" />
            </View>
            <View>
              <Text style={styles.tileNumber}>{todayFocusCount}</Text>
              <Text style={styles.tileLabel}>session{todayFocusCount !== 1 ? 's' : ''} today</Text>
            </View>
          </View>

          <View style={styles.tile}>
            <View style={[styles.tileIcon, styles.tileIconBlue]}>
              <Ionicons name="hourglass-outline" size={20} color="#4E7C9B" />
            </View>
            <View>
              <Text style={styles.tileNumber}>
                {Math.floor(todayStudyMinutes / 60)}h {todayStudyMinutes % 60}m
              </Text>
              <Text style={styles.tileLabel}>focused</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Circular timer */}
      <View style={styles.ringWrap}>
        <Svg width={210} height={210} viewBox="0 0 240 240">
          <Circle cx={120} cy={120} r={RADIUS} fill="#FFFFFF" stroke="#DCE8E3" strokeWidth={14} />
          <Circle
            cx={120}
            cy={120}
            r={RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
            transform="rotate(-90 120 120)"
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={[styles.ringMode, { color: ringLabelColor }]}>{mode.toUpperCase()}</Text>
          <Text style={styles.ringTime}>{displayTime(remainingSeconds)}</Text>
        </View>
      </View>

      {/* Cycle position + dots */}
      <View style={styles.cycleWrap}>
        <Text style={styles.subtitle}>{getSessionSubtitle()}</Text>
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, i < filledDots ? styles.dotActive : styles.dotInactive]} />
          ))}
        </View>
      </View>

      {/* Duration steppers */}
      <View style={styles.controlsRow}>
        <View style={styles.controlCard}>
          <Text style={styles.controlLabel}>Focus</Text>
          <View style={styles.stepper}>
            <Pressable onPress={decreaseFocusTime} style={[styles.stepBtn, styles.stepBtnGreen]}>
              <Ionicons name="remove" size={15} color="#4A7A6E" />
            </Pressable>
            <Text style={styles.stepValue}>{focusDuration} min</Text>
            <Pressable onPress={increaseFocusTime} style={[styles.stepBtn, styles.stepBtnGreen]}>
              <Ionicons name="add" size={15} color="#4A7A6E" />
            </Pressable>
          </View>
        </View>
        <View style={styles.controlCard}>
          <Text style={styles.controlLabel}>Break</Text>
          <View style={styles.stepper}>
            <Pressable onPress={decreaseBreakTime} style={[styles.stepBtn, styles.stepBtnBlue]}>
              <Ionicons name="remove" size={15} color="#4E7C9B" />
            </Pressable>
            <Text style={styles.stepValue}>{breakDuration} min</Text>
            <Pressable onPress={increaseBreakTime} style={[styles.stepBtn, styles.stepBtnBlue]}>
              <Ionicons name="add" size={15} color="#4E7C9B" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Controls: Pause, Start, Cancel */}
      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryBtn} onPress={handlePause}>
          <Text style={styles.secondaryBtnText}>Pause</Text>
        </Pressable>
        <Pressable style={styles.primaryBtn} onPress={handleStart}>
          <Text style={styles.primaryBtnText}>Start</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={handleCancel}>
          <Text style={styles.secondaryBtnText}>Cancel</Text>
        </Pressable>
      </View>

      {/* XP reward card */}
      <View style={styles.xpCard}>
        <View style={styles.xpHeader}>
          <Ionicons name="nutrition-outline" size={16} color="#C7695A" />
          <Text style={styles.xpHeaderText}>Earn XP as you go</Text>
        </View>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>Finish a focus session</Text>
          <Text style={styles.xpValue}>+10 XP</Text>
        </View>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>Take your break</Text>
          <Text style={styles.xpValue}>+5 XP</Text>
        </View>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>Complete a full cycle (4)</Text>
          <Text style={styles.xpValue}>+25 XP</Text>
        </View>
      </View>
      </ScrollView>

      <Modal visible={!!modal} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>

            {modal?.type === 'toBreak' && (
              <>
                <View style={[styles.modalBadge, { backgroundColor: '#D9E7EF' }]}>
                  <Ionicons name="cafe-outline" size={26} color="#4E7C9B" />
                </View>
                <Text style={styles.modalTitle}>Nice work 🌱</Text>
                <Text style={styles.modalFeedback}>
                  You've focused{' '}
                  <Text style={styles.modalStrong}>
                    {Math.floor(todayStudyMinutes / 60)}h {todayStudyMinutes % 60}m
                  </Text>{' '}
                  today.
                </Text>
                {modal.xp > 0 && (
                  <View style={styles.xpPill}><Text style={styles.xpPillText}>+{modal.xp} XP</Text></View>
                )}

                {/* editable break length */}
                <Text style={styles.modalMessage}>How long a breather?</Text>
                <View style={styles.modalStepper}>
                  <Pressable onPress={decreaseModalBreak} style={[styles.stepBtn, styles.stepBtnBlue]}>
                    <Ionicons name="remove" size={16} color="#4E7C9B" />
                  </Pressable>
                  <Text style={styles.modalStepperValue}>{modalBreakMin} min</Text>
                  <Pressable onPress={increaseModalBreak} style={[styles.stepBtn, styles.stepBtnBlue]}>
                    <Ionicons name="add" size={16} color="#4E7C9B" />
                  </Pressable>
                </View>
                
                <Pressable style={styles.modalPrimary} onPress={() => startBreak(modalBreakMin)}>
                  <Text style={styles.modalPrimaryText}>Start {modalBreakMin}-min break</Text>
                </Pressable>
                <Pressable style={styles.modalSecondary} onPress={resetToIdleFocus}>
                  <Text style={styles.modalSecondaryText}>Skip break</Text>
                </Pressable>
              </>
            )}

            {modal?.type === 'toFocus' && (
              <>
                <View style={[styles.modalBadge, { backgroundColor: '#D8ECE4' }]}>
                  <Ionicons name="play" size={24} color="#3E8574" />
                </View>
                <Text style={styles.modalTitle}>Feeling refreshed?</Text>
                {modal.xp > 0 && (
                  <View style={styles.xpPill}><Text style={styles.xpPillText}>+{modal.xp} XP</Text></View>
                )}
                <Text style={styles.modalMessage}>
                  Ready for a <Text style={styles.modalAccent}>{modal.focusMin}-min</Text> focus session?
                </Text>
                <Pressable style={styles.modalPrimary} onPress={() => startFocus(modal.focusMin)}>
                  <Text style={styles.modalPrimaryText}>Start focus</Text>
                </Pressable>
                <Pressable style={styles.modalSecondary} onPress={resetToIdleFocus}>
                  <Text style={styles.modalSecondaryText}>I'm done for now</Text>
                </Pressable>
              </>
            )}

            {modal?.type === 'recovery' && (
              <>
                <View style={[styles.modalBadge, { backgroundColor: '#F6E7E2' }]}>
                  <Ionicons name="sparkles-outline" size={24} color="#C7695A" />
                </View>
                <Text style={styles.modalTitle}>4 sessions done 🎉</Text>
                {modal.xp > 0 && (
                  <View style={styles.xpPill}><Text style={styles.xpPillText}>+{modal.xp} XP</Text></View>
                )}
                <Text style={styles.modalMessage}>
                  You've earned some real recovery.{'\n'}Take a moment for yourself.
                </Text>

                {/* editable rest length */}
                <View style={styles.modalStepper}>
                  <Pressable onPress={decreaseModalBreak} style={[styles.stepBtn, styles.stepBtnBlue]}>
                    <Ionicons name="remove" size={16} color="#4E7C9B" />
                  </Pressable>
                  <Text style={styles.modalStepperValue}>{modalBreakMin} min</Text>
                  <Pressable onPress={increaseModalBreak} style={[styles.stepBtn, styles.stepBtnBlue]}>
                    <Ionicons name="add" size={16} color="#4E7C9B" />
                  </Pressable>
                </View>

                <Pressable style={styles.modalPrimary} onPress={goToRecovery}>
                  <Text style={styles.modalPrimaryText}>Take me to recovery →</Text>
                </Pressable>
                <Pressable style={styles.modalSecondary} onPress={() => startBreak(modalBreakMin)}>
                  <Text style={styles.modalSecondaryText}>Rest here ({modalBreakMin} min)</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

