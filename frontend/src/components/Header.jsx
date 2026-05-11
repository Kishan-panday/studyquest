export default function Header({ student, onViewProfile, onLogout }) {
  return (
    <header className="header">
      <div>
        <p className="eyebrow">Gamified Learning Platform</p>
        <h1>StudyQuest</h1>
        <p className="subtitle">
          Learn, complete quizzes, earn XP, unlock badges, and climb the leaderboard.
        </p>
      </div>

      <div className="profile-card">
        <h3>{student.name}</h3>
        <p>{student.college}</p>
        <div className="stats-grid">
          <div>
            <span>XP</span>
            <strong>{student.xp}</strong>
          </div>
          <div>
            <span>Level</span>
            <strong>{student.level}</strong>
          </div>
          <div>
            <span>Streak</span>
            <strong>{student.streak} 🔥</strong>
          </div>
          <div>
            <span>Badges</span>
            <strong>{student.badges.length}</strong>
          </div>
        </div>
        <div className="profile-actions">
          <button type="button" className="secondary-btn" onClick={onViewProfile}>
            View Profile
          </button>
          <button type="button" className="secondary-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
