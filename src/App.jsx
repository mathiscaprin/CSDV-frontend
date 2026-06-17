import { useEffect, useRef, useState } from 'react'
import Header from './components/Header/Header.jsx'
import Clicker from './components/Clicker/Clicker.jsx'
import ProgressBar from './components/ProgressBar/ProgressBar.jsx'
import UpgradesList from './components/Upgrades/UpgradesList.jsx'
import RankUpAnnouncement from './components/RankUpAnnouncement/RankUpAnnouncement.jsx'
import Confetti from './components/Confetti/Confetti.jsx'
import LoginPage from './components/Auth/LoginPage.jsx'
import Leaderboard from './components/Leaderboard/Leaderboard.jsx'
import { useGameState } from './hooks/useGameState.js'
import { getCurrentRank, getNextRank, getProgress } from './utils/ranks.js'
import { createSession, getSession, saveSession, signOut } from './utils/api.js'
import './App.css'

const USER_STORAGE_KEY = 'clicker-sdv-user'

function loadStoredUser() {
  try {
    const raw = sessionStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveUser(user) {
  if (user) {
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } else {
    sessionStorage.removeItem(USER_STORAGE_KEY)
  }
}

function mapSessionData(session = {}) {
  return {
    sups: Number(session.supsTotal) || 0,
    totalSups: Number(session.supsTotal) || 0,
    supsPerClick: Number(session.supsPerClick) || 1,
    supsPerSecond: Number(session.supsPerSecond) || 0,
  }
}

export default function App() {
  const [auth, setAuth] = useState(loadStoredUser)
  const [sessionState, setSessionState] = useState(null)
  const [loadingSession, setLoadingSession] = useState(false)
  const [sessionError, setSessionError] = useState(null)
  const [saveStatus, setSaveStatus] = useState('')

  const { sups, totalSups, supsPerClick, supsPerSecond, upgrades, click, buyUpgrade } = useGameState(sessionState || {})

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

  useEffect(() => {
    saveUser(auth)
  }, [auth])

  async function loadSession() {
    setLoadingSession(true)
    setSessionError(null)

    const response = await getSession()
    if (response.ok) {
      setSessionState(mapSessionData(response.data))
      setLoadingSession(false)
      return
    }

    if (response.status === 404) {
      const createResponse = await createSession()
      if (!createResponse.ok && createResponse.status !== 201) {
        setSessionError('Impossible de créer la session de jeu.')
        setLoadingSession(false)
        return
      }
      const retry = await getSession()
      if (retry.ok) {
        setSessionState(mapSessionData(retry.data))
      } else {
        setSessionState({ sups: 0, totalSups: 0, supsPerClick: 1, supsPerSecond: 0 })
      }
      setLoadingSession(false)
      return
    }

    if (response.status === 401) {
      setSessionError('Votre session a expiré. Merci de vous reconnecter.')
      setAuth(null)
      saveUser(null)
      setLoadingSession(false)
      return
    }

    setSessionError('Impossible de charger la session de jeu.')
    setLoadingSession(false)
  }

  useEffect(() => {
    if (!auth) return
    loadSession()
  }, [auth])

  useEffect(() => {
    if (!auth) return
    const timeout = setTimeout(async () => {
      try {
        await saveSession({ totalSups, supsPerSecond, supsPerClick })
        setSaveStatus('Sauvegardé automatiquement')
      } catch {
        setSaveStatus('Erreur de sauvegarde')
      }
    }, 2500)

    return () => clearTimeout(timeout)
  }, [auth, totalSups, supsPerSecond, supsPerClick])

  async function handleLogin(newAuth) {
    setAuth(newAuth)
    setSessionState(null)
    setSaveStatus('')
  }

  async function handleManualSave() {
    if (!auth) return
    try {
      await saveSession({ totalSups, supsPerSecond, supsPerClick })
      setSaveStatus('Sauvegarde envoyée')
    } catch {
      setSaveStatus('Erreur de sauvegarde')
    }
  }

  async function handleLogout() {
    await signOut()
    setAuth(null)
    setSessionState(null)
    setSaveStatus('')
    saveUser(null)
  }

  if (!auth) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (loadingSession) {
    return <div className="loading-screen">Connexion au backend...</div>
  }

  return (
    <>
      <div className="plus-grid"></div>

      <RankUpAnnouncement rank={rankUp} />
      <Confetti burst={rankUp} />

      <Header
        sups={sups}
        supsPerSecond={supsPerSecond}
        rankName={currentRank.name}
        username={auth.username}
        onLogout={handleLogout}
        onSave={handleManualSave}
        saveStatus={saveStatus}
      />

      <main>
        {sessionError ? <div className="session-error">{sessionError}</div> : null}

        <Clicker onClick={click} />

        <ProgressBar currentRank={currentRank} nextRank={nextRank} progress={progress} />

        <UpgradesList upgrades={upgrades} sups={sups} onBuy={buyUpgrade} />
      </main>

      <Leaderboard />
    </>
  )
}
