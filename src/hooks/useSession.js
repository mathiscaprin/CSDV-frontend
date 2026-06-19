import { useEffect, useState } from 'react'
import {
  createSession,
  getSession,
  getUpgrade,
  getUpgradesBySession,
  saveUpgrades,
} from '../utils/api.js'
import { mapSessionData } from '../utils/session.js'

async function fetchAndMapSession(sessionData, token) {
  const [baseResp, batimentsResp] = await Promise.all([
    getUpgrade(),
    getUpgradesBySession(token),
  ])

  if (!baseResp.ok) return mapSessionData(sessionData)

  const mapped = mapSessionData(
    sessionData,
    baseResp.data,
    batimentsResp.ok ? batimentsResp.data : [],
  )

  if (batimentsResp.ok) {
    const hasObsolete = (batimentsResp.data || []).some(
      (saved) => !baseResp.data.some((b) => String(b.id) === String(saved.batimentId)),
    )
    if (hasObsolete) await saveUpgrades(mapped.upgrades, token)
  }

  return mapped
}

export function useSession(auth, { onExpired } = {}) {
  const [sessionState, setSessionState] = useState(null)
  const [loadingSession, setLoadingSession] = useState(false)
  const [sessionError, setSessionError] = useState(null)

  useEffect(() => {
    if (!auth) {
      setSessionState(null)
      setSessionError(null)
      return
    }

    let cancelled = false

    async function loadSession() {
      setLoadingSession(true)
      setSessionError(null)

      const response = await getSession(auth.token)

      if (response.ok) {
        try {
          const data = await fetchAndMapSession(response.data, auth.token)
          if (!cancelled) setSessionState(data)
        } catch {
          if (!cancelled) setSessionState(mapSessionData(response.data))
        }
        if (!cancelled) setLoadingSession(false)
        return
      }

      if (response.status === 404) {
        const create = await createSession(auth.token)
        if (!create.ok && create.status !== 201) {
          if (!cancelled) {
            setSessionError('Impossible de créer la session de jeu.')
            setLoadingSession(false)
          }
          return
        }
        const retry = await getSession(auth.token)
        if (retry.ok) {
          try {
            const data = await fetchAndMapSession(retry.data, auth.token)
            if (!cancelled) setSessionState(data)
          } catch {
            if (!cancelled) setSessionState(mapSessionData(retry.data))
          }
        } else if (!cancelled) {
          setSessionState({ sups: 0, totalSups: 0, supsPerClick: 1, supsPerSecond: 0 })
        }
        if (!cancelled) setLoadingSession(false)
        return
      }

      if (response.status === 401) {
        if (!cancelled) {
          setSessionError('Votre session a expiré. Merci de vous reconnecter.')
          setLoadingSession(false)
          onExpired?.()
        }
        return
      }

      if (!cancelled) {
        setSessionError('Impossible de charger la session de jeu.')
        setLoadingSession(false)
      }
    }

    loadSession()
    return () => { cancelled = true }
  }, [auth])

  return { sessionState, loadingSession, sessionError }
}
