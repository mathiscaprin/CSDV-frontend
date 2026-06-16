import { RANKS } from '../data/ranks.js'

export function getCurrentRank(totalSups) {
  let r = RANKS[0]
  for (const rank of RANKS) {
    if (totalSups >= rank.threshold) r = rank
  }
  return r
}

export function getNextRank(totalSups) {
  for (const rank of RANKS) {
    if (totalSups < rank.threshold) return rank
  }
  return null
}

export function getProgress(totalSups) {
  const cur = getCurrentRank(totalSups)
  const nxt = getNextRank(totalSups)
  if (!nxt) return 100
  return Math.min(100, ((totalSups - cur.threshold) / (nxt.threshold - cur.threshold)) * 100)
}
