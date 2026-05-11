import { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000/api";

export default function ProfilePage({ student, onBack, onLogout }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [student.id]);

  async function loadAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/${student.id}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="container">
        <div className="loading-screen">Loading your profile...</div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="profile-page">
        <div className="card-header">
          <div>
            <p className="eyebrow">Your Profile</p>
            <h2>{student.name}</h2>
          </div>
        </div>

        <div className="profile-details">
          <div className="stats-grid">
            <div>
              <span>Level</span>
              <strong>{student.level}</strong>
            </div>
            <div>
              <span>XP Points</span>
              <strong>{student.xp}</strong>
            </div>
            <div>
              <span>Current Streak</span>
              <strong>{student.streak} days</strong>
            </div>
            <div>
              <span>Accuracy</span>
              <strong>{student.accuracy || 0}%</strong>
            </div>
            <div>
              <span>Study Time</span>
              <strong>{student.studyTimeMinutes || 0} min</strong>
            </div>
            <div>
              <span>Best Streak</span>
              <strong>{student.bestStreak || 0} days</strong>
            </div>
          </div>

          {analytics && (
            <>
              <h3>📊 Learning Analytics</h3>
              <div className="stats-grid">
                <div>
                  <span>Total Questions</span>
                  <strong>{analytics.analytics.totalQuestions}</strong>
                </div>
                <div>
                  <span>Correct Answers</span>
                  <strong>{analytics.analytics.correctAnswers}</strong>
                </div>
                <div>
                  <span>Favorite Subject</span>
                  <strong>{analytics.analytics.favoriteSubject || "None"}</strong>
                </div>
                <div>
                  <span>Study Pattern</span>
                  <strong>{analytics.analytics.insights.studyPattern}</strong>
                </div>
              </div>

              {analytics.analytics.insights.strengths.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <h4>💪 Your Strengths</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {analytics.analytics.insights.strengths.map((subject) => (
                      <span key={subject} className="pill" style={{ background: "var(--success-gradient)" }}>
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analytics.analytics.insights.weaknesses.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <h4>🎯 Areas to Improve</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {analytics.analytics.insights.weaknesses.map((subject) => (
                      <span key={subject} className="pill" style={{ background: "var(--warning-gradient)" }}>
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <h3>🏆 Achievements</h3>
              <div className="badges">
                {analytics.achievements.map((achievement) => (
                  <div key={achievement} className="badge">
                    <span>🏅</span>
                    <p>{achievement}</p>
                  </div>
                ))}
                {analytics.achievements.length === 0 && (
                  <p style={{ textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
                    Complete more quizzes to unlock achievements!
                  </p>
                )}
              </div>

              <h3>🎯 Study Goals</h3>
              <div className="stats-grid">
                <div>
                  <span>Daily Quiz Target</span>
                  <strong>{analytics.goals.dailyQuizTarget}</strong>
                </div>
                <div>
                  <span>Weekly XP Target</span>
                  <strong>{analytics.goals.weeklyXpTarget}</strong>
                </div>
                <div>
                  <span>This Week XP</span>
                  <strong>{analytics.goals.currentWeekXp}</strong>
                </div>
                <div>
                  <span>Progress</span>
                  <strong>
                    {Math.round((analytics.goals.currentWeekXp / analytics.goals.weeklyXpTarget) * 100)}%
                  </strong>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="profile-page-actions">
          <button className="secondary-btn" onClick={onBack}>
            Back to Dashboard
          </button>
          <button className="secondary-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
