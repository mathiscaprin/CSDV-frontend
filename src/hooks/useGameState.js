import { useEffect, useRef, useState } from 'react'
import { INITIAL_UPGRADES, getUpgradeCost } from '../data/upgrades.js'

export function useGameState(initialState = {}) {
  const {
    sups: initialSups = 0,
    totalSups: initialTotalSups = 0,
    supsPerClick: initialSupsPerClick = 1,
    supsPerSecond: initialSupsPerSecond = 0,
    upgrades: initialUpgrades = INITIAL_UPGRADES,
  } = initialState

  const [sups, setSups] = useState(initialSups)
  const [totalSups, setTotalSups] = useState(initialTotalSups)
  const [supsPerClick, setSupsPerClick] = useState(initialSupsPerClick)
  const [supsPerSecond, setSupsPerSecond] = useState(initialSupsPerSecond)
  const [upgrades, setUpgrades] = useState(initialUpgrades)
  const supsPerSecondRef = useRef(supsPerSecond)
  supsPerSecondRef.current = supsPerSecond

  useEffect(() => {
    setSups(initialSups)
    setTotalSups(initialTotalSups)
    setSupsPerClick(initialSupsPerClick)
    setSupsPerSecond(initialSupsPerSecond)
    setUpgrades(initialUpgrades)
  }, [initialSups, initialTotalSups, initialSupsPerClick, initialSupsPerSecond, initialUpgrades])

  useEffect(() => {
    const interval = setInterval(() => {
      const cps = supsPerSecondRef.current
      if (cps > 0) {
        const tick = cps / 20
        setSups((s) => s + tick)
        setTotalSups((t) => t + tick)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [])

  function click() {
    setSups((s) => s + supsPerClick)
    setTotalSups((t) => t + supsPerClick)
    return supsPerClick
  }

  function buyUpgrade(id) {
    setUpgrades((prev) => {
      const upgrade = prev.find((u) => u.id === id)
      const cost = getUpgradeCost(upgrade)
      if (sups < cost) return prev
      setSups((s) => s - cost)
      const isClickBooster = Number(upgrade.ordreAffichage) === 0
      setSupsPerClick((c) => c + (isClickBooster ? 1 : (upgrade.cpc ?? 0)))
      setSupsPerSecond((c) => c + (isClickBooster ? 0 : (upgrade.cps ?? 0)))
      return prev.map((u) => (u.id === id ? { ...u, owned: u.owned + 1 } : u))
    })
  }

  return { sups, totalSups, supsPerClick, supsPerSecond, upgrades, click, buyUpgrade }
}
