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
import { createSession, getSession, saveSession, saveUpgrades, getUpgrade, getUpgradesBySession } from './utils/api.js'
import { INITIAL_UPGRADES } from './data/upgrades.js'
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

function mapSessionData(session = {}, baseBatiments = [], userBatiments = []) {
  console.log(Array.isArray(baseBatiments))
  const baseList = Array.isArray(baseBatiments) && baseBatiments.length ? baseBatiments : INITIAL_UPGRADES

  const savedUpgrades = Array.isArray(userBatiments) ? userBatiments : []
  
  // Filtre les améliorations utilisateur : ne garder que celles qui existent dans la base
  const validUpgrades = savedUpgrades.filter((saved) =>
    baseList.some((b) => String(b.id) === String(saved.batimentId))
  )
  
  const upgrades = baseList.map((batiment) => {
    const saved = validUpgrades.find((b) => String(b.batimentId) === String(batiment.id))
    return {
      ...batiment,
      name: batiment.name ?? batiment.nom,
      desc: batiment.desc ?? batiment.description,
      baseCost: batiment.baseCost ?? batiment.coutBase,
      cps: batiment.cps ?? batiment.multiplicateurCps ?? 0,
      cpc: batiment.cpc ?? (Number(batiment.ordreAffichage) === 0 ? 1 : 0),
      ordreAffichage: batiment.ordreAffichage,
      owned: Number(saved?.quantite) || 0,
    }
  })

  const clickBoosterCount = upgrades.reduce(
    (sum, upgrade) => sum + (Number(upgrade.ordreAffichage) === 0 ? Number(upgrade.owned) : 0),
    0,
  )

  const actualSupsPerClick = upgrades.reduce((sum, upgrade) => {
    const owned = Number(upgrade.owned) || 0
    return sum + (Number(upgrade.ordreAffichage) === 0 ? owned : owned * (upgrade.cpc ?? 0))
  }, 1)

  return {
    sups: Number(session.supsMonney) || 0,
    totalSups: Number(session.supsTotal) || 0,
    supsPerClick: actualSupsPerClick,
    supsPerClickCount: clickBoosterCount,
    supsPerSecond: Number(session.supsPerSecond) || 0,
    upgrades,
    filteredUserUpgrades: validUpgrades, // retourner les améliorations filtrées
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

  const totalSupsRef = useRef(totalSups)
  const supsPerSecondRef = useRef(supsPerSecond)
  const supsPerClickRef = useRef(supsPerClick)
  const supsRef = useRef(sups)
  const upgradesRef = useRef(upgrades)

  useEffect(() => {
    totalSupsRef.current = totalSups
  }, [totalSups])

  useEffect(() => {
    supsPerSecondRef.current = supsPerSecond
  }, [supsPerSecond])

  useEffect(() => {
    supsPerClickRef.current = supsPerClick
  }, [supsPerClick])

  useEffect(() => {
    supsRef.current = sups
  }, [sups])

  useEffect(() => {
    upgradesRef.current = upgrades
  }, [upgrades])

  async function loadSession(token) {
    setLoadingSession(true)
    setSessionError(null)

    const response = await getSession(token)
    if (response.ok) {
      // fetch base batiments and user saved batiments
      try {
        const [baseResp, sessionBatimentsResp] = await Promise.all([
          getUpgrade(),
          getUpgradesBySession(token),
        ])
                if (baseResp.ok) {
          const sessionData = mapSessionData(
            response.data,
            baseResp.data,
            sessionBatimentsResp.ok ? sessionBatimentsResp.data : [], 
          )                  // Nettoie les améliorations obsolètes en sauvegardant les améliorations filtrées
          if (sessionBatimentsResp.ok && sessionData.filteredUserUpgrades) {
            const obsoleteItems = (sessionBatimentsResp.data || []).filter(
              (saved) => !baseResp.data.some((b) => String(b.id) === String(saved.batimentId))
            )
            
            if (obsoleteItems.length > 0) {
              // Des améliorations ont été supprimées, sauvegarde la liste filtrée
              await saveUpgrades(sessionData.upgrades, token)
            }
          }
          
          setSessionState(sessionData)
        } else {
          setSessionState(mapSessionData(response.data))
        }
      } catch {
        setSessionState(mapSessionData(response.data))
      }
      setLoadingSession(false)
      return
    }

    if (response.status === 404) {
      const createResponse = await createSession(token)
      if (!createResponse.ok && createResponse.status !== 201) {
        setSessionError('Impossible de créer la session de jeu.')
        setLoadingSession(false)
        return
      }
      const retry = await getSession(token)
      if (retry.ok) {
        try {
          const [baseResp, sessionBatimentsResp] = await Promise.all([
            getUpgrade(),
            getUpgradesBySession(token),
          ])

          if (baseResp.ok) {
            const sessionData = mapSessionData(
              retry.data,
              baseResp.data,
              sessionBatimentsResp.ok ? sessionBatimentsResp.data : [],
            )
            
            // Nettoie les améliorations obsolètes en sauvegardant les améliorations filtrées
            if (sessionBatimentsResp.ok && sessionData.filteredUserUpgrades) {
              const obsoleteItems = (sessionBatimentsResp.data || []).filter(
                (saved) => !baseResp.data.some((b) => String(b.id) === String(saved.batimentId))
              )
              
              if (obsoleteItems.length > 0) {
                // Des améliorations ont été supprimées, sauvegarde la liste filtrée
                await saveUpgrades(sessionData.upgrades, token)
              }
            }
            
            setSessionState(sessionData)
          } else {
            setSessionState(mapSessionData(retry.data))
          }
        } catch {
          setSessionState(mapSessionData(retry.data))
        }
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
    loadSession(auth.token)
  }, [auth])

  useEffect(() => {
    if (!auth?.token) return

    let mounted = true

    const saveAll = async () => {
      try {
        const clickBoosterCount = upgradesRef.current.reduce(
          (sum, upgrade) => sum + (Number(upgrade.ordreAffichage) === 0 ? Number(upgrade.owned) : 0),
          0,
        )
        await saveSession({ totalSups: totalSupsRef.current, supsPerSecond: supsPerSecondRef.current, supsPerClick: clickBoosterCount, sups: supsRef.current }, auth.token)
        await saveUpgrades(upgradesRef.current, auth.token)
        if (mounted) setSaveStatus('Sauvegardé automatiquement')
      } catch {
        if (mounted) setSaveStatus('Erreur de sauvegarde')
      }
    }

    const interval = setInterval(saveAll, 5 * 60 * 1000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [auth?.token])

  async function handleLogin(newAuth) {
    setAuth(newAuth)
    setSessionState(null)
    setSaveStatus('')
  }

  async function handleManualSave() {
    if (!auth) return
    try {
      const clickBoosterCount = upgrades.reduce(
        (sum, upgrade) => sum + (Number(upgrade.ordreAffichage) === 0 ? Number(upgrade.owned) : 0),
        0,
      )
      await saveSession({ totalSups, supsPerSecond, supsPerClick: clickBoosterCount, sups }, auth.token)
      await saveUpgrades(upgrades, auth.token)
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
