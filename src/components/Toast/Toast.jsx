import './Toast.css'

export default function Toast({ message }) {
  if (!message) return null
  return (
    <div className="toast" key={message}>
      <span className="toast-icon">✓</span>
      {message}
    </div>
  )
}
