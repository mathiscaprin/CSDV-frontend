import { useEffect, useRef, useState } from 'react'
import { INITIAL_UPGRADES, getUpgradeCost } from '../data/upgrades.js'

export function useGameState() {
  const [sups, setSups] = useState(0)
  const [totalSups, setTotalSups] = useState(0)
  const [supsPerClick, setSupsPerClick] = useState(1)
  const [supsPerSecond, setSupsPerSecond] = useState(0)
  const [upgrades, setUpgrades] = useState(INITIAL_UPGRADES)
  const supsPerSecondRef = useRef(supsPerSecond)
  supsPerSecondRef.current = supsPerSecond

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
      setSupsPerClick((c) => c + upgrade.cpc)
      setSupsPerSecond((c) => c + upgrade.cps)
      return prev.map((u) => (u.id === id ? { ...u, owned: u.owned + 1 } : u))
    })
  }

  return { sups, totalSups, supsPerClick, supsPerSecond, upgrades, click, buyUpgrade }
}
