import { useEffect, useState } from 'react'
import { fmt, fmtStat } from '../../utils/format.js'

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

  const name = upgrade.nom ?? upgrade.name
  const description = upgrade.description ?? upgrade.desc
  const cps = upgrade.multiplicateurCps ?? upgrade.cps ?? 0
  const cpc = upgrade.cpc ?? 0
  const isCps = cps > 0
  const base = isCps ? cps : cpc
  const unit = isCps ? 'sups/sec' : 'sups/clic'
  const owned = Number(upgrade.owned) || 0
  const total = owned * base

  return (
    <div
      className={`upgrade-card${canAfford ? ' affordable' : ' cant-afford'}${flash ? ' bought-flash' : ''}`}
      onClick={handleClick}
    >
      <div className="upgrade-icon">{upgrade.icon}</div>
      <div className="upgrade-info">
        <div className="upgrade-name">{name}</div>
        {description ? <div className="upgrade-desc">{description}</div> : null}
        <div className="upgrade-stats">Total : +{fmtStat(total)} {unit}</div>
        <div className="upgrade-owned-count">Possédé : {owned} · Base : +{fmtStat(base)} {unit}</div>
      </div>
      <div className="upgrade-right">
        <div className="upgrade-cost-val">{fmt(cost)}</div>
        <div className="upgrade-cost-unit">sups</div>
      </div>
    </div>
  )
}
