import Profile from './Profile.jsx'
import { fmt } from '../../utils/format.js'
import './Header.css'

export default function Header({ sups, supsPerSecond, rankName, username, onLogout, onSave, saveStatus }) {
  return (
    <header className="header">
      <div className="header-brand">
        🎓 <span>Sup²Vinci</span>&nbsp;Clicker
      </div>

      <div className="score-block">
        <div className="score-label">Vos Sups</div>
        <div className="score-row">
          <div className="score-value">{fmt(sups)} 🎓</div>
          <div className="score-cps">+{fmt(supsPerSecond)} sups/sec</div>
        </div>
      </div>

      <Profile username={username} rankName={rankName} onLogout={onLogout} onSave={onSave} saveStatus={saveStatus} />
    </header>
  )
}
