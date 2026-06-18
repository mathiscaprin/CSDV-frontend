import { useEffect, useState } from 'react'
import Profile from './Profile.jsx'
import { fmt } from '../../utils/format.js'
import './Header.css'

const SAVE_COOLDOWN = 5

export default function Header({
  sups,
  supsPerSecond,
  rankName,
  username,
  onLogout,
  onSave,
  saveStatus,
  muted,
  onToggleMute,
  currentPage,
  onNavigate,
}) {
  const [showCheck, setShowCheck] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (!saveStatus || saveStatus.toLowerCase().includes('erreur')) return
    setShowCheck(true)
    const timer = setTimeout(() => setShowCheck(false), 2000)
    return () => clearTimeout(timer)
  }, [saveStatus])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  function handleSave() {
    if (cooldown > 0) return
    onSave()
    setCooldown(SAVE_COOLDOWN)
  }

  const disabled = cooldown > 0
  const isSuccessesPage = currentPage === 'successes'

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

      <div className="header-actions">
        <button
          className={`page-nav-btn${isSuccessesPage ? ' page-nav-btn--active' : ''}`}
          onClick={() => onNavigate?.(isSuccessesPage ? 'game' : 'successes')}
          aria-label={isSuccessesPage ? 'Retourner au jeu' : 'Voir les défis réalisés'}
          title={isSuccessesPage ? 'Jeu' : 'Succès'}
          type="button"
        >
          <span aria-hidden="true">{isSuccessesPage ? '🎓' : '🏆'}</span>
          <span>{isSuccessesPage ? 'Jeu' : 'Succès'}</span>
        </button>
        <button
          className="mute-btn"
          onClick={onToggleMute}
          aria-label={muted ? 'Activer les sons' : 'Couper les sons'}
          title={muted ? 'Activer les sons' : 'Couper les sons'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          className={`save-btn${disabled ? ' save-btn--disabled' : ''}`}
          onClick={handleSave}
          disabled={disabled}
          title={disabled ? `Disponible dans ${cooldown}s` : 'Sauvegarder'}
        >
          {disabled ? cooldown : '💾'}
        </button>
        {showCheck && <span className="save-check">✓</span>}
        <Profile username={username} rankName={rankName} onLogout={onLogout} />
      </div>
    </header>
  )
}
