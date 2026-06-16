import { getUpgradeCost } from '../../data/upgrades.js'
import UpgradeCard from './UpgradeCard.jsx'
import './Upgrades.css'

export default function UpgradesList({ upgrades, sups, onBuy }) {
  const visibleUpgrades = upgrades.filter((upgrade) => {
    if (upgrade.id === 0) return true
    const previousUpgrade = upgrades.find((u) => u.id === upgrade.id - 1)
    return previousUpgrade?.owned > 0
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
