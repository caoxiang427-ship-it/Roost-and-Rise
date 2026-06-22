/* 
 * Constants used for burnout score computation.
*/

export const BURNOUT_CONFIG = {
  // Study hours
  STUDY_OVERWORK_MINUTES: 360,            
  STUDY_OVERWORK_PENALTY: 15,             
  STUDY_SEVERE_OVERWORK_MINUTES: 480, 
  STUDY_SEVERE_PENALTY: 30,

  // Sleep hours
  SLEEP_THRESHOLD: 7,                    
  SLEEP_PENALTY: 20,                      

  // Chronic load
  RECENT_DAYS_FOR_CHRONIC: 3,
  CONSECUTIVE_NO_BREAK_PENALTY: 15,   
  
  // Self-care logging 
  GOOD_SELFCARE_COUNT: 3,
  SELFCARE_BONUS: 10,
  BREAK_BONUS: 10,

  // Mood check-ins
  MOOD_SCORES: {
    exhausted: -20,   
    stressed: -15,     
    okay: 0,
    good: 10,
    great: 15,
  },

  THRESHOLDS: {
    ENGAGED: 70,      
    BALANCED: 45,        
    OVEREXTENDED: 25,     
    // < 25 → burnout
  },
};
