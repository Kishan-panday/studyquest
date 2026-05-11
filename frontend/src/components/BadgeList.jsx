export default function BadgeList({ badges }) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Rewards</p>
          <h2>Unlocked Badges</h2>
        </div>
      </div>

      <div className="badges">
        {badges.length === 0 ? (
          <p>No badges unlocked yet.</p>
        ) : (
          badges.map((badge) => (
            <div className="badge" key={badge}>
              <span>🏅</span>
              <p>{badge}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
