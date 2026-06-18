import { useEffect, useRef } from 'react'

function getLabel(el) {
  if (!el) return null
  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel
  const title = el.getAttribute('title')
  if (title) return title
  const text = el.textContent?.trim().replace(/\s+/g, ' ')
  return text ? text.slice(0, 120) : null
}

function speak(text) {
  if (!window.speechSynthesis || !text) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'fr-FR'
  utterance.rate = 1.1
  window.speechSynthesis.speak(utterance)
}

export function useKeyboardSpeech(muted) {
  const mutedRef = useRef(muted)

  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  useEffect(() => {
    let isKeyboard = false

    function onKeyDown() {
      isKeyboard = true
    }

    function onMouseDown() {
      isKeyboard = false
    }

    function onFocusIn(e) {
      if (!isKeyboard || mutedRef.current) return
      const label = getLabel(e.target)
      speak(label)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('focusin', onFocusIn)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('focusin', onFocusIn)
      window.speechSynthesis?.cancel()
    }
  }, [])
}
