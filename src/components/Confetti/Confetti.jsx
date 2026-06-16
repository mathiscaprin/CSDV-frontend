import { useEffect, useState } from 'react'
import './Confetti.css'

const COLORS = ['#8b5cf6', '#c4b5f4', '#f472b6', '#facc15', '#34d399', '#60a5fa']
const PIECE_COUNT = 200

function createPieces() {
  return Array.from({ length: PIECE_COUNT }, (_, i) => {
    const angle = Math.random() * Math.PI * 2
    const distance = 500 + Math.random() * 700
    return {
      id: i,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      delay: Math.random() * 0.15,
      duration: 0.5 + Math.random() * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotate: 360 + Math.random() * 720,
      width: 6 + Math.random() * 6,
      height: 8 + Math.random() * 8,
    }
  })
}

export default function Confetti({ burst }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!burst) return
    setPieces(createPieces())
    const timer = setTimeout(() => setPieces([]), 1200)
    return () => clearTimeout(timer)
  }, [burst])

  if (pieces.length === 0) return null

  return (
    <div className="confetti-overlay">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            backgroundColor: p.color,
            width: p.width,
            height: p.height,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            '--rotate': `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  )
}
