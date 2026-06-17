import { useEffect, useState } from 'react'
import { getLeaderboard } from '../../utils/api.js'
import { fmt } from '../../utils/format.js'
import './Leaderboard.css'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function fetchLeaderboard() {
      const response = await getLeaderboard()
      if (response.ok) {
        setLeaderboard(response.data)
      } else {
        setError('Erreur lors du chargement du classement')
      }
      setLoading(false)
    }

    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="leaderboard loading">Chargement...</div>
  if (error) return <div className="leaderboard error">{error}</div>
  if (!leaderboard) return null

  const monRang = leaderboard.monRang
  const inTop10 = leaderboard.top10.some((p) => p.username === monRang?.username)

  return (
    <div className={`leaderboard${isOpen ? ' leaderboard--open' : ''}`}>
      <button
        className="leaderboard-toggle"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Fermer le classement' : 'Ouvrir le classement'}
        tabIndex={0}
      >
        <span>Classement</span>
        <span className="leaderboard-arrow" aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
      </button>

      <div className="leaderboard-body">
        <ul className="leaderboard-list">
          {leaderboard.top10.map((player) => {
            const isMe = monRang?.username === player.username
            const label = `Position ${player.rang} : ${player.username}, ${fmt(player.supsTotal)} sups${isMe ? ', c\'est vous' : ''}`
            return (
              <li
                key={`${player.rang}-${player.username}`}
                className={`leaderboard-item${isMe ? ' leaderboard-item--me' : ''}`}
                tabIndex={0}
                aria-label={label}
              >
                <span className="rank">#{player.rang}</span>
                <span className="username">{player.username}</span>
                <span className="score">{fmt(player.supsTotal)} SUPS</span>
              </li>
            )
          })}
          {monRang && !inTop10 && (
            <>
              <li className="leaderboard-separator" aria-hidden="true">• • •</li>
              <li
                className="leaderboard-item leaderboard-item--me"
                tabIndex={0}
                aria-label={`Votre position : ${monRang.rang}, ${monRang.username}, ${fmt(monRang.supsTotal)} sups`}
              >
                <span className="rank">#{monRang.rang}</span>
                <span className="username">{monRang.username}</span>
                <span className="score">{fmt(monRang.supsTotal)} SUPS</span>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}
