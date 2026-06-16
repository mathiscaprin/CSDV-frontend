import './RankUpAnnouncement.css'

export default function RankUpAnnouncement({ rank }) {
  if (!rank) return null

  return (
    <div className="rank-announcement-overlay">
      <div key={rank.name} className="rank-announcement-card">
        {rank.name}
      </div>
    </div>
  )
}
