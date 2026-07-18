/*
 * WellnessNotice component.
 * Gentle, non-numeric feedback when wellness dips (does not show minus how many marks)
 * Shows Sunny's state + neutral observations + a forward-looking nudge.
*/

import { BurnoutStatus } from '@/lib/burnout';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

const FACTOR_DISPLAY: Record<string, { icon: string; text: string }> = {
  'Very heavy study load today': { icon: 'time-outline', text: 'A very long study day' },
  'Long study day': { icon: 'time-outline', text: 'Long study hours today' },
  'Heavy load building up all week': { icon: 'calendar-outline', text: 'Several heavy days in a row' },
  'Load creeping up this week': { icon: 'calendar-outline', text: 'Study load creeping up' },
  'Barely any breaks today': { icon: 'cafe-outline', text: 'Very few breaks today' },
  'Low mood check-ins': { icon: 'battery-dead-outline', text: 'A draining day' },
};

function moodFactor(f: string): { icon: string; text: string } | null {
  if (f === 'Feeling exhausted') return { icon: 'battery-dead-outline', text: 'A draining day' };
  if (f === 'Feeling stressed') return { icon: 'pulse-outline', text: 'A stressful day' };
  return null;
}

const TIER_COPY: Partial<Record<BurnoutStatus, { title: string; sub: string }>> = {
  overextended: {
    title: "Sunny's a little tired",
    sub: "You've been pushing hard lately. A bit of rest would help.",
  },
  burnout: {
    title: 'Sunny needs a rest',
    sub: "You've been running low for a while. Be gentle with yourself today.",
  },
};

export default function WellnessNotice({
  status,
  factors,
}: {
  status: BurnoutStatus;
  factors: string[];
}) {
  const copy = TIER_COPY[status];
  if (!copy) return null;

  const shown = factors
    .map(f => FACTOR_DISPLAY[f])
    .filter(Boolean)
    .slice(0, 3);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.avatar}>
          <Text style={styles.chicken}>🐤</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.sub}>{copy.sub}</Text>
        </View>
      </View>

      {shown.length > 0 && (
        <View style={styles.factorsBox}>
          <Text style={styles.factorsLabel}>What's been happening</Text>
          {shown.map((f, i) => (
            <View key={i} style={[styles.factorRow, i > 0 && { marginTop: 6 }]}>
              <Ionicons name={f.icon as any} size={16} color="#B0843C" />
              <Text style={styles.factorText}>{f.text}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.nudge}>
        <Ionicons name="leaf-outline" size={17} color="#5E8C4A" />
        <Text style={styles.nudgeText}>Logging a break or some rest will lift this back up.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7ECE1',
    borderRadius: 20,
    padding: 18,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F4EEDC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chicken: {
    fontSize: 30,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3C463A',
  },
  sub: {
    fontSize: 13,
    color: '#7C8A75',
    marginTop: 3,
    lineHeight: 19,
  },
  factorsBox: {
    backgroundColor: '#F6F4EC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  factorsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#93A089',
    marginBottom: 8,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  factorText: {
    fontSize: 13,
    color: '#5E6E55',
  },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EBF1E4',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  nudgeText: {
    flex: 1,
    fontSize: 13,
    color: '#466B36',
    lineHeight: 18,
  },
});
