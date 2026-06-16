import { useEffect, useState } from 'react'
import { fmt } from '../../utils/format.js'

export default function UpgradeCard({ upgrade, cost, canAfford, onBuy }) {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (!flash) return
    const timeout = setTimeout(() => setFlash(false), 350)
    return () => clearTimeout(timeout)
  }, [flash])

  function handleClick() {
    if (!canAfford) return
    onBuy()
    setFlash(true)
  }

  const isCps = upgrade.cps > 0
  const base = isCps ? upgrade.cps : upgrade.cpc
  const unit = isCps ? 'sups/sec' : 'sups/clic'
  const total = upgrade.owned * base

  return (
    <div
      className={`upgrade-card${canAfford ? ' affordable' : ' cant-afford'}${flash ? ' bought-flash' : ''}`}
      onClick={handleClick}
    >
      <div className="upgrade-icon">{upgrade.icon}</div>
      <div className="upgrade-info">
        <div className="upgrade-name">{upgrade.name}</div>
        <div className="upgrade-stats">Total : +{fmt(total)} {unit}</div>
        <div className="upgrade-owned-count">Possédé : {upgrade.owned} · Base : +{fmt(base)} {unit}</div>
      </div>
      <div className="upgrade-right">
        <div className="upgrade-cost-val">{fmt(cost)}</div>
        <div className="upgrade-cost-unit">sups</div>
      </div>
    </div>
  )
}
