import Header from './components/Header/Header.jsx'
import Clicker from './components/Clicker/Clicker.jsx'
import ProgressBar from './components/ProgressBar/ProgressBar.jsx'
import UpgradesList from './components/Upgrades/UpgradesList.jsx'
import { useGameState } from './hooks/useGameState.js'
import { getCurrentRank, getNextRank, getProgress } from './utils/ranks.js'
import './App.css'

export default function App() {
  const { sups, totalSups, supsPerSecond, upgrades, click, buyUpgrade } = useGameState()

  const currentRank = getCurrentRank(totalSups)
  const nextRank = getNextRank(totalSups)
  const progress = getProgress(totalSups)

  return (
    <>
      <div className="plus-grid"></div>

      <Header sups={sups} supsPerSecond={supsPerSecond} rankName={currentRank.name} />

      <main>
        <Clicker onClick={click} />

        <ProgressBar currentRank={currentRank} nextRank={nextRank} progress={progress} />

        <UpgradesList upgrades={upgrades} sups={sups} onBuy={buyUpgrade} />
      </main>
    </>
  )
}
