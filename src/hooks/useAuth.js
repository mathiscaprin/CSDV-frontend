import { useEffect, useState } from 'react'
import { signOut } from '../utils/api.js'
import { loadStoredAuth, saveStoredAuth } from '../utils/session.js'

export function useAuth() {
  const [auth, setAuth] = useState(loadStoredAuth)

  useEffect(() => {
    saveStoredAuth(auth)
  }, [auth])

  function handleLogin(newAuth) {
    setAuth(newAuth)
  }

  async function handleLogout() {
    await signOut()
    setAuth(null)
  }

  return { auth, handleLogin, handleLogout }
}
