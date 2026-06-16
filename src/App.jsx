import { useEffect, useRef, useState } from 'react'
import Header from './components/Header/Header.jsx'
import Clicker from './components/Clicker/Clicker.jsx'
import ProgressBar from './components/ProgressBar/ProgressBar.jsx'
import UpgradesList from './components/Upgrades/UpgradesList.jsx'
import RankUpAnnouncement from './components/RankUpAnnouncement/RankUpAnnouncement.jsx'
import Confetti from './components/Confetti/Confetti.jsx'
import { useGameState } from './hooks/useGameState.js'
import { getCurrentRank, getNextRank, getProgress } from './utils/ranks.js'
import './App.css'

export default function App() {
  const { sups, totalSups, supsPerSecond, upgrades, click, buyUpgrade } = useGameState()

  const currentRank = getCurrentRank(totalSups)
  const nextRank = getNextRank(totalSups)
  const progress = getProgress(totalSups)

  const [rankUp, setRankUp] = useState(null)
  const previousRankName = useRef(null)

  useEffect(() => {
    if (previousRankName.current === null) {
      previousRankName.current = currentRank.name
      return
    }
    if (previousRankName.current === currentRank.name) return

    previousRankName.current = currentRank.name
    setRankUp(currentRank)
    document.body.classList.add('shake')

    const shakeTimer = setTimeout(() => document.body.classList.remove('shake'), 500)
    const announceTimer = setTimeout(() => setRankUp(null), 2200)
    return () => {
      clearTimeout(shakeTimer)
      clearTimeout(announceTimer)
    }
  }, [currentRank])

  return (
    <>
      <div className="plus-grid"></div>

      <RankUpAnnouncement rank={rankUp} />
      <Confetti burst={rankUp} />

      <Header sups={sups} supsPerSecond={supsPerSecond} rankName={currentRank.name} />

      <main>
        <Clicker onClick={click} />

        <ProgressBar currentRank={currentRank} nextRank={nextRank} progress={progress} />

        <UpgradesList upgrades={upgrades} sups={sups} onBuy={buyUpgrade} />
      </main>
    </>
  )
}
