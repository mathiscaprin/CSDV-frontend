import "./AchievementPopup.css";

export default function AchievementPopup({ items = [] }) {
  return (
    <div className="achievement-container" role="status" aria-live="polite">
      {items.map((it) => (
        <div key={it.popupId ?? it.id} className="achievement-card">
          <div className="achievement-icon" aria-hidden="true">
            🏆
          </div>
          <div className="achievement-body">
            <div className="achievement-title">{it.name}</div>
            {it.description ? (
              <div className="achievement-desc">{it.description}</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
