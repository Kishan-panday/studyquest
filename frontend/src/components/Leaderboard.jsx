export default function Leaderboard({ data, currentUserId }) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Top Learners</p>
          <h2>Leaderboard</h2>
        </div>
      </div>

      <div className="leaderboard-list">
        {data.map((student, index) => (
          <div
            className={`leaderboard-item ${student.id === currentUserId ? "highlight" : ""}`}
            key={student.id}
          >
            <div className="leader-left">
              <span className="rank">#{index + 1}</span>
              <div className="leader-details">
                <strong>{student.name}</strong>
                <p>{student.college}</p>
                <span className="level-pill">Level {student.level}</span>
              </div>
            </div>
            <div className="leader-right">
              <span>{student.xp} XP</span>
              <small>{student.badges?.length ?? 0} badges</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
