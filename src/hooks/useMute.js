import { useState } from 'react'

export function useMute() {
  const [muted, setMuted] = useState(() => localStorage.getItem('sdv-muted') === 'true')

  function toggleMute() {
    setMuted((m) => {
      localStorage.setItem('sdv-muted', String(!m))
      return !m
    })
  }

  return { muted, toggleMute }
}
