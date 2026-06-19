import { INITIAL_UPGRADES } from '../data/upgrades.js'

const AUTH_STORAGE_KEY = 'clicker-sdv-user'

export function loadStoredAuth() {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveStoredAuth(user) {
  if (user) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  } else {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

export function mapSessionData(session = {}, baseBatiments = [], userBatiments = []) {
  const baseList =
    Array.isArray(baseBatiments) && baseBatiments.length ? baseBatiments : INITIAL_UPGRADES

  const savedUpgrades = Array.isArray(userBatiments) ? userBatiments : []
  const validUpgrades = savedUpgrades.filter((saved) =>
    baseList.some((b) => String(b.id) === String(saved.batimentId)),
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
    (sum, u) => sum + (Number(u.ordreAffichage) === 0 ? Number(u.owned) : 0),
    0,
  )

  const actualSupsPerClick = upgrades.reduce((sum, u) => {
    const owned = Number(u.owned) || 0
    return sum + (Number(u.ordreAffichage) === 0 ? owned : owned * (u.cpc ?? 0))
  }, 1)

  return {
    sups: Number(session.supsMonney) || 0,
    totalSups: Number(session.supsTotal) || 0,
    supsPerClick: actualSupsPerClick,
    supsPerClickCount: clickBoosterCount,
    supsPerSecond: Number(session.supsPerSecond) || 0,
    upgrades,
    filteredUserUpgrades: validUpgrades,
  }
}
