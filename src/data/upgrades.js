export const INITIAL_UPGRADES = [
  { id: 0, name: 'Doigt de fée', icon: '👆', baseCost: 10, cpc: 1, cps: 1000, owned: 0, desc: '+1 sup par clic' },
  { id: 1, name: 'Java', icon: '☕', baseCost: 100, cpc: 0, cps: 1, owned: 0, desc: '+1 sup/sec' },
  { id: 2, name: 'C++', icon: '⚙️', baseCost: 500, cpc: 0, cps: 5, owned: 0, desc: '+5 sups/sec' },
  { id: 3, name: 'Python', icon: '🐍', baseCost: 2000, cpc: 0, cps: 20, owned: 0, desc: '+20 sups/sec' },
  { id: 4, name: 'DevOps CI/CD', icon: '🔄', baseCost: 8000, cpc: 0, cps: 80, owned: 0, desc: '+80 sups/sec' },
  { id: 5, name: 'IA & Big Data', icon: '🤖', baseCost: 30000, cpc: 0, cps: 300, owned: 0, desc: '+300 sups/sec' },
]

export function getUpgradeCost(upgrade) {
  return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.owned))
}
