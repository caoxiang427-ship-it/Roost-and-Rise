/* 
 * Analytics screen.
 * Data visualisation ( weekly + monthly trends for mood, sessions, and self-care.
 * Personalised insights: rule-based, run on own data
 * Habit prediction: frequency-based; patterm detection
 * User segmentation: k-means clustering on simulated users
*/

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import {
  getMoodData,
  getSessionData,
  getSelfCareFrequency,
  DailyMood,
  DailySession,
  CategoryCount,
  getInsights,
  Insight,
  HabitPrediction,
  getHabitPrediction,
} from '../../lib/analytics';
import { getUserSegment, UserSegment } from '../../lib/segmentation';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 48;

const COLORS = {
  bg: '#EEF4F7',
  card: '#FFFFFF',
  accent: '#3B99B9',
  accentLight: 'rgba(59,153,185,0.12)',
  border: 'rgba(59,153,185,0.2)',
  title: '#1E3A4A',
  subtitle: '#5E90A1',
  muted: '#8CAAB7',
  amber: '#D4A054',
  amberBg: '#FDF6EC',
  amberText: '#B8924A',
  pink: '#D4748A',
  pinkBg: '#FAEEF2',
  pinkText: '#B3607A',
};

const INSIGHT_COLORS = {
  accent: { bg: '#EEF4F7', border: COLORS.accent, text: COLORS.title, suggestion: COLORS.subtitle },
  amber: { bg: '#FDF6EC', border: COLORS.amber, text: COLORS.title, suggestion: COLORS.amberText },
  pink: { bg: '#FAEEF2', border: COLORS.pink, text: COLORS.title, suggestion: COLORS.pinkText },
};

const MOOD_LABELS = ['', '😩', '😣', '😐', '🙂', '😄'];
const MOOD_EMOJIS = ['😩', '😣', '😐', '🙂', '😄'];

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'week' | 'month'>('week');
  const [isLoading, setLoading] = useState(true);
  const [moodData, setMoodData] = useState<DailyMood[]>([]);
  const [sessionData, setSessionData] = useState<DailySession[]>([]);
  const [selfCareData, setSelfCareData] = useState<CategoryCount[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [habits, setHabits] = useState<HabitPrediction>({ streaks: [], patterns: [] });
  const [segment, setSegment] = useState<UserSegment | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [mood, sessions, selfCare] = await Promise.all([
      getMoodData(mode),
      getSessionData(mode),
      getSelfCareFrequency(mode),
    ]);
    setMoodData(mood);
    setSessionData(sessions);
    setSelfCareData(selfCare);

    const ins = await getInsights(mood, sessions, selfCare);
    setInsights(ins);

    const hab = await getHabitPrediction();
    setHabits(hab);

    const seg = await getUserSegment();
    setSegment(seg);

    setLoading(false);
  }, [mode]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const moodChartData = {
    labels: moodData.map(d => d.date),
    datasets: [
      {
        data: moodData.length > 0
          ? moodData.map(d => d.value || 3)
          : [3],
        strokeWidth: 2.5,
      },
      { data: [1], withDots: false },
      { data: [5], withDots: false },
    ],
  };

  const sessionChartData = {
    labels: sessionData.map(d => d.date),
    datasets: [{
      data: sessionData.length > 0
        ? sessionData.map(d => d.count)
        : [0],
    }],
  };

  const totalSessions = sessionData.reduce((sum, d) => sum + d.count, 0);
  const totalMinutes = sessionData.reduce((sum, d) => sum + d.minutes, 0);
  const maxSelfCare = selfCareData.length > 0 ? selfCareData[0].count : 1;

  // Monthly summary stats
  const daysWithMood = moodData.filter(d => d.value > 0);
  const avgMood = daysWithMood.length > 0
    ? (daysWithMood.reduce((sum, d) => sum + d.value, 0) / daysWithMood.length).toFixed(1)
    : '–';
  const moodDistribution = MOOD_EMOJIS.map((emoji, i) => ({
    emoji,
    count: moodData.filter(d => d.value === i + 1).length,
  }));
  const maxMoodDist = Math.max(...moodDistribution.map(d => d.count), 1);
  const avgSessionsPerDay = sessionData.length > 0
    ? (totalSessions / sessionData.length).toFixed(1)
    : '0';
  const avgMinPerSession = totalSessions > 0
    ? Math.round(totalMinutes / totalSessions)
    : 0;
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalSelfCareLogs = selfCareData.reduce((sum, c) => sum + c.count, 0);

  const now = new Date();
  const sinceDate = new Date();
  sinceDate.setDate(now.getDate() - (mode == 'week' ? 6 : 29));
  const rangeLabel = `${sinceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 153, 185, ${opacity})`,
    labelColor: () => COLORS.muted,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: COLORS.accent,
    },
    propsForBackgroundLines: {
      stroke: '#E4EDF0',
      strokeWidth: 0.5,
    },
    fillShadowGradientFrom: COLORS.accent,
    fillShadowGradientFromOpacity: 0.2,
    fillShadowGradientTo: COLORS.accent,
    fillShadowGradientToOpacity: 0.02,
  };

  const sessionChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(212, 160, 84, ${opacity})`,
    fillShadowGradientFrom: COLORS.amber,
    fillShadowGradientFromOpacity: 0.8,
    fillShadowGradientTo: COLORS.amber,
    fillShadowGradientToOpacity: 0.3,
  };

  const renderWeekly = () => (
    <>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="heart-outline" size={18} color={COLORS.accent} />
          <Text style={styles.cardTitle}>Mood trend</Text>
        </View>
        {moodData.some(d => d.value > 0) ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
            <LineChart
              data={moodChartData}
              width={CHART_WIDTH}
              height={180}
              chartConfig={chartConfig}
              bezier
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
              fromZero={false}
              yAxisInterval={1}
              segments={4}
              formatYLabel={(val) => MOOD_LABELS[Math.round(Number(val))] || ''}
              style={styles.chart}
            />
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={32} color={COLORS.muted} />
            <Text style={styles.emptyText}>No mood data yet</Text>
            <Text style={styles.emptyHint}>Log your mood on the Care screen</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time-outline" size={18} color={COLORS.amber} />
          <Text style={styles.cardTitle}>Study sessions</Text>
          <Text style={styles.cardBadge}>{totalSessions} sessions · {totalMinutes} min</Text>
        </View>
        {totalSessions > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
            <BarChart
              data={sessionChartData}
              width={CHART_WIDTH}
              height={180}
              chartConfig={sessionChartConfig}
              withInnerLines={true}
              withOuterLines={false}
              fromZero
              showValuesOnTopOfBars={false}
              flatColor={true}
              yAxisLabel=""
              yAxisSuffix=""
              segments={Math.max(Math.ceil(Math.max(...sessionData.map(d => d.count), 1)), 2)}
              formatYLabel={(val) => String(Math.round(Number(val)))}
              style={styles.chart}
            />
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="timer-outline" size={32} color={COLORS.muted} />
            <Text style={styles.emptyText}>No sessions yet</Text>
            <Text style={styles.emptyHint}>Complete a focus session to see data</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="leaf-outline" size={18} color={COLORS.pink} />
          <Text style={styles.cardTitle}>Self-care activity</Text>
        </View>
        {selfCareData.length > 0 ? (
          <View style={styles.barList}>
            {selfCareData.map((cat) => (
              <View key={cat.label} style={styles.barRow}>
                <View style={styles.barLabel}>
                  <Ionicons name={cat.icon as any} size={16} color={COLORS.accent} />
                  <Text style={styles.barLabelText}>{cat.label}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${(cat.count / maxSelfCare) * 100}%` }]} />
                </View>
                <Text style={styles.barCount}>{cat.count}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={32} color={COLORS.muted} />
            <Text style={styles.emptyText}>No self-care logs yet</Text>
            <Text style={styles.emptyHint}>Log activities on the Care screen</Text>
          </View>
        )}
      </View>

      {(habits.streaks.length > 0 || habits.patterns.length > 0) ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flame-outline" size={18} color={COLORS.amber} />
            <Text style={styles.cardTitle}>Habit streaks</Text>
          </View>

          {habits.streaks.length > 0 && (
            <View style={{ gap: 10, marginBottom: habits.patterns.length > 0 ? 14 : 0 }}>
              {habits.streaks.map((s) => (
                <View key={s.label} style={styles.streakRow}>
                  <View style={styles.streakIcon}>
                    <Ionicons name={s.icon as any} size={18} color={COLORS.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.streakLabel}>{s.label}</Text>
                    <Text style={styles.streakSub}>{s.streak}-day streak</Text>
                  </View>
                  <View style={styles.streakDots}>
                    {Array.from({ length: Math.min(s.streak, 7) }).map((_, i) => (
                      <View key={i} style={styles.streakDotFilled} />
                    ))}
                    {s.streak < 7 && Array.from({ length: 7 - Math.min(s.streak, 7) }).map((_, i) => (
                      <View key={`e-${i}`} style={styles.streakDotEmpty} />
                    ))}
                  </View>
                </View>
              ))}
              {habits.streaks.some(s => s.atRisk) && (
                <View style={[styles.insightCard, { backgroundColor: COLORS.amberBg, borderLeftColor: COLORS.amber }]}>
                  <View style={styles.insightRow}>
                    <Ionicons name="alert-circle-outline" size={16} color={COLORS.amber} />
                    <Text style={[styles.insightText, { color: COLORS.title }]}>
                      {habits.streaks.find(s => s.atRisk)?.label} streak is at risk — log it today to keep it going!
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {habits.patterns.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Your patterns</Text>
              <View style={{ gap: 10 }}>
                {habits.patterns.map((p) => (
                  <View key={p.label} style={[styles.insightCard, { backgroundColor: '#EEF4F7', borderLeftColor: COLORS.accent }]}>
                    <View style={styles.insightRow}>
                      <Ionicons name={p.icon as any} size={16} color={COLORS.accent} />
                      <Text style={[styles.insightText, { color: COLORS.title }]}>
                        You usually log {p.label} on {p.days.join(', ')}.
                      </Text>
                    </View>
                    <Text style={[styles.insightSuggestion, { color: COLORS.subtitle }]}>
                      Routines build themselves — keep showing up on the days that work for you.
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flame-outline" size={18} color={COLORS.amber} />
            <Text style={styles.cardTitle}>Habit streaks</Text>
          </View>
          <View style={styles.emptyState}>
            <Ionicons name="flame-outline" size={32} color={COLORS.muted} />
            <Text style={styles.emptyText}>No habits detected yet</Text>
            <Text style={styles.emptyHint}>Log self-care activities for a few days and Sunny will find your patterns!</Text>
          </View>
        </View>
      )}
     
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="bulb-outline" size={18} color={COLORS.amber} />
          <Text style={styles.cardTitle}>Your wellness insights</Text>
        </View>
        {insights.length > 0 ? (
          <View style={{ gap: 10 }}>
            {insights.map((ins, i) => {
              const c = INSIGHT_COLORS[ins.color];
              return (
                <View key={i} style={[styles.insightCard, { backgroundColor: c.bg, borderLeftColor: c.border }]}>
                  <View style={styles.insightRow}>
                    <Ionicons name={ins.icon as any} size={16} color={c.border} />
                    <Text style={[styles.insightText, { color: c.text }]}>{ins.text}</Text>
                  </View>
                  <Text style={[styles.insightSuggestion, { color: c.suggestion }]}>{ins.suggestion}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bulb-outline" size={32} color={COLORS.muted} />
            <Text style={styles.emptyText}>No insights yet</Text>
            <Text style={styles.emptyHint}>Keep logging your mood, sessions, and self-care.</Text>
            <Text style={styles.emptyHint}>Sunny will spot patterns for you!</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="people-outline" size={18} color={COLORS.accent} />
          <Text style={styles.cardTitle}>Your profile</Text>
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>Demo data</Text>
          </View>
        </View>
        {segment ? (
          <>
            <View style={styles.segmentBadge}>
              <Text style={styles.segmentType}>You are a</Text>
              <Text style={styles.segmentLabel}>{segment.clusterLabel}</Text>
              <Text style={styles.segmentDesc}>{segment.clusterDescription}</Text>
            </View>

            <View style={[styles.statGrid, { marginTop: 14 }]}>
              <View style={[styles.statBox, { backgroundColor: COLORS.bg }]}>
                <Text style={[styles.statNumber, { color: COLORS.accent, fontSize: 22 }]}>{segment.userStats.studySessions}</Text>
                <Text style={[styles.statLabel, { color: COLORS.subtitle }]}>Sessions</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: COLORS.bg }]}>
                <Text style={[styles.statNumber, { color: COLORS.accent, fontSize: 22 }]}>{segment.userStats.selfCareLogs}</Text>
                <Text style={[styles.statLabel, { color: COLORS.subtitle }]}>Self-care logs</Text>
              </View>
            </View>

            <View style={[styles.statGrid, { marginTop: 10 }]}>
              <View style={[styles.statBox, { backgroundColor: COLORS.bg }]}>
                <Text style={[styles.statNumber, { color: COLORS.accent, fontSize: 22 }]}>{segment.userStats.avgMood}</Text>
                <Text style={[styles.statLabel, { color: COLORS.subtitle }]}>Avg mood</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: COLORS.bg }]}>
                <Text style={[styles.statNumber, { color: COLORS.accent, fontSize: 22 }]}>Top {100 - segment.percentile}%</Text>
                <Text style={[styles.statLabel, { color: COLORS.subtitle }]}>Activity level</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={32} color={COLORS.muted} />
            <Text style={styles.emptyText}>Not enough data yet</Text>
            <Text style={styles.emptyHint}>Keep using the app and your profile will appear here!</Text>
          </View>
        )}
      </View>
    </>
  );

  const renderMonthly = () => (
    <>
      {/* Mood overview */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="heart-outline" size={18} color={COLORS.accent} />
          <Text style={styles.cardTitle}>Mood overview</Text>
        </View>
        <View style={styles.statGrid}>
          <View style={[styles.statBox, { backgroundColor: COLORS.bg }]}>
            <Text style={[styles.statNumber, { color: COLORS.accent }]}>{avgMood}</Text>
            <Text style={[styles.statLabel, { color: COLORS.subtitle }]}>Avg mood</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: COLORS.bg }]}>
            <Text style={[styles.statNumber, { color: COLORS.title }]}>
              {daysWithMood.length}
              <Text style={[styles.statUnit, { color: COLORS.subtitle }]}>/30</Text>
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.subtitle }]}>Days logged</Text>
          </View>
        </View>
        {daysWithMood.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Distribution</Text>
            <View style={styles.distRow}>
              {moodDistribution.map((item) => (
                <View key={item.emoji} style={styles.distItem}>
                  <View style={[
                    styles.distBar,
                    {
                      height: Math.max((item.count / maxMoodDist) * 50, 4),
                      opacity: item.count > 0 ? 0.4 + (item.count / maxMoodDist) * 0.6 : 0.2,
                    },
                  ]} />
                  <Text style={styles.distEmoji}>{item.emoji}</Text>
                  <Text style={styles.distCount}>{item.count}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Study overview */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time-outline" size={18} color={COLORS.amber} />
          <Text style={styles.cardTitle}>Study overview</Text>
        </View>
        <View style={styles.statGrid}>
          <View style={[styles.statBox, { backgroundColor: COLORS.amberBg }]}>
            <Text style={[styles.statNumber, { color: COLORS.amber }]}>{totalSessions}</Text>
            <Text style={[styles.statLabel, { color: COLORS.amberText }]}>Sessions</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: COLORS.amberBg }]}>
            <Text style={[styles.statNumber, { color: COLORS.amber }]}>
              {totalHours}
              <Text style={[styles.statUnit, { color: COLORS.amberText }]}> hr</Text>
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.amberText }]}>Total focus</Text>
          </View>
        </View>
        <View style={[styles.statGrid, { marginTop: 10 }]}>
          <View style={[styles.statBox, { backgroundColor: COLORS.amberBg }]}>
            <Text style={[styles.statNumber, { color: COLORS.amber }]}>{avgSessionsPerDay}</Text>
            <Text style={[styles.statLabel, { color: COLORS.amberText }]}>Avg sessions/day</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: COLORS.amberBg }]}>
            <Text style={[styles.statNumber, { color: COLORS.amber }]}>{avgMinPerSession}</Text>
            <Text style={[styles.statLabel, { color: COLORS.amberText }]}>Avg min/session</Text>
          </View>
        </View>
      </View>

      {/* Self-care overview */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="leaf-outline" size={18} color={COLORS.pink} />
          <Text style={styles.cardTitle}>Self-care overview</Text>
        </View>
        <View style={styles.statGrid}>
          <View style={[styles.statBox, { backgroundColor: COLORS.pinkBg }]}>
            <Text style={[styles.statNumber, { color: COLORS.pink }]}>{totalSelfCareLogs}</Text>
            <Text style={[styles.statLabel, { color: COLORS.pinkText }]}>Total logs</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: COLORS.pinkBg }]}>
            <Text style={[styles.statNumber, { color: COLORS.pink }]}>{selfCareData.length}</Text>
            <Text style={[styles.statLabel, { color: COLORS.pinkText }]}>Categories used</Text>
          </View>
        </View>
        {selfCareData.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Top categories</Text>
            <View style={styles.barList}>
              {selfCareData.slice(0, 4).map((cat) => (
                <View key={cat.label} style={styles.barRow}>
                  <View style={styles.barLabel}>
                    <Ionicons name={cat.icon as any} size={16} color={COLORS.pink} />
                    <Text style={styles.barLabelText}>{cat.label}</Text>
                  </View>
                  <View style={[styles.barTrack, { backgroundColor: '#F5E8EC' }]}>
                    <View style={[styles.barFill, {
                      width: `${(cat.count / maxSelfCare) * 100}%`,
                      backgroundColor: COLORS.pink,
                    }]} />
                  </View>
                  <Text style={styles.barCount}>{cat.count}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Habit prediction */}
      {/* Has streaks or patterns? */}
      {(habits.streaks.length > 0 || habits.patterns.length > 0) ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flame-outline" size={18} color={COLORS.amber} />
            <Text style={styles.cardTitle}>Habit streaks</Text>
          </View>
          
          {/* Has streaks? Yes: show streak rows (icon + category label + x-day streak + 7 dots */}
          {habits.streaks.length > 0 && (
            <View style={{ gap: 10, marginBottom: habits.patterns.length > 0 ? 14 : 0 }}>
              {habits.streaks.map((s) => (
                <View key={s.label} style={styles.streakRow}>
                  <View style={styles.streakIcon}>
                    <Ionicons name={s.icon as any} size={18} color={COLORS.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.streakLabel}>{s.label}</Text>
                    <Text style={styles.streakSub}>{s.streak}-day streak</Text>
                  </View>
                  <View style={styles.streakDots}>
                    {Array.from({ length: Math.min(s.streak, 7) }).map((_, i) => (
                      <View key={i} style={styles.streakDotFilled} />
                    ))}
                    {s.streak < 7 && Array.from({ length: 7 - Math.min(s.streak, 7) }).map((_, i) => (
                      <View key={`e-${i}`} style={styles.streakDotEmpty} />
                    ))}
                  </View>
                </View>
              ))}
              {/* Any streak at risk? Yes: show warning */}
              {habits.streaks.some(s => s.atRisk) && (
                <View style={[styles.insightCard, { backgroundColor: COLORS.amberBg, borderLeftColor: COLORS.amber }]}>
                  <View style={styles.insightRow}>
                    <Ionicons name="alert-circle-outline" size={16} color={COLORS.amber} />
                    <Text style={[styles.insightText, { color: COLORS.title }]}>
                      {habits.streaks.find(s => s.atRisk)?.label} streak is at risk. log it today to keep it going!
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Has patterns? Yes: "your patterns" + show pattern rows (icon + pattern detected + sugggesstion) */}
          {habits.patterns.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Your patterns</Text>
              <View style={{ gap: 10 }}>
                {habits.patterns.map((p) => (
                  <View key={p.label} style={[styles.insightCard, { backgroundColor: '#EEF4F7', borderLeftColor: COLORS.accent }]}>
                    <View style={styles.insightRow}>
                      <Ionicons name={p.icon as any} size={16} color={COLORS.accent} />
                      <Text style={[styles.insightText, { color: COLORS.title }]}>
                        You usually log {p.label} on {p.days.join(', ')}.
                      </Text>
                    </View>
                    <Text style={[styles.insightSuggestion, { color: COLORS.subtitle }]}>
                      Routines build themselves — keep showing up on the days that work for you.
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      ) : ( 
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flame-outline" size={18} color={COLORS.amber} />
            <Text style={styles.cardTitle}>Habit streaks</Text>
          </View>
          <View style={styles.emptyState}>
            <Ionicons name="flame-outline" size={32} color={COLORS.muted} />
              <Text style={styles.emptyText}>No habits detected yet</Text>
              <Text style={styles.emptyHint}>Log self-care activities for a few days and Sunny will find your patterns!</Text>
          </View>
        </View>
      )}

      {/* Insights card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="bulb-outline" size={18} color={COLORS.amber} />
          <Text style={styles.cardTitle}>Your wellness insights</Text>
        </View>
        {insights.length > 0 ? (
          <View style={{ gap: 10 }}>
            {insights.map((ins, i) => {
              const c = INSIGHT_COLORS[ins.color];
              return (
                <View key={i} style={[styles.insightCard, { backgroundColor: c.bg, borderLeftColor: c.border }]}>
                  <View style={styles.insightRow}>
                    <Ionicons name={ins.icon as any} size={16} color={c.border} />
                    <Text style={[styles.insightText, { color: c.text }]}>{ins.text}</Text>
                  </View>
                  <Text style={[styles.insightSuggestion, { color: c.suggestion }]}>{ins.suggestion}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bulb-outline" size={32} color={COLORS.muted} />
            <Text style={styles.emptyText}>No insights yet</Text>
            <Text style={styles.emptyHint}>Keep logging your mood, sessions, and self-care.</Text>
            <Text style={styles.emptyHint}>Sunny will spot patterns for you!</Text>
          </View>
        )}
      </View>  
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="people-outline" size={18} color={COLORS.accent} />
          <Text style={styles.cardTitle}>Your profile</Text>
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>Demo data</Text>
          </View>
        </View>
        {segment ? (
          <>
            <View style={styles.segmentBadge}>
              <Text style={styles.segmentType}>You are a</Text>
              <Text style={styles.segmentLabel}>{segment.clusterLabel}</Text>
              <Text style={styles.segmentDesc}>{segment.clusterDescription}</Text>
            </View>

            <View style={[styles.statGrid, { marginTop: 14 }]}>
              <View style={[styles.statBox, { backgroundColor: COLORS.bg }]}>
                <Text style={[styles.statNumber, { color: COLORS.accent, fontSize: 22 }]}>{segment.userStats.studySessions}</Text>
                <Text style={[styles.statLabel, { color: COLORS.subtitle }]}>Sessions</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: COLORS.bg }]}>
                <Text style={[styles.statNumber, { color: COLORS.accent, fontSize: 22 }]}>{segment.userStats.selfCareLogs}</Text>
                <Text style={[styles.statLabel, { color: COLORS.subtitle }]}>Self-care logs</Text>
              </View>
            </View>

            <View style={[styles.statGrid, { marginTop: 10 }]}>
              <View style={[styles.statBox, { backgroundColor: COLORS.bg }]}>
                <Text style={[styles.statNumber, { color: COLORS.accent, fontSize: 22 }]}>{segment.userStats.avgMood}</Text>
                <Text style={[styles.statLabel, { color: COLORS.subtitle }]}>Avg mood</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: COLORS.bg }]}>
                <Text style={[styles.statNumber, { color: COLORS.accent, fontSize: 22 }]}>Top {100 - segment.percentile}%</Text>
                <Text style={[styles.statLabel, { color: COLORS.subtitle }]}>Activity level</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={32} color={COLORS.muted} />
            <Text style={styles.emptyText}>Not enough data yet</Text>
            <Text style={styles.emptyHint}>Keep using the app and your profile will appear here!</Text>
          </View>
        )}
      </View>  
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>{rangeLabel}</Text>
        </View>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode == 'week' && styles.toggleBtnActive]}
            onPress={() => setMode('week')}
          >
            <Text style={[styles.toggleText, mode == 'week' && styles.toggleTextActive]}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode == 'month' && styles.toggleBtnActive]}
            onPress={() => setMode('month')}
          >
            <Text style={[styles.toggleText, mode == 'month' && styles.toggleTextActive]}>Month</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {mode === 'week' ? renderWeekly() : renderMonthly()}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.title,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
    }),
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.subtitle,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.accentLight,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.accent,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.subtitle,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.title,
  },
  cardBadge: {
    marginLeft: 'auto',
    fontSize: 12,
    color: COLORS.subtitle,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -16,
  },
  chartScroll: {
    marginHorizontal: -16,
    paddingLeft: 16,
  },
  barList: {
    gap: 10,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 90,
  },
  barLabelText: {
    fontSize: 13,
    color: COLORS.subtitle,
  },
  barTrack: {
    flex: 1,
    height: 14,
    backgroundColor: '#E4EDF0',
    borderRadius: 7,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 7,
  },
  barCount: {
    fontSize: 12,
    color: COLORS.muted,
    width: 20,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.subtitle,
  },
  emptyHint: {
    fontSize: 12,
    color: COLORS.muted,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '500',
  },
  statUnit: {
    fontSize: 14,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.subtitle,
    marginTop: 14,
    marginBottom: 8,
  },
  distRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-end',
    height: 90,
  },
  distItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  distBar: {
    width: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  distEmoji: {
    fontSize: 18,
  },
  distCount: {
    fontSize: 11,
    color: COLORS.muted,
  },
  insightCard: {
    borderLeftWidth: 3,
    borderRadius: 0,
    padding: 12,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  insightText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  insightSuggestion: {
    fontSize: 12,
    lineHeight: 17,
    marginLeft: 22,
    fontStyle: 'italic',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E4EDF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.title,
  },
  streakSub: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  streakDots: {
    flexDirection: 'row',
    gap: 3,
  },
  streakDotFilled: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  streakDotEmpty: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(59,153,185,0.15)',
  },
  demoBadge: {
    marginLeft: 'auto',
    backgroundColor: '#E4EDF0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.subtitle,
  },
  segmentBadge: {
    backgroundColor: '#E4EDF0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  segmentType: {
    fontSize: 11,
    color: COLORS.subtitle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  segmentLabel: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.title,
    marginTop: 2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  segmentDesc: {
    fontSize: 12,
    color: COLORS.subtitle,
    marginTop: 4,
    textAlign: 'center',
  },
});
