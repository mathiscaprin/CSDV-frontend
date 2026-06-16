import { useState } from 'react'
import { signIn, signUp } from '../../utils/api.js'
import './LoginPage.css'

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      if (mode === 'register') {
        const signUpResponse = await signUp(username.trim(), email.trim(), password)
        if (!signUpResponse.ok) {
          if (signUpResponse.status === 409) {
            throw new Error('Ce compte existe déjà. Essayez de vous connecter.')
          }
          throw new Error('Impossible de créer le compte. Vérifiez vos informations et réessayez.')
        }
      }

      const signInResponse = await signIn(email.trim(), password)
      if (!signInResponse.ok) {
        if (signInResponse.status === 401) {
          throw new Error('Identifiants invalides. Vérifiez votre email et mot de passe.')
        }
        throw new Error('Impossible de se connecter. Réessayez plus tard.')
      }

      const { token, userId, username: returnedUsername } = signInResponse.data || {}
      if (!token) {
        throw new Error('Le serveur n’a pas renvoyé de token de connexion.')
      }

      onLogin({ token, userId, username: returnedUsername || username || email })
    } catch (error) {
      setMessage(error.message ?? 'Une erreur inconnue est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Connexion</h1>
          <p className="auth-subtitle">Connectez-vous ou créez un compte pour sauvegarder votre partie.</p>
        </div>

        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login')
              setMessage(null)
            }}
          >
            Se connecter
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => {
              setMode('register')
              setMessage(null)
            }}
          >
            Créer un compte
          </button>
        </div>

        {message && <div className="auth-error">{message}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="username">Pseudo</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Votre pseudo"
                autoComplete="username"
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="votre@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />
          </div>

          <div className="auth-actions">
            <button className="auth-cta" type="submit" disabled={loading}>
              {loading ? 'Connexion...' : mode === 'login' ? 'Se connecter' : 'Créer un compte'}
            </button>
          </div>
        </form>

        <p className="auth-note">
          Vos progrès sont sauvegardés sur le backend lorsque vous êtes connecté.
        </p>
      </div>
    </section>
  )
}
