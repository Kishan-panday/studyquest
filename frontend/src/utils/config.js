/**
 * Frontend configuration
 */
export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  ERROR_TIMEOUT: parseInt(import.meta.env.VITE_ERROR_TIMEOUT || "5000", 10),
  XP_PER_LEVEL: 100,
  INITIAL_STATE: {
    student: null,
    leaderboard: [],
    quizzes: [],
  },
};

/**
 * API endpoint constants
 */
export const API_ENDPOINTS = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  SUBMIT_QUIZ: "/submitQuiz",
  LEADERBOARD: "/leaderboard",
};
