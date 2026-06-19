import { useState } from 'react'
import Header from './components/Header/Header.jsx'
import Clicker from './components/Clicker/Clicker.jsx'
import ProgressBar from './components/ProgressBar/ProgressBar.jsx'
import UpgradesList from './components/Upgrades/UpgradesList.jsx'
import RankUpAnnouncement from './components/RankUpAnnouncement/RankUpAnnouncement.jsx'
import Confetti from './components/Confetti/Confetti.jsx'
import LoginPage from './components/Auth/LoginPage.jsx'
import Leaderboard from './components/Leaderboard/Leaderboard.jsx'
import AchievementPopup from './components/Achievements/AchievementPopup.jsx'
import SuccessesPage from './components/Successes/SuccessesPage.jsx'
import Toast from './components/Toast/Toast.jsx'
import { useAuth } from './hooks/useAuth.js'
import { useSession } from './hooks/useSession.js'
import { useGameState } from './hooks/useGameState.js'
import { useSave } from './hooks/useSave.js'
import { useRankUp } from './hooks/useRankUp.js'
import { useBackspaceNav } from './hooks/useBackspaceNav.js'
import { useMute } from './hooks/useMute.js'
import { useSuccesses } from './hooks/useSuccesses.js'
import { useKeyboardSpeech } from './hooks/useKeyboardSpeech.js'
import { getCurrentRank, getNextRank, getProgress } from './utils/ranks.js'
import './App.css'

export default function App() {
  const { auth, handleLogin, handleLogout } = useAuth()
  const { sessionState, loadingSession, sessionError } = useSession(auth, { onExpired: handleLogout })
  const { sups, totalSups, supsPerClick, supsPerSecond, upgrades, click, buyUpgrade } = useGameState(sessionState || {})
  const { saveStatus, autoSaveMsg, autoSaveKey, handleManualSave } = useSave({ auth, upgrades, sups, totalSups, supsPerSecond, supsPerClick })
  const { muted, toggleMute } = useMute()
  const [currentPage, setCurrentPage] = useState('game')

  useKeyboardSpeech(muted)
  useBackspaceNav()

  const currentRank = getCurrentRank(totalSups)
  const nextRank = getNextRank(totalSups)
  const progress = getProgress(totalSups)
  const { rankUp } = useRankUp(currentRank)

  const gameMetrics = {
    totalSups,
    sups,
    supsPerClick,
    supsPerSecond,
    clickCount: 0,
    upgradesOwned: upgrades.reduce((acc, u) => acc + (Number(u.owned) || 0), 0),
    buildingQuantities: upgrades.reduce((acc, u) => {
      acc[String(u.id)] = Number(u.owned) || 0
      return acc
    }, {}),
  }

  const { popups } = useSuccesses(gameMetrics, {
    enabled: Boolean(auth && sessionState),
    token: auth?.token,
    resetKey: auth?.userId ?? auth?.id ?? auth?._id ?? auth?.email ?? auth?.username ?? 'guest',
  })

  if (!auth) return <LoginPage onLogin={handleLogin} />
  if (loadingSession) return <div className="loading-screen">Connexion au backend...</div>

  return (
    <>
      <div className="plus-grid"></div>
      <RankUpAnnouncement rank={rankUp} />
      <Confetti burst={rankUp} />
      <Toast key={autoSaveKey} message={autoSaveMsg} />

      <Header
        sups={sups}
        supsPerSecond={supsPerSecond}
        rankName={currentRank.name}
        username={auth.username}
        onLogout={handleLogout}
        onSave={handleManualSave}
        saveStatus={saveStatus}
        muted={muted}
        onToggleMute={toggleMute}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <main className={currentPage === 'successes' ? 'successes-main' : undefined}>
        {sessionError ? <div className="session-error">{sessionError}</div> : null}

        {currentPage === 'successes' ? (
          <SuccessesPage token={auth?.token} />
        ) : (
          <>
            <Clicker onClick={click} muted={muted} />
            <ProgressBar currentRank={currentRank} nextRank={nextRank} progress={progress} />
            <UpgradesList upgrades={upgrades} sups={sups} onBuy={buyUpgrade} />
          </>
        )}
      </main>

      <AchievementPopup items={popups} />
      <Leaderboard />
    </>
  )
}
