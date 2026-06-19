import { useEffect } from 'react'

export function useBackspaceNav() {
  useEffect(() => {
    function handleBackspace(e) {
      if (e.key !== 'Backspace') return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      e.preventDefault()
      const focusable = Array.from(
        document.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      ).filter(
        (el) => el.offsetParent !== null || el.closest('.header') || el.closest('.leaderboard'),
      )
      const idx = focusable.indexOf(document.activeElement)
      const prev = idx <= 0 ? focusable[focusable.length - 1] : focusable[idx - 1]
      prev?.focus()
    }

    document.addEventListener('keydown', handleBackspace)
    return () => document.removeEventListener('keydown', handleBackspace)
  }, [])
}
