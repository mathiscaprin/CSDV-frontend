import { useEffect, useRef, useState } from 'react'

export function useRankUp(currentRank) {
  const [rankUp, setRankUp] = useState(null)
  const previousName = useRef(null)

  useEffect(() => {
    if (previousName.current === null) {
      previousName.current = currentRank.name
      return
    }
    if (previousName.current === currentRank.name) return

    previousName.current = currentRank.name
    setRankUp(currentRank)
    document.body.classList.add('shake')

    const shakeTimer = setTimeout(() => document.body.classList.remove('shake'), 500)
    const clearTimer = setTimeout(() => setRankUp(null), 2200)
    return () => {
      clearTimeout(shakeTimer)
      clearTimeout(clearTimer)
    }
  }, [currentRank])

  return { rankUp }
}
