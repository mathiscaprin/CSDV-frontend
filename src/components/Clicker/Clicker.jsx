import { useRef, useState } from 'react'
import './Clicker.css'

let nextFloatId = 0

// Keyframes are restarted (cancel + replay) on every click so rapid spam-clicking
// keeps showing the full grow/shrink punch instead of getting stuck mid-animation.
const PULSE_KEYFRAMES = [
  { transform: 'scale(1)' },
  { transform: 'scale(0.8)', offset: 0.35 },
  { transform: 'scale(1.08)', offset: 0.7 },
  { transform: 'scale(1)' },
]

const PULSE_OPTIONS = {
  duration: 260,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
}

export default function Clicker({ onClick }) {
  const [floats, setFloats] = useState([])
  const logoRef = useRef(null)
  const clickTimestampsRef = useRef([])

  function isThrottled() {
    const now = Date.now()
    clickTimestampsRef.current = clickTimestampsRef.current.filter((t) => now - t < 1000)
    if (clickTimestampsRef.current.length >= 30) return true
    clickTimestampsRef.current.push(now)
    return false
  }

  function pulse() {
    const node = logoRef.current
    if (!node) return
    node.getAnimations().forEach((anim) => anim.cancel())
    node.animate(PULSE_KEYFRAMES, PULSE_OPTIONS)
  }

  function handleClick(e) {
    if (isThrottled()) return
    const gained = onClick()
    pulse()

    const id = nextFloatId++
    let x, y
    if (e.clientX === 0 && e.clientY === 0) {
      const rect = logoRef.current?.getBoundingClientRect()
      x = (rect ? rect.left + rect.width / 2 : window.innerWidth / 2) - 30
      y = (rect ? rect.top + rect.height / 2 : window.innerHeight / 2) - 20
    } else {
      x = e.clientX - 30
      y = e.clientY - 20
    }
    setFloats((prev) => [...prev, { id, gained, x, y }])
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id))
    }, 860)
  }

  function handleRightClick(e) {
    e.preventDefault()
    handleClick(e)
  }

  return (
    <div className="clicker-wrapper">
      <button
        type="button"
        ref={logoRef}
        className="logo-btn"
        aria-label="Cliquer pour gagner des sups"
        onClick={handleClick}
        onContextMenu={handleRightClick}
        onKeyDown={(e) => { if (e.key === 'Enter' && e.repeat) e.preventDefault() }}
      >
        <div className="logo-text">
          SUP<sup>2</sup>
          <br />
          VINCI
        </div>
      </button>
      {floats.map((f) => (
        <div
          key={f.id}
          className="float-text"
          style={{ left: f.x, top: f.y }}
        >
          +{f.gained} 🎓
        </div>
      ))}
    </div>
  )
}
