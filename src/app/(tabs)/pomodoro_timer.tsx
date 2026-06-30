/*
 * Pomodoro timer screen.
*/

import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { sessionRecorder, getTodayStudyMinutes, getTodaysFocusSessionCount } from '@/lib/sessions';
import { useProfileStore } from '@/store/useProfileStore';
import ShowReward from '@/components/ShowReward';

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
  const [showReward, setShowReward] = useState(false);
  const [rewardXP, setRewardXP] = useState(0);

  const { addFocusXp } = useProfileStore();

  const SESSIONS_BEFORE_LONG_BREAK = 4;
  const LONG_BREAK_MINUTES = 15;

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

    async function handleZero() {
      if (mode == 'focus') {
        await sessionRecorder(focusDuration, 'focus');
        await loadSummary();

        const newCount = todayFocusCount + 1;
        const awardedXp = await addFocusXp(focusDuration, 'focus', newCount);
        triggerReward(awardedXp);

        const isLongBreak = newCount % SESSIONS_BEFORE_LONG_BREAK == 0;
        const nextBreakMinutes = isLongBreak ? LONG_BREAK_MINUTES : breakDuration;

        setCurrentBreakMinutes(nextBreakMinutes);
        setMode('break');
        setRemainingSeconds(nextBreakMinutes * 60);
      } else {

        await sessionRecorder(breakDuration, 'break');
        await loadSummary();
        const awardedXp = await addFocusXp(currentBreakMinutes, 'break');
        triggerReward(awardedXp);

        setMode('focus');
        setRemainingSeconds(focusDuration * 60);
      }
    }
    handleZero();
  }, [remainingSeconds]);

  useEffect(() => {
    loadSummary();
  }, []);

  // Late-night alert
  useEffect(() => {
    if (isLateNight()) {
      Alert.alert(
        "It's getting late 🌙",
        "Consider getting some rest and coming back tomorrow.",
        [{ text: 'I understand' }]
      );
    }
  }, []);

  function getSessionSubtitle() {
    const nextSession = todayFocusCount + 1;
    const cyclePosition = ((nextSession - 1) % 4) + 1;
    const isNextLongBreak = nextSession % 4 === 0;
    const breakMins = isNextLongBreak ? LONG_BREAK_MINUTES : breakDuration;
    return `Session ${cyclePosition} of 4 · then a ${breakMins}-min break`;
  }

  async function loadSummary() {
    const count = await getTodaysFocusSessionCount();
    const minutes = await getTodayStudyMinutes();
  
    setTodayFocusCount(count);
    setTodayStudyMinutes(minutes);
  }
  
  function handleStart() {
    if (!isRunning) setSessionStarted(true);
    setIsRunning(!isRunning);
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

  function isLateNight(): boolean {
    const hour = new Date().getHours();
    return hour >= 23 || hour < 5;
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

  function displayTime(seconds: number) {
    const totalSeconds = Math.max(0, seconds);
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;

    const displayMin = min.toString().padStart(2, '0');
    const displaySec = sec.toString().padStart(2, '0');
  
    return `${displayMin}:${displaySec}`;  
  }

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={[styles.title, { position: 'absolute', left: 0, right: 0, textAlign: 'center' }]}>Focus Time</Text>
        {showReward && <ShowReward xp={rewardXP} />}
      </View>
      {/* Chicken placeholder for now */}
      <View style={styles.chickenCompanion}>
        <Text style={styles.chickenEmoji}>🐔</Text>
        <Text style={styles.chickenName}>{getChickenMsg()}</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          Today: {todayFocusCount} session{todayFocusCount !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.summaryText}>
          {Math.floor(todayStudyMinutes / 60)}h {todayStudyMinutes % 60}m focused
        </Text>
      </View>

      <View style={styles.pomodoroTimer}>
        <Text style={styles.timerText}>{displayTime(remainingSeconds)}</Text>
        <Text style={styles.modeText}>{mode.toUpperCase()}</Text>
        <Text style={styles.subtitleText}>{getSessionSubtitle()}</Text>
      </View>

      <View style={styles.timeControl}>
        <Text style={styles.focusControlLabel}>Focus duration:</Text>
        <View style={styles.stepper}>
          <Pressable onPress={decreaseFocusTime} style={styles.stepperButton}>
            <Text style={styles.stepperText}>-</Text>
          </Pressable>
          <Text style={styles.stepperValue}>{focusDuration} min</Text>
          <Pressable onPress={increaseFocusTime} style={styles.stepperButton}>
            <Text style={styles.stepperText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.timeControl}>
        <Text style={styles.breakControlLabel}>Break duration:</Text>
        <View style={styles.stepper}>
          <Pressable onPress={decreaseBreakTime} style={styles.stepperButton}>
            <Text style={styles.stepperText}>-</Text>
          </Pressable>
          <Text style={styles.stepperValue}>{breakDuration} min</Text>
          <Pressable onPress={increaseBreakTime} style={styles.stepperButton}>
            <Text style={styles.stepperText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.actionButton}>
        <Pressable style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>
            {isRunning ? 'Pause' : 'Start'}
          </Text>
        </Pressable>
        <Pressable style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#FFE8B8',
    gap: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3D2914',
    textAlign: 'center',
  },

  chickenCompanion: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  chickenEmoji: {
    fontSize: 80,
    marginBottom: 8,
  },
  chickenName: {
    fontSize: 14,
    color: '#A67C2E',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryText: {
    fontSize: 13,
    color: '#8B6F3F',
    fontWeight: '600',
  },

  pomodoroTimer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#3D2914',
    letterSpacing: 1,
  },
  modeText: {
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#A67C2E',
    marginTop: 6,
  },

  timeControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  focusControlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3D2914',
  },
  breakControlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3D2914',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperButton: {
    backgroundColor: '#FFF9E6',
    borderColor: '#E0D4A8',
    borderWidth: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 18,
    color: '#3D2914',
    fontWeight: 'bold',
  },
  stepperValue: {
    fontSize: 14,
    color: '#3D2914',
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },

  actionButton: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  startButton: {
    flex: 2,
    backgroundColor: '#3D2914',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#E0D4A8',
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8B6F3F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitleText: {
    fontSize: 13,
    color: '#A67C2E',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
