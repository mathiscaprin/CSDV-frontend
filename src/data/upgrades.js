export const INITIAL_UPGRADES = [
  // ── CPC ──────────────────────────────────────────────────────────
  { id: 0, name: 'Doigt de développeur',     icon: '👆', baseCost: 10,          cpc: 1,    cps: 0,     owned: 0, desc: '+1 sup par clic' },

  // ── TIER 1 — premiers outils (déblocage ~30s) ────────────────────
  { id: 1,  name: 'Café',            icon: '☕', baseCost: 15,           cpc: 0,    cps: 0.2,   owned: 0, desc: '+0.2 sup/sec' },
  { id: 2,  name: 'Stack Overflow',  icon: '📋', baseCost: 100,          cpc: 0,    cps: 1,     owned: 0, desc: '+1 sup/sec' },
  { id: 3,  name: 'ChatGPT',         icon: '🤖', baseCost: 500,          cpc: 0,    cps: 5,     owned: 0, desc: '+5 sups/sec' },

  // ── TIER 2 — langages (déblocage ~2-5 min) ───────────────────────
  { id: 4,  name: 'Python script',   icon: '🐍', baseCost: 2_000,        cpc: 0,    cps: 18,    owned: 0, desc: '+18 sups/sec' },
  { id: 5,  name: 'Java',            icon: '♨️', baseCost: 5_000,        cpc: 0,    cps: 42,    owned: 0, desc: '+42 sups/sec' },
  { id: 6,  name: 'C++',             icon: '⚙️', baseCost: 12_000,       cpc: 0,    cps: 95,    owned: 0, desc: '+95 sups/sec' },
  { id: 7,  name: 'TypeScript',      icon: '🔷', baseCost: 28_000,       cpc: 0,    cps: 210,   owned: 0, desc: '+210 sups/sec' },

  // ── TIER 3 — infra / outils (déblocage ~10-30 min) ───────────────
  { id: 8,  name: 'Docker',          icon: '🐳', baseCost: 60_000,       cpc: 0,    cps: 450,   owned: 0, desc: '+450 sups/sec' },
  { id: 9,  name: 'Kubernetes',      icon: '☸️', baseCost: 130_000,      cpc: 0,    cps: 900,   owned: 0, desc: '+900 sups/sec' },
  { id: 10, name: 'CI/CD Pipeline',  icon: '🔄', baseCost: 280_000,      cpc: 0,    cps: 1_800, owned: 0, desc: '+1 800 sups/sec' },
  { id: 11, name: 'Cloud AWS',       icon: '☁️', baseCost: 600_000,      cpc: 0,    cps: 3_500, owned: 0, desc: '+3 500 sups/sec' },

  // ── TIER 4 — cyber / sécu (déblocage ~1-3h) ──────────────────────
  { id: 12, name: 'VPN maison',      icon: '🔒', baseCost: 1_300_000,    cpc: 0,    cps: 7_000, owned: 0, desc: '+7 000 sups/sec' },
  { id: 13, name: 'Pentest',         icon: '🕵️', baseCost: 2_800_000,   cpc: 0,    cps: 14_000,owned: 0, desc: '+14 000 sups/sec' },
  { id: 14, name: 'Zero-Day',        icon: '💀', baseCost: 6_000_000,    cpc: 0,    cps: 28_000,owned: 0, desc: '+28 000 sups/sec' },

  // ── TIER 5 — IA / data (déblocage ~5-12h) ────────────────────────
  { id: 15, name: 'LLM fine-tuning', icon: '🧠', baseCost: 13_000_000,   cpc: 0,    cps: 55_000,  owned: 0, desc: '+55 000 sups/sec' },
  { id: 16, name: 'GPU Cluster',     icon: '🖥️', baseCost: 28_000_000,   cpc: 0,    cps: 110_000, owned: 0, desc: '+110 000 sups/sec' },
  { id: 17, name: 'AGI (bientôt™)', icon: '✨', baseCost: 60_000_000,    cpc: 0,    cps: 220_000, owned: 0, desc: '+220 000 sups/sec' },
]

export function getUpgradeCost(upgrade) {
  return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.owned))
}