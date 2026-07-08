/*
 * Only happens when wellness score increases.
*/

import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WellnessToast({ amount, reason }: { amount: number; reason: string }) {
  return (
    <View style={styles.toast}>
      <View style={styles.icon}><Ionicons name="leaf" size={18} color="#5E8C4A" /></View>
      <View>
        <Text style={styles.amount}>Wellness +{amount}</Text>
        <Text style={styles.reason}>{reason}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE7D4',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    shadowColor: '#3C463A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 5,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E4F0DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C463A',
  },
  reason: {
    fontSize: 12,
    color: '#7C8A75',
    marginTop: 1,
  },
});
