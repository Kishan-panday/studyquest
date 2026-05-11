import { Router } from "express";
import { readDb, writeDb } from "../utils/fileDb.js";
import bcrypt from "bcrypt";
import { CONFIG, GAME_CONFIG, BADGE_THRESHOLDS } from "../utils/config.js";
import { ApiError, logger } from "../utils/errorHandler.js";

const router = Router();

function getDateString(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function getWeekStart(dateString) {
  const date = new Date(dateString + "T00:00:00Z");
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff)).toISOString().split("T")[0];
}

function getDateDifference(previousDate, currentDate) {
  const previous = new Date(`${previousDate}T00:00:00Z`);
  const current = new Date(`${currentDate}T00:00:00Z`);
  return Math.round((current - previous) / 86400000);
}

function calculateLevel(xp) {
  return Math.max(Math.floor(xp / CONFIG.GAME_CONFIG.XP_PER_LEVEL) + 1, 1);
}

function calculateXpReward(isCorrect, currentStreak) {
  if (!isCorrect) return GAME_CONFIG.BASE_XP_REWARD;
  if (currentStreak >= GAME_CONFIG.STREAK_BONUS_THRESHOLD) return GAME_CONFIG.STREAK_BONUS_XP;
  return GAME_CONFIG.CORRECT_ANSWER_XP;
}

function unlockBadges(user) {
  const nextBadges = new Set(user.badges);
  const nextAchievements = new Set(user.achievements || []);

  // XP-based badges
  if (user.xp >= BADGE_THRESHOLDS.CENTURY_XP) nextBadges.add("Century XP");
  if (user.xp >= BADGE_THRESHOLDS.XP_MASTER) nextBadges.add("XP Master");
  if (user.xp >= BADGE_THRESHOLDS.XP_LEGEND) nextBadges.add("XP Legend");

  // Streak badges
  if (user.streak >= BADGE_THRESHOLDS.STREAK_3) nextBadges.add("3-Day Streak");
  if (user.streak >= BADGE_THRESHOLDS.STREAK_7) nextBadges.add("Week Warrior");
  if (user.streak >= BADGE_THRESHOLDS.STREAK_30) nextBadges.add("Monthly Champion");

  // Quiz completion badges
  if (user.completedQuizzes >= BADGE_THRESHOLDS.QUIZ_COMPLETE_1) nextBadges.add("First Quiz Completed");
  if (user.completedQuizzes >= BADGE_THRESHOLDS.QUIZ_COMPLETE_5) nextBadges.add("Quiz Explorer");
  if (user.completedQuizzes >= BADGE_THRESHOLDS.QUIZ_COMPLETE_10) nextBadges.add("Quiz Master");
  if (user.completedQuizzes >= BADGE_THRESHOLDS.QUIZ_COMPLETE_25) nextBadges.add("Knowledge Seeker");

  // Accuracy badges
  if (user.accuracy >= BADGE_THRESHOLDS.ACCURACY_THRESHOLD_1) nextBadges.add("Accuracy Expert");
  if (user.accuracy >= BADGE_THRESHOLDS.ACCURACY_THRESHOLD_2) nextBadges.add("Precision Master");

  // Subject-specific badges
  if (user.statistics?.subjectPerformance) {
    const subjects = Object.keys(user.statistics.subjectPerformance);
    if (subjects.length >= BADGE_THRESHOLDS.SUBJECT_SPECIALIST) nextBadges.add("Subject Specialist");
    if (subjects.some(subject => user.statistics.subjectPerformance[subject].correct >= BADGE_THRESHOLDS.SUBJECT_EXPERT_CORRECT)) {
      nextBadges.add("Subject Expert");
    }
  }

  // Time-based badges
  if (user.studyTimeMinutes >= BADGE_THRESHOLDS.STUDY_TIME_1H) nextBadges.add("Hourly Scholar");
  if (user.studyTimeMinutes >= BADGE_THRESHOLDS.STUDY_TIME_5H) nextBadges.add("Dedicated Learner");

  // Achievement unlocks
  if (user.level >= BADGE_THRESHOLDS.LEVEL_5) nextAchievements.add("Level 5 Reached");
  if (user.bestStreak >= BADGE_THRESHOLDS.BEST_STREAK_10) nextAchievements.add("Consistency King");
  if (user.totalQuestionsAnswered >= BADGE_THRESHOLDS.TOTAL_QUESTIONS_100) nextAchievements.add("Century Questions");

  user.badges = [...nextBadges];
  user.achievements = [...nextAchievements];
}

function updateDailyStreak(user) {
  const today = getDateString();

  if (!user.lastAttemptDate) {
    user.streak = 1;
  } else {
    const dayDifference = getDateDifference(user.lastAttemptDate, today);

    if (dayDifference === 0) {
      // Same day: keep the existing streak
    } else if (dayDifference === 1) {
      user.streak += 1;
    } else {
      user.streak = 1;
    }
  }

  user.lastAttemptDate = today;
}

function sortLeaderboard(users) {
  return [...users].sort((a, b) => b.xp - a.xp);
}

router.get("/users", async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json({
      users: db.users.map(({ id, name, college, email }) => ({ id, name, college, email })),
    });
  } catch (error) {
    next(error);
  }
});

function createNewUser({ name, college, email, password }) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  return {
    id: `student-${Date.now()}`,
    name,
    college,
    email,
    password: hashedPassword,
    xp: 0,
    level: 1,
    streak: 0,
    lastAttemptDate: null,
    completedQuizzes: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    accuracy: 0,
    studyTimeMinutes: 0,
    favoriteSubject: null,
    weakSubjects: [],
    badges: [],
    achievements: [],
    studyGoals: {
      dailyQuizTarget: 5,
      weeklyXpTarget: 200,
      currentWeekXp: 0,
      currentWeekStart: getDateString()
    },
    learningPath: {
      currentFocus: "General Knowledge",
      completedTopics: [],
      recommendedTopics: ["JavaScript", "Python Programming", "Data Structures"]
    },
    statistics: {
      bestStreak: 0,
      totalStudySessions: 0,
      averageSessionTime: 0,
      subjectPerformance: {},
      monthlyProgress: []
    }
  };
}

router.get("/quizzes", async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json({ quizzes: db.quizzes });
  } catch (error) {
    next(error);
  }
});

router.post("/users", async (req, res, next) => {
  try {
    const { name, college, email, password } = req.body ?? {};

    // Validation
    if (!name || !college || !email || !password) {
      throw new ApiError(400, "Name, college, email, and password are required to register.");
    }

    if (password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters long.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      throw new ApiError(400, "Please provide a valid email address.");
    }

    const db = await readDb();

    if (db.users.some((user) => user.email?.toLowerCase() === normalizedEmail)) {
      throw new ApiError(409, "An account with this email already exists.");
    }

    const newUser = createNewUser({ name, college, email: normalizedEmail, password });
    db.users.push(newUser);
    await writeDb(db);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    logger.info(`New user registered: ${normalizedEmail}`);
    return res.status(201).json({
      message: "Registration successful.",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = await readDb();

    const user = db.users.find((user) => user.email?.toLowerCase() === normalizedEmail);

    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password.");
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${normalizedEmail}`);
    return res.status(200).json({
      message: "Login successful.",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/dashboard", async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      throw new ApiError(400, "userId is required.");
    }

    const db = await readDb();

    const student = db.users.find((user) => user.id === userId);
    if (!student) {
      throw new ApiError(404, "User not found.");
    }

    const leaderboard = sortLeaderboard(db.users);

    res.json({
      student,
      leaderboard,
      quizzes: db.quizzes,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/attempts", async (req, res, next) => {
  try {
    const { userId, quizId, answer, timeSpent = 30 } = req.body ?? {};

    if (!userId || !quizId || !answer) {
      throw new ApiError(400, "userId, quizId, and answer are required.");
    }

    const db = await readDb();

    const user = db.users.find((item) => item.id === userId);
    const quiz = db.quizzes.find((item) => item.id === quizId);

    if (!user || !quiz) {
      throw new ApiError(404, "User or quiz not found.");
    }

    const isCorrect = quiz.correctAnswer === answer;
    const xpEarned = calculateXpReward(isCorrect, user.streak);

    // Update basic stats
    user.xp += xpEarned;
    updateDailyStreak(user);
    user.completedQuizzes += 1;
    user.totalQuestionsAnswered = (user.totalQuestionsAnswered || 0) + 1;
    user.studyTimeMinutes = (user.studyTimeMinutes || 0) + Math.max(1, Math.round(timeSpent / 60));

    // Update accuracy
    if (isCorrect) {
      user.correctAnswers = (user.correctAnswers || 0) + 1;
    }
    user.accuracy = Math.round((user.correctAnswers / user.totalQuestionsAnswered) * 100);

    // Update subject performance
    if (!user.statistics) user.statistics = { subjectPerformance: {} };
    if (!user.statistics.subjectPerformance[quiz.subject]) {
      user.statistics.subjectPerformance[quiz.subject] = { correct: 0, total: 0 };
    }
    user.statistics.subjectPerformance[quiz.subject].total += 1;
    if (isCorrect) {
      user.statistics.subjectPerformance[quiz.subject].correct += 1;
    }

    // Update favorite subject
    const subjectStats = Object.entries(user.statistics.subjectPerformance);
    if (subjectStats.length > 0) {
      const [topSubject] = subjectStats.reduce((a, b) =>
        a[1].total > b[1].total ? a : b
      );
      user.favoriteSubject = topSubject;
    }

    // Update weak subjects (accuracy < 70%)
    user.weakSubjects = Object.entries(user.statistics.subjectPerformance)
      .filter(([_, stats]) => (stats.correct / stats.total) * 100 < 70)
      .map(([subject]) => subject);

    // Update best streak
    user.bestStreak = Math.max(user.bestStreak || 0, user.streak);

    // Update study goals
    const today = getDateString();
    if (user.studyGoals.currentWeekStart !== getWeekStart(today)) {
      user.studyGoals.currentWeekStart = getWeekStart(today);
      user.studyGoals.currentWeekXp = 0;
    }
    user.studyGoals.currentWeekXp += xpEarned;

    user.level = calculateLevel(user.xp);
    unlockBadges(user);

    db.attempts.unshift({
      id: `attempt-${Date.now()}`,
      userId,
      quizId,
      answer,
      isCorrect,
      xpEarned,
      timeSpentSeconds: timeSpent,
      submittedAt: new Date().toISOString(),
    });

    await writeDb(db);

    logger.info(`Quiz attempt by ${userId}: ${isCorrect ? "correct" : "incorrect"}`);
    return res.status(201).json({
      message: isCorrect
        ? `Correct answer! You earned ${xpEarned} XP.`
        : `Wrong answer, but you still earned ${xpEarned} XP for trying.`,
      student: user,
      leaderboard: sortLeaderboard(db.users),
      quizzes: db.quizzes,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      throw new ApiError(400, "userId is required.");
    }

    const db = await readDb();

    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const userAttempts = db.attempts.filter((a) => a.userId === userId);

    // Calculate detailed analytics
    const subjectBreakdown = {};
    const dailyProgress = {};
    const timeAnalysis = { totalTime: 0, averageTime: 0 };

    userAttempts.forEach((attempt) => {
      const quiz = db.quizzes.find((q) => q.id === attempt.quizId);
      if (quiz) {
        // Subject breakdown
        if (!subjectBreakdown[quiz.subject]) {
          subjectBreakdown[quiz.subject] = { correct: 0, total: 0, timeSpent: 0 };
        }
        subjectBreakdown[quiz.subject].total += 1;
        subjectBreakdown[quiz.subject].timeSpent += attempt.timeSpentSeconds || 30;
        if (attempt.isCorrect) {
          subjectBreakdown[quiz.subject].correct += 1;
        }

        // Daily progress
        const date = attempt.submittedAt.split("T")[0];
        if (!dailyProgress[date]) {
          dailyProgress[date] = { xp: 0, questions: 0, correct: 0 };
        }
        dailyProgress[date].xp += attempt.xpEarned;
        dailyProgress[date].questions += 1;
        if (attempt.isCorrect) {
          dailyProgress[date].correct += 1;
        }

        // Time analysis
        timeAnalysis.totalTime += attempt.timeSpentSeconds || 30;
      }
    });

    timeAnalysis.averageTime = userAttempts.length > 0
      ? Math.round(timeAnalysis.totalTime / userAttempts.length)
      : 0;

    // Calculate insights
    const insights = {
      strengths: Object.entries(subjectBreakdown)
        .filter(([_, stats]) => stats.total >= 3 && (stats.correct / stats.total) >= 0.8)
        .map(([subject]) => subject),
      weaknesses: Object.entries(subjectBreakdown)
        .filter(([_, stats]) => stats.total >= 3 && (stats.correct / stats.total) < 0.6)
        .map(([subject]) => subject),
      bestPerformingDay: Object.entries(dailyProgress).length > 0 
        ? Object.entries(dailyProgress).reduce((a, b) => dailyProgress[a[0]].xp > dailyProgress[b[0]].xp ? a : b)[0]
        : null,
      studyPattern: timeAnalysis.averageTime < 30 ? "Fast Learner" :
                    timeAnalysis.averageTime < 60 ? "Methodical Learner" : "Deep Thinker"
    };

    res.json({
      user: {
        id: user.id,
        name: user.name,
        level: user.level,
        xp: user.xp,
        accuracy: user.accuracy,
        favoriteSubject: user.favoriteSubject,
        weakSubjects: user.weakSubjects
      },
      analytics: {
        totalQuestions: user.totalQuestionsAnswered,
        correctAnswers: user.correctAnswers,
        accuracy: user.accuracy,
        studyTimeMinutes: user.studyTimeMinutes,
        bestStreak: user.bestStreak,
        subjectBreakdown,
        dailyProgress,
        timeAnalysis,
        insights
      },
      goals: user.studyGoals,
      achievements: user.achievements || []
    });
  } catch (error) {
    next(error);
  }
});

export default router;
