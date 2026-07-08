/* 
 * Used for care and home screens.
*/

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { calculateBurnoutScore, BurnoutStatus, BurnoutResult } from '@/lib/burnout';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const STATUS_DISPLAY: Record<BurnoutStatus, { label: string; color: string; message: string }> = {
  engaged:     { label: 'Engaged', color: '#5E9C4F', message: 'Sunny is thriving. Keep it up.' },
  balanced:     { label: 'Balanced', color: '#8FB07A', message: 'Sunny is calm. No rush today.' },
  overextended:  { label: 'Overextended', color: '#E07B39', message: 'Sunny needs a breather soon.' },
  burnout:  { label: 'Burnout', color: '#C44536', message: 'Time to rest. Sunny is tired.' },
};

const TIERS = [
  { color: '#5E9C4F', label: 'Engaged', range: '70–100', desc: 'Sustainable balance of exertion and recovery.' },
  { color: '#8FB07A', label: 'Balanced', range: '45-69',  desc: 'Coping adequately, with mild markers of accumulating fatigue.' },
  { color: '#E0A03E', label: 'Overextended', range: '25–44',  desc: 'At-risk workload pattern; recovery strategies are recommended.' },
  { color: '#C44536', label: 'Burnout', range: '0–24',   desc: 'Elevated burnout risk; sustained rest and intervention advised.' },
];

// Ring
const SIZE = 96;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function BurnoutIndicator({ 
  compact = false, 
  result: resultProp, 
}: { 
  compact?: boolean;
  result?: BurnoutResult | null; 
}) {
  const [resultState, setResultState] = useState<BurnoutResult | null>(null);
  const [infoVisible, setInfoVisible] = useState(false);

  useEffect(() => {
    if (resultProp !== undefined) return; 
    async function load() {
      setResultState(await calculateBurnoutScore());
    }
    load();
  }, [resultProp]);

  const result = resultProp !== undefined ? resultProp : resultState;
  if (!result) return null;

  const display = STATUS_DISPLAY[result.status];
  const clamped = Math.max(0, Math.min(100, result.score));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);  

  // Small version for home screen
  if (compact) {
    return (
      <View style={[styles.compactCard, { borderColor: display.color }]}>
        <View style={[styles.compactDot, { backgroundColor: display.color }]} />
        <Text style={[styles.compactLabel, { color: display.color }]}>
          {display.label}
        </Text>
        <Text style={styles.compactScore}>{result.score}</Text>
      </View>
    );
  }

  // full version for care screen
  return (
    <View style={styles.fullRow}>
      <Pressable style={styles.infoButton} onPress={() => setInfoVisible(true)} hitSlop={8}>
        <Ionicons name="information-circle-outline" size={20} color="#6E7D67" />
      </Pressable>

      {/* Ring + chicken placeholder*/}
      <View style={styles.ringWrap}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#E6ECE0"
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={display.color}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <View style={styles.chickenWrap}>
          <Text style={styles.chicken}>🐤</Text>
        </View>
      </View>
   
      {/* Text block */}
      <View style={styles.textBlock}>
        <View style={styles.kickerRow}>
          <Text style={styles.kicker}>Wellness Score</Text>
        </View>
        <Text style={[styles.tier, { color: display.color }]}>{display.label}</Text>
        <Text style={styles.score}>{result.score} / 100</Text>
        <Text style={styles.message}>{display.message}</Text>
      </View>

      {/* Tiers info modal */}
      <Modal visible={infoVisible} transparent animationType="fade" onRequestClose={() => setInfoVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setInfoVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>What does the tiers mean?</Text>
              <Pressable onPress={() => setInfoVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color="#6E7D67" />
              </Pressable>
            </View>

            {TIERS.map(tier => (
              <View key={tier.label} style={styles.tierRow}>
                <View style={[styles.tierDot, { backgroundColor: tier.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.tierLabel}>
                    {tier.label} <Text style={styles.tierRange}>· {tier.range}</Text>
                  </Text>
                  <Text style={styles.tierDesc}>{tier.desc}</Text>
                </View>
              </View>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Compact (home)
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    gap: 8,
  },
  compactDot: { width: 10, height: 10, borderRadius: 5 },
  compactLabel: { fontSize: 13, fontWeight: 'bold' },
  compactScore: { fontSize: 13, color: '#93A089', fontWeight: '600' },

  // Full (care)
  fullRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  ringWrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  chickenWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  chicken: { fontSize: 40 },
  textBlock: { flex: 1 },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kicker: { fontSize: 14, fontWeight: '600', color: '#93A089' },
  tier: { fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  score: { fontSize: 13, color: '#7C8A75', marginTop: 3 },
  message: { fontSize: 14, color: '#7C8A75', marginTop: 6, lineHeight: 19 },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(44,42,38,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E7ECE1',
    shadowColor: '#3C463A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#3C463A' },
  tierRow: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', marginBottom: 14 },
  tierDot: { width: 11, height: 11, borderRadius: 6, marginTop: 4 },
  tierLabel: { fontSize: 14, fontWeight: '600', color: '#3C463A' },
  tierRange: { fontSize: 13, color: '#93A089', fontWeight: '400' },
  tierDesc: { fontSize: 12.5, color: '#7C8A75', lineHeight: 18, marginTop: 1 },
  infoButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
});
