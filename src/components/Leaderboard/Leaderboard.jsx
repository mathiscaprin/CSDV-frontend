import { useEffect, useState } from 'react'
import { getLeaderboard } from '../../utils/api.js'
import { fmt } from '../../utils/format.js'
import './Leaderboard.css'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

    // Rafraîchir toutes les 10 secondes
    const interval = setInterval(fetchLeaderboard, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="leaderboard loading">Chargement...</div>
  if (error) return <div className="leaderboard error">{error}</div>
  if (!leaderboard) return null

  const monRang = leaderboard.monRang
  const inTop10 = leaderboard.top10.some((p) => p.username === monRang?.username)

  return (
    <div className="leaderboard">
      <h3>Classement</h3>
      <ul className="leaderboard-list">
        {leaderboard.top10.map((player) => (
          <li
            key={`${player.rang}-${player.username}`}
            className={`leaderboard-item${monRang?.username === player.username ? ' leaderboard-item--me' : ''}`}
          >
            <span className="rank">#{player.rang}</span>
            <span className="username">{player.username}</span>
            <span className="score">{fmt(player.supsTotal)} SUPS</span>
          </li>
        ))}
        {monRang && !inTop10 && (
          <>
            <li className="leaderboard-separator">• • •</li>
            <li className="leaderboard-item leaderboard-item--me">
              <span className="rank">#{monRang.rang}</span>
              <span className="username">{monRang.username}</span>
              <span className="score">{fmt(monRang.supsTotal)} SUPS</span>
            </li>
          </>
        )}
      </ul>
    </div>
  )
}
