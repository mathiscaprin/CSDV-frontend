import { getUpgradeCost } from '../../data/upgrades.js'
import UpgradeCard from './UpgradeCard.jsx'
import './Upgrades.css'

export default function UpgradesList({ upgrades, sups, onBuy }) {
  const orderedUpgrades = upgrades
    .map((upgrade, index) => ({ upgrade, index }))
    .sort((a, b) => {
      const aOrder = a.upgrade.ordreAffichage
      const bOrder = b.upgrade.ordreAffichage
      if (aOrder != null && bOrder != null) return aOrder - bOrder
      if (aOrder != null) return -1
      if (bOrder != null) return 1
      return a.index - b.index
    })
    .map(({ upgrade }) => upgrade)

  const visibleUpgrades = orderedUpgrades.filter((upgrade, index) => {
    if (index === 0) return true
    return orderedUpgrades[index - 1]?.owned > 0
  })

  return (
    <div className="upgrades-section">
      <div className="section-eyebrow">⚡ Améliorations</div>
      <div className="upgrades-list">
        {visibleUpgrades.map((upgrade) => {
          const cost = getUpgradeCost(upgrade)
          return (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              cost={cost}
              canAfford={sups >= cost}
              onBuy={() => onBuy(upgrade.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
