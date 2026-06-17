import { useEffect } from "react";
import "./AchievementPopup.css";

export default function AchievementPopup({ items = [] }) {
  return (
    <div className="achievement-container" aria-live="polite">
      {items.map((it) => (
        <div key={it.id} className="achievement-card">
          <div className="achievement-icon">🏆</div>
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
