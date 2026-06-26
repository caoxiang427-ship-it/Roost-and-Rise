/* 
 * Used for care and home screens.
*/

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { calculateBurnoutScore, BurnoutStatus, BurnoutResult } from '@/lib/burnout';

const STATUS_DISPLAY: Record<BurnoutStatus, { label: string; emoji: string; color: string }> = {
  engaged:     { label: 'Engaged', emoji: '💚', color: '#7FB069' },
  balanced:     { label: 'Balanced', emoji: '💛', color: '#E8A33D' },
  overextended:  { label: 'Overextended', emoji: '🧡', color: '#E07B39' },
  burnout:  { label: 'Burnout', emoji: '🔴', color: '#C44536' },
};

export default function BurnoutIndicator({ compact = false }: { compact?: boolean }) {
  const [result, setResult] = useState<BurnoutResult | null>(null);

  useEffect(() => {
    async function loadScore() {
      const output = await calculateBurnoutScore();
      setResult(output);
    }
    loadScore();
  }, []);

  if (!result) return null;

  const displayResult = STATUS_DISPLAY[result.status];

  // Small version for home screen
  if (compact) {
    return (
      <View style={[styles.compactCard, { borderColor: displayResult.color }]}>
        <Text style={styles.compactEmoji}>{displayResult.emoji}</Text>
        <Text style={[styles.compactLabel, { color: displayResult.color }]}>
          {displayResult.label}
        </Text>
      </View>
    );
  }

  // full version for care screen
  return (
    <View style={styles.fullCard}>
      <Text style={styles.fullLabel}>WELLBEING</Text>
      <View style={styles.fullRow}>
        <Text style={styles.fullEmoji}>{displayResult.emoji}</Text>
        <View style={styles.fullTextBlock}>
          <Text style={[styles.fullStatus, { color: displayResult.color }]}>
            {displayResult.label}
          </Text>
          <Text style={styles.fullScore}>{result.score} / 100</Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${result.score}%`, backgroundColor: displayResult.color }]} />
      </View>
      {result.factors.length > 0 && (
        <Text style={styles.factors}>{result.factors.join(' · ')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  compactEmoji: { fontSize: 16 },
  compactLabel: { fontSize: 13, fontWeight: 'bold' },

  fullCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    gap: 10,
  },
  fullLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, color: '#8B6F3F' },
  fullRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fullEmoji: { fontSize: 32 },
  fullTextBlock: { flex: 1 },
  fullStatus: { fontSize: 18, fontWeight: 'bold' },
  fullScore: { fontSize: 13, color: '#8B6F3F', marginTop: 2 },
  progressBar: { width: '100%', height: 8, backgroundColor: '#F0E4C8', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  factors: { fontSize: 12, color: '#8B6F3F', fontStyle: 'italic' },
});
