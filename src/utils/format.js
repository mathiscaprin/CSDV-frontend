export function fmt(n) {
  n = Math.floor(n)
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'G'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString('fr-FR')
}

// Like fmt, but keeps decimals for small fractional values (eg. the 0.2 cps of the
// Café upgrade) instead of flooring them away. Whole numbers still show with no decimals.
export function fmtStat(n) {
  if (n >= 1e3) return fmt(n)
  const rounded = Math.round(n * 100) / 100
  if (Number.isInteger(rounded)) return rounded.toLocaleString('fr-FR')
  return rounded.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
}
