import { fmt } from '../../utils/format.js'
import './ProgressBar.css'

export default function ProgressBar({ currentRank, nextRank, progress }) {
  return (
    <div className="progress-section">
      <div className="progress-header">
        <div className="current-rank">{currentRank.name}</div>
        <div className="next-rank-info">
          {nextRank
            ? `Prochain : ${nextRank.name} à ${fmt(nextRank.threshold)} sups`
            : '🏆 Rang maximum atteint !'}
        </div>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  )
}
