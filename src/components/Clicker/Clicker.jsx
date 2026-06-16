import { useRef, useState } from 'react'
import './Clicker.css'

let nextFloatId = 0

export default function Clicker({ onClick }) {
  const [clicked, setClicked] = useState(false)
  const [floats, setFloats] = useState([])
  const clickTimeoutRef = useRef(null)

  function handleClick(e) {
    const gained = onClick()

    setClicked(true)
    clearTimeout(clickTimeoutRef.current)
    clickTimeoutRef.current = setTimeout(() => setClicked(false), 110)

    const id = nextFloatId++
    const float = { id, gained, x: e.clientX - 30, y: e.clientY - 20 }
    setFloats((prev) => [...prev, float])
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id))
    }, 860)
  }

  return (
    <div className="clicker-wrapper">
      <div className={`logo-btn${clicked ? ' clicked' : ''}`} onClick={handleClick}>
        <div className="logo-text">
          SUP<sup>2</sup>
          <br />
          VINCI
        </div>
      </div>
      <div className="logo-hint">Cliquez pour gagner des sups</div>

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
