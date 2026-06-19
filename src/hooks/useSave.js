import { useEffect, useRef, useState } from 'react'
import { saveSession, saveUpgrades } from '../utils/api.js'

function countClickBoosters(upgrades) {
  return upgrades.reduce(
    (sum, u) => sum + (Number(u.ordreAffichage) === 0 ? Number(u.owned) : 0),
    0,
  )
}

export function useSave({ auth, upgrades, sups, totalSups, supsPerSecond, supsPerClick }) {
  const [saveStatus, setSaveStatus] = useState('')
  const [autoSaveMsg, setAutoSaveMsg] = useState(null)
  const [autoSaveKey, setAutoSaveKey] = useState(0)
  const autoSaveClearRef = useRef(null)

  const gameStateRef = useRef({ upgrades, sups, totalSups, supsPerSecond, supsPerClick })
  useEffect(() => {
    gameStateRef.current = { upgrades, sups, totalSups, supsPerSecond, supsPerClick }
  }, [upgrades, sups, totalSups, supsPerSecond, supsPerClick])

  useEffect(() => {
    if (!auth) return
    let mounted = true

    const saveAll = async () => {
      try {
        const { upgrades: ups, sups: s, totalSups: ts, supsPerSecond: sps } = gameStateRef.current
        await saveSession({
          totalSups: ts,
          supsPerSecond: sps,
          supsPerClick: countClickBoosters(ups),
          sups: s,
        })
        await saveUpgrades(ups)
        if (!mounted) return
        clearTimeout(autoSaveClearRef.current)
        setAutoSaveMsg('Sauvegarde automatique effectuée')
        setAutoSaveKey((k) => k + 1)
        autoSaveClearRef.current = setTimeout(() => setAutoSaveMsg(null), 3200)
      } catch {
        if (mounted) setSaveStatus('Erreur de sauvegarde')
      }
    }

    const interval = setInterval(saveAll, 2 * 60 * 1000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [auth])

  async function handleManualSave() {
    if (!auth) return
    try {
      const { upgrades: ups, sups: s, totalSups: ts, supsPerSecond: sps } = gameStateRef.current
      await saveSession({ totalSups: ts, supsPerSecond: sps, supsPerClick: countClickBoosters(ups), sups: s })
      await saveUpgrades(ups)
      setSaveStatus('Sauvegarde envoyée')
    } catch {
      setSaveStatus('Erreur de sauvegarde')
    }
  }

  return { saveStatus, autoSaveMsg, autoSaveKey, handleManualSave }
}
