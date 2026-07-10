import AsyncStorage from '@react-native-async-storage/async-storage';
import { BurnoutStatus } from './burnout';

const TIER_RANK: Record<BurnoutStatus, number> = {
  engaged: 3, balanced: 2, overextended: 1, burnout: 0,
};

const LAST_TIER_KEY = 'wellness_last_tier';
const LAST_SHOWN_KEY = 'wellness_notice_shown_date';

function todayKey() {
  return new Date().toDateString();
}

export async function shouldShowWellnessNotice(current: BurnoutStatus): Promise<boolean> {
  if (current !== 'overextended' && current !== 'burnout') {
    await AsyncStorage.setItem(LAST_TIER_KEY, current); // save current tier for next time
    return false;
  }

  // Grab two saved values first
  const prevTier = (await AsyncStorage.getItem(LAST_TIER_KEY)) as BurnoutStatus | null;
  const lastShown = await AsyncStorage.getItem(LAST_SHOWN_KEY);

  await AsyncStorage.setItem(LAST_TIER_KEY, current); // update tier memory to now

  if (lastShown === todayKey()) return false;

  // show only if tier dropped (or first time we have no previous tier)
  const dropped = !prevTier || TIER_RANK[current] < TIER_RANK[prevTier];
  if (!dropped) return false;

  await AsyncStorage.setItem(LAST_SHOWN_KEY, todayKey());
  return true;
}
