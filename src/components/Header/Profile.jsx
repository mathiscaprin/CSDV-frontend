import { useEffect, useRef, useState } from 'react'

export default function Profile({ username, rankName, onLogout }) {
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
      <button
        type="button"
        className="profile-btn"
        aria-label="Menu profil"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
      >
        👤
      </button>
      <div className={`profile-dropdown${open ? ' open' : ''}`}>
        <div className="profile-username">{username || 'Invité'}</div>
        <div className="profile-rank-badge">{rankName}</div>
        <div className="divider"></div>
        <button
          className="logout-btn"
          type="button"
          onClick={(event) => { event.stopPropagation(); onLogout?.() }}
        >
          🚪 Se déconnecter
        </button>
      </div>
    </div>
  )
}
