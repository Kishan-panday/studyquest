/**
 * Backend configuration
 */
export const CONFIG = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || "10", 10),
};

/**
 * XP and Level configuration
 */
export const GAME_CONFIG = {
  XP_PER_LEVEL: 100,
  BASE_XP_REWARD: 5,
  CORRECT_ANSWER_XP: 25,
  STREAK_BONUS_XP: 35,
  STREAK_BONUS_THRESHOLD: 6,
  ACCURACY_THRESHOLD_1: 80,
  ACCURACY_THRESHOLD_2: 90,
};

/**
 * Badge thresholds
 */
export const BADGE_THRESHOLDS = {
  CENTURY_XP: 100,
  XP_MASTER: 500,
  XP_LEGEND: 1000,
  STREAK_3: 3,
  STREAK_7: 7,
  STREAK_30: 30,
  QUIZ_COMPLETE_1: 1,
  QUIZ_COMPLETE_5: 5,
  QUIZ_COMPLETE_10: 10,
  QUIZ_COMPLETE_25: 25,
  STUDY_TIME_1H: 60,
  STUDY_TIME_5H: 300,
  SUBJECT_SPECIALIST: 5,
  SUBJECT_EXPERT_CORRECT: 10,
  LEVEL_5: 5,
  BEST_STREAK_10: 10,
  TOTAL_QUESTIONS_100: 100,
};
