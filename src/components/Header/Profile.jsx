import { useEffect, useRef, useState } from 'react'

export default function Profile({ rankName }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleOutsideClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  return (
    <div className="profile-wrapper" ref={wrapperRef}>
      <div className="profile-btn" onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}>
        👤
      </div>
      <div className={`profile-dropdown${open ? ' open' : ''}`}>
        <div className="profile-username">sylvain_g</div>
        <div className="profile-rank-badge">{rankName}</div>
        <div className="divider"></div>
        <button className="logout-btn">🚪 Se déconnecter</button>
      </div>
    </div>
  )
}
