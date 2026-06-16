import { getUpgradeCost } from '../../data/upgrades.js'
import UpgradeCard from './UpgradeCard.jsx'
import './Upgrades.css'

export default function UpgradesList({ upgrades, sups, onBuy }) {
  return (
    <div className="upgrades-section">
      <div className="section-eyebrow">⚡ Améliorations</div>
      <div className="upgrades-list">
        {upgrades.map((upgrade) => {
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
