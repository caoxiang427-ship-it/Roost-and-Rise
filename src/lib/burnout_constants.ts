/*
 * Constants for the burnout score.
 * All explained in README (design of burnout indicator)
*/

export const BURNOUT_CONFIG = {
  NEUTRAL_BASELINE: 65,

  // Exhaustion penalty
  LOAD_FREE_HOURS: 4,           
  LOAD_MID_SLOPE: 7,           
  LOAD_MID_CEILING_HOURS: 8,    
  LOAD_HIGH_SLOPE: 4,
  EXHAUSTION_CAP: 40,

  // Recovery credit 
  BREAK_CREDIT_MINUTES_FULL: 60,   
  BREAK_CREDIT_HOURS_CAP: 1.0,
  SELFCARE_CREDIT_PER_LOG: 0.25,   
  SELFCARE_CREDIT_CAP: 1.0,

  // Chronic penalty
  CHRONIC_WINDOW_DAYS: 7,
  HEAVY_DAY_HOURS: 4,
  CHRONIC_MEAN_SLOPE: 2.5,
  CHRONIC_STREAK_GRACE_DAYS: 3,
  CHRONIC_STREAK_SLOPE: 2,
  CHRONIC_CAP: 20,

  // Mood
  MOOD_VALUES: { exhausted: -2, stressed: -1, okay: 0, good: 1, great: 2 },
  MOOD_TODAY_WEIGHT: 0.7,
  MOOD_RECENT_WEIGHT: 0.3,
  MOOD_RECENT_DAYS: 3,
  MOOD_STALE_DECAY: 0.5,
  MOOD_NEG_SLOPE: 8,            
  MOOD_POS_SLOPE: 6,            

  // Recovery bonus
  SELFCARE_BONUS_PER_LOG: 2,
  SELFCARE_BONUS_CAP: 6,
  BREAK_BONUS_CAP: 4,
  BREAK_BONUS_MINUTES_FULL: 30,  // 30 break mins gives the full +4

  // Efficacy bonus
  EFFICACY_MAX: 12,
  MIN_SESSIONS_FOR_RATE: 2,      

  THRESHOLDS: {
    ENGAGED: 70,
    BALANCED: 45,
    OVEREXTENDED: 25,
    // below 25 -> burnout
  },
};