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

  function pulse() {
    const node = logoRef.current
    if (!node) return
    node.getAnimations().forEach((anim) => anim.cancel())
    node.animate(PULSE_KEYFRAMES, PULSE_OPTIONS)
  }

  function handleClick(e) {
    const gained = onClick()
    pulse()

    const id = nextFloatId++
    const float = { id, gained, x: e.clientX - 30, y: e.clientY - 20 }
    setFloats((prev) => [...prev, float])
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
      <div
        ref={logoRef}
        className="logo-btn"
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
        <div className="logo-text">
          SUP<sup>2</sup>
          <br />
          VINCI
        </div>
      </div>
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
