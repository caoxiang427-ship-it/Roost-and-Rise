/*
 * Pomodoro timer screen: 
 * chicken companion, timer, 
 * three-tabs card (summary, settings, tasks), 
 * and modal for break/focus/recovery.
*/

import { imageMap } from '@/constants/storeItems';
import { getTodayStudyMinutes, getTodaysFocusSessionCount, sessionRecorder } from '@/lib/sessions';
import { displayTime, getCyclePosition, isLateNight, isLongBreakNext } from '@/lib/timer';
import { calculateXPLevel, totalXpRequiredForLevel, useProfileStore } from '@/store/useProfileStore';
import { calculateProgress, useRenderedTaskItems, useTodoStore } from '@/store/useTodoStore';
import { styles } from '@/styles/timer_styles';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ImageBackground, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const DEFAULT_HEADER = require('@/assets/images/timer/header.jpeg');

const RADIUS = 106;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Rest when you\'re weary. Refresh and renew yourself.', author: 'Ralph Marston' },
  { text: 'Almost everything will work again if you unplug it for a few minutes — including you.', author: 'Anne Lamott' },
  { text: 'Little by little, one travels far.', author: 'J.R.R. Tolkien' },
  { text: 'You don\'t have to see the whole staircase, just take the first step.', author: 'Martin Luther King Jr.' },
  { text: 'Take rest; a field that has rested gives a bountiful crop.', author: 'Ovid' },
];

export default function TimerScreen() {
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [currentFocusMinutes, setCurrentFocusMinutes] = useState(25);
  const [currentBreakMinutes, setCurrentBreakMinutes] = useState(5);
  const [remainingSeconds, setRemainingSeconds] = useState(focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [todayFocusCount, setTodayFocusCount] = useState(0);
  const [todayStudyMinutes, setTodayStudyMinutes] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const router = useRouter();

  // For modals
  const [modal, setModal] = useState<ModalState | null>(null);
  const [modalBreakMin, setModalBreakMin] = useState(5);
  const [modalFocusMin, setModalFocusMin] = useState(25);

  const [showReward, setShowReward] = useState(false);
  const [rewardXP, setRewardXP] = useState(0);
 
  // For chicken companion card
  const { addFocusXp, equippedItemId, chickName, xp } = useProfileStore();

  // For three-tab card
  const [activeTab, setActiveTab] = useState<'summary' | 'settings' | 'tasks'>('summary');
  const { init: initTodos, selectedDate, setSelectedDate } = useTodoStore();
  const taskItems = useRenderedTaskItems();
  const taskProgress = calculateProgress(taskItems);
  const tasksDone = taskItems.filter(t => t.completed).length;
  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // For quote
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

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
        await sessionRecorder(currentFocusMinutes, 'focus');
        await loadSummary();

        const newCount = todayFocusCount + 1;
        const awardedXp = await addFocusXp(currentFocusMinutes, 'focus', newCount);

        setIsRunning(false);
        if (newCount % SESSIONS_BEFORE_LONG_BREAK === 0) {
          setModalBreakMin(LONG_BREAK_MINUTES);
          setModal({ type: 'recovery', breakMin: LONG_BREAK_MINUTES, xp: awardedXp });
        } else {
          const suggested = getSuggestedBreak(currentFocusMinutes);
          setCurrentBreakMinutes(suggested);
          setModalBreakMin(suggested);
          setModal({ type: 'toBreak', breakMin: suggested, xp: awardedXp });
        }
      } else {
        await sessionRecorder(currentBreakMinutes, 'break');
        await loadSummary();
        const awardedXp = await addFocusXp(currentBreakMinutes, 'break');

        setIsRunning(false);

        setModalFocusMin(focusDuration);

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

  // Load store and point at today when Tasks tab is opened
  useEffect(() => {
    initTodos();
  }, []);

  useEffect(() => {
    if (activeTab === 'tasks' && selectedDate !== todayDate) {
      setSelectedDate(todayDate);
    }
  }, [activeTab]);

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
    const breakMins = isNextLongBreak ? LONG_BREAK_MINUTES : getSuggestedBreak(currentFocusMinutes);
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

    const totalSeconds = (mode === 'focus' ? currentFocusMinutes : currentBreakMinutes) * 60;
    const elapsedSec = totalSeconds - remainingSeconds;
    const elapsedMin = Math.round(elapsedSec / 60);

    if (elapsedMin >= 1) {
      await sessionRecorder(elapsedMin, mode, true);
      const awardedXp = await addFocusXp(elapsedMin, mode);
      await loadSummary();
      triggerReward(awardedXp);
    }

    setIsRunning(false);
    setSessionStarted(false);
    setMode('focus');
    setCurrentFocusMinutes(focusDuration);   
    setRemainingSeconds(focusDuration * 60);
  }

  function increaseModalFocus() {
    setModalFocusMin(m => Math.min(m + 5, 60));
  }

  function decreaseModalFocus() {
    setModalFocusMin(m => Math.max(m - 5, 5));
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
    setCurrentFocusMinutes(min);   
    setRemainingSeconds(min * 60);
    setSessionStarted(true);
    setIsRunning(true);
    setModal(null);
  }

  // Skip break
  function resetToIdleFocus() {
    setMode('focus');
    setCurrentFocusMinutes(focusDuration);   
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
      setCurrentFocusMinutes(newDuration);   
      setRemainingSeconds(newDuration * 60);
    }
  }

  function decreaseFocusTime() {
    if (isRunning) return;

    const newDuration = Math.max(focusDuration - 5, 5);

    setFocusDuration(newDuration);

    if (mode === 'focus') {
      setCurrentFocusMinutes(newDuration);   
      setRemainingSeconds(newDuration * 60);
    }
  }

  function increaseBreakTime() {
    if (isRunning) return;

    const newDuration = Math.min(breakDuration + 5, 60);
    setBreakDuration(newDuration);

    if (mode === 'break') {
      setCurrentBreakMinutes(newDuration);   
      setRemainingSeconds(newDuration * 60);
    }
  }

  function decreaseBreakTime() {
    if (isRunning) return;

    const newDuration = Math.max(breakDuration - 5, 5);
    setBreakDuration(newDuration);

    if (mode === 'break') {
      setCurrentBreakMinutes(newDuration);   
      setRemainingSeconds(newDuration * 60);
    }
  }

  // Replace 'sunny' with chicken name later.
  function getChickenMsg() {
    if (!isRunning) {
      return "Tap start when you're ready";
    }
    if (mode === 'focus') {
      return `${chickName || 'Sunny'} is studying with you`;
    }
    if (mode === 'break') {
      return `${chickName || 'Sunny'} is resting too 💛`;
    }
    return '';
  }

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  // XP progress bar helpers
  const petLevel = calculateXPLevel(xp);
  const levelProgress = (() => {
    const cur = totalXpRequiredForLevel(petLevel);
    const next = totalXpRequiredForLevel(petLevel + 1);
    return (xp - cur) / (next - cur);
  })();
  const levelPct = Math.round(levelProgress * 100);

  // For UI: progress ring + cycle dots
  const totalSeconds = (mode === 'focus' ? currentFocusMinutes : currentBreakMinutes) * 60;
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

        {/* Chicken card */}
        <View style={styles.cardWrapper}>
          <ImageBackground
            source={require('@/assets/images/timer/card_bg.png')}
            style={styles.companionCard}
            imageStyle={styles.companionCardBg}
          >
            <View style={styles.companionTop}>
              <View>
                <Text style={styles.companionName}>{chickName || 'Your study companion'}</Text>
                <Text style={styles.companionLevel}>Lv.{petLevel}</Text>
              </View>
            </View>

            {/* Speech bubble + companion art */}
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>{getChickenMsg()}</Text>
              <View style={styles.speechTail} />
            </View>

            <View style={styles.companionArtWrap}>
              <Image
                source={
                  equippedItemId === null
                    ? require('@/assets/images/home/chicken.png')
                    : imageMap[equippedItemId]
                }
                style={styles.companionArt}
                resizeMode="contain"
              />
            </View>

            <View style={styles.levelRow}>
              <View style={styles.levelPill}>
                <Ionicons name="star" size={14} color="#A6791E" />
                <Text style={styles.levelPillText}>Level progress</Text>
              </View>
              <View style={styles.levelPill}>
                <Text style={styles.levelPillText}>{levelPct}%</Text>
              </View>
            </View>

            <View style={styles.levelTrack}>
              <View style={[styles.levelFill, { width: `${levelPct}%` }]} />
            </View>
          </ImageBackground>
        </View>

        {/* Circular timer */}
        <View style={styles.ringWrap}>
          <Svg width={210} height={210} viewBox="0 0 240 240">
            <Circle cx={120} cy={120} r={RADIUS} fill="#FFFFFF" stroke="#DCE8E3" strokeWidth={14} />
            <Circle
              testID="timer-ring"
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
              <View
                key={i}
                style={[styles.dot, i < filledDots ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>
        </View>

        {/* Controls: Pause, Start, Cancel */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.secondaryBtn} onPress={handlePause}>
            <Text style={styles.secondaryBtnText}>Pause</Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={handleStart}>
            <Ionicons name="play" size={16} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Start</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={handleCancel}>
            <Text style={styles.secondaryBtnText}>Cancel</Text>
          </Pressable>
        </View>

        {/* Three-tab card */}
        <View style={styles.tabCard}>
          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tabBtn, activeTab === 'summary' && styles.tabBtnActive]}
              onPress={() => setActiveTab('summary')}
            >
              <Ionicons
                name="stats-chart-outline"
                size={14}
                color={activeTab === 'summary' ? '#2F6E60' : '#6F8A85'}
              />
              <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>
                Summary
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, activeTab === 'settings' && styles.tabBtnActive]}
              onPress={() => setActiveTab('settings')}
            >
              <Ionicons
                name="settings-outline"
                size={14}
                color={activeTab === 'settings' ? '#2F6E60' : '#6F8A85'}
              />
              <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
                Settings
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, activeTab === 'tasks' && styles.tabBtnActive]}
              onPress={() => setActiveTab('tasks')}
            >
              <Ionicons
                name="checkbox-outline"
                size={14}
                color={activeTab === 'tasks' ? '#2F6E60' : '#6F8A85'}
              />
              <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
                Tasks
              </Text>
            </Pressable>
          </View>

          {/* SUMMARY */}
          {activeTab === 'summary' ? (
            <View style={styles.tabBody}>
              <View style={styles.tilesRow}>
                <View style={[styles.tile, { backgroundColor: '#F2F9F5' }]}>
                  <View style={[styles.tileIcon, styles.tileIconGreen]}>
                    <Ionicons name="flame-outline" size={18} color="#3E8574" />
                  </View>
                  <View>
                    <Text style={styles.tileNumber}>{todayFocusCount}</Text>
                    <Text style={styles.tileLabel}>
                      {todayFocusCount !== 1 ? 'sessions today' : 'session today'}
                    </Text>
                  </View>
                </View>
                <View style={[styles.tile, { backgroundColor: '#F1F7FA' }]}>
                  <View style={[styles.tileIcon, styles.tileIconBlue]}>
                    <Ionicons name="hourglass-outline" size={18} color="#4E7C9B" />
                  </View>
                  <View>
                    <Text style={styles.tileNumber}>
                      {`${Math.floor(todayStudyMinutes / 60)}h ${todayStudyMinutes % 60}m`}
                    </Text>
                    <Text style={styles.tileLabel}>focused</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          {/* SETTINGS */}
          {activeTab === 'settings' ? (
            <View style={styles.tabBody}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Focus duration</Text>
                <View style={styles.stepper}>
                  <Pressable onPress={decreaseFocusTime} testID="focus-minus" style={[styles.stepBtn, styles.stepBtnGreen]}>
                    <Ionicons name="remove" size={15} color="#4A7A6E" />
                  </Pressable>
                  <Text style={styles.stepValue}>{`${focusDuration} min`}</Text>
                  <Pressable onPress={increaseFocusTime} testID="focus-plus" style={[styles.stepBtn, styles.stepBtnGreen]}>
                    <Ionicons name="add" size={15} color="#4A7A6E" />
                  </Pressable>
                </View>
              </View>
              <View style={styles.settingDivider} />
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Break duration</Text>
                <View style={styles.stepper}>
                  <Pressable onPress={decreaseBreakTime} testID="break-minus" style={[styles.stepBtn, styles.stepBtnBlue]}>
                    <Ionicons name="remove" size={15} color="#4E7C9B" />
                  </Pressable>
                  <Text style={styles.stepValue}>{`${breakDuration} min`}</Text>
                  <Pressable onPress={increaseBreakTime} testID="break-plus" style={[styles.stepBtn, styles.stepBtnBlue]}>
                    <Ionicons name="add" size={15} color="#4E7C9B" />
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}

          {/* TASKS (read-only) */}
          {activeTab === 'tasks' ? (
            <View style={styles.tabBody}>
              <View style={styles.taskHeaderRow}>
                <Text style={styles.taskTitle}>Today&apos;s tasks</Text>
                <Text style={styles.taskCount}>{`${tasksDone} of ${taskItems.length} done`}</Text>
              </View>
              <View style={styles.taskProgressTrack}>
                <View
                  style={[styles.taskProgressFill, { width: `${Math.round(taskProgress * 100)}%` }]}
                />
              </View>

              {taskItems.length === 0 ? (
                <Text style={styles.taskEmpty}>No tasks for today yet.</Text>
              ) : (
                taskItems.map((task) => (
                  <View key={task.id} style={styles.taskRow}>
                    <View style={[styles.taskCircle, task.completed && styles.taskCircleDone]}>
                      {task.completed ? (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      ) : null}
                    </View>
                    <Text
                      style={[styles.taskText, task.completed && styles.taskTextDone]}
                      numberOfLines={1}
                    >
                      {task.text}
                    </Text>
                  </View>
                ))
              )}

              <Text style={styles.taskHint}>Add or edit tasks on the Tasks screen</Text>
            </View>
          ) : null}
        </View>

        {/* Quote */}
        <View style={styles.quoteCard}>
          <Ionicons name="star" size={16} color="#E0A81E" style={styles.quoteIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.quoteText}>{`"${quote.text}"`}</Text>
            <Text style={styles.quoteAuthor}>{`— ${quote.author}`}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal for break/focus/recovery */}
      <Modal
        visible={!!modal}
        transparent
        animationType="fade"
        onRequestClose={() => setModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {modal?.type === 'toBreak' ? (
              <>
                <View style={[styles.modalBadge, { backgroundColor: '#D9E7EF' }]}>
                  <Ionicons name="cafe-outline" size={26} color="#4E7C9B" />
                </View>
                <Text style={styles.modalTitle}>Nice work 🌱</Text>
                <Text style={styles.modalFeedback}>
                  You&apos;ve focused{' '}
                  <Text style={styles.modalStrong}>
                    {`${Math.floor(todayStudyMinutes / 60)}h ${todayStudyMinutes % 60}m`}
                  </Text>
                  {' today.'}
                </Text>
                {modal.xp > 0 ? (
                  <View style={styles.xpPill}>
                    <Text style={styles.xpPillText}>{`+${modal.xp} XP`}</Text>
                  </View>
                ) : null}

                {/* editable break length */}
                <Text style={styles.modalMessage}>How long a breather?</Text>
                <View style={styles.modalStepper}>
                  <Pressable onPress={decreaseModalBreak} testID="modal-break-minus" style={[styles.stepBtn, styles.stepBtnBlue]}>
                    <Ionicons name="remove" size={16} color="#4E7C9B" />
                  </Pressable>
                  <Text style={styles.modalStepperValue}>{`${modalBreakMin} min`}</Text>
                  <Pressable onPress={increaseModalBreak} testID="modal-break-plus" style={[styles.stepBtn, styles.stepBtnBlue]}>
                    <Ionicons name="add" size={16} color="#4E7C9B" />
                  </Pressable>
                </View>

                <Pressable style={styles.modalPrimary} onPress={() => startBreak(modalBreakMin)}>
                  <Text style={styles.modalPrimaryText}>{`Start ${modalBreakMin}-min break`}</Text>
                </Pressable>
                <Pressable style={styles.modalSecondary} onPress={resetToIdleFocus}>
                  <Text style={styles.modalSecondaryText}>Skip break</Text>
                </Pressable>
              </>
            ) : null}

            {modal?.type === 'toFocus' ? (
              <>
                <View style={[styles.modalBadge, { backgroundColor: '#D8ECE4' }]}>
                  <Ionicons name="play" size={24} color="#3E8574" />
                </View>
                <Text style={styles.modalTitle}>Feeling refreshed?</Text>
                {modal.xp > 0 ? (
                  <View style={styles.xpPill}>
                    <Text style={styles.xpPillText}>{`+${modal.xp} XP`}</Text>
                  </View>
                ) : null}

                <Text style={styles.modalMessage}>How long to focus?</Text>
                <View style={styles.modalStepper}>
                  <Pressable onPress={decreaseModalFocus} testID="modal-focus-minus" style={[styles.stepBtn, styles.stepBtnGreen]}>
                    <Ionicons name="remove" size={16} color="#4A7A6E" />
                  </Pressable>
                  <Text style={styles.modalStepperValue}>{`${modalFocusMin} min`}</Text>
                  <Pressable onPress={increaseModalFocus} testID="modal-focus-plus" style={[styles.stepBtn, styles.stepBtnGreen]}>
                    <Ionicons name="add" size={16} color="#4A7A6E" />
                  </Pressable>
                </View>

                <Pressable style={styles.modalPrimary} onPress={() => startFocus(modalFocusMin)}>
                  <Text style={styles.modalPrimaryText}>{`Start ${modalFocusMin}-min focus`}</Text>
                </Pressable>
                <Pressable style={styles.modalSecondary} onPress={resetToIdleFocus}>
                  <Text style={styles.modalSecondaryText}>I&apos;m done for now</Text>
                </Pressable>
              </>
            ) : null}

            {modal?.type === 'recovery' ? (
              <>
                <View style={[styles.modalBadge, { backgroundColor: '#F6E7E2' }]}>
                  <Ionicons name="sparkles-outline" size={24} color="#C7695A" />
                </View>
                <Text style={styles.modalTitle}>4 sessions done 🎉</Text>
                {modal.xp > 0 ? (
                  <View style={styles.xpPill}>
                    <Text style={styles.xpPillText}>{`+${modal.xp} XP`}</Text>
                  </View>
                ) : null}
                <Text style={styles.modalMessage}>
                  {'You\'ve earned some real recovery.\nTake a moment for yourself.'}
                </Text>

                {/* editable rest length */}
                <View style={styles.modalStepper}>
                  <Pressable onPress={decreaseModalBreak} style={[styles.stepBtn, styles.stepBtnBlue]}>
                    <Ionicons name="remove" size={16} color="#4E7C9B" />
                  </Pressable>
                  <Text style={styles.modalStepperValue}>{`${modalBreakMin} min`}</Text>
                  <Pressable onPress={increaseModalBreak} style={[styles.stepBtn, styles.stepBtnBlue]}>
                    <Ionicons name="add" size={16} color="#4E7C9B" />
                  </Pressable>
                </View>

                <Pressable style={styles.modalPrimary} onPress={goToRecovery}>
                  <Text style={styles.modalPrimaryText}>Take me to recovery →</Text>
                </Pressable>
                <Pressable style={styles.modalSecondary} onPress={() => startBreak(modalBreakMin)}>
                  <Text style={styles.modalSecondaryText}>{`Rest here (${modalBreakMin} min)`}</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}