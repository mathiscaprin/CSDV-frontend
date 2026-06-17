const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    mode: 'cors',
  })

  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  return { ok: response.ok, status: response.status, data }
}

export async function signIn(email, password) {
  return request('/auth/connexion', {
    method: 'POST',
    body: { email, password },
  })
}

export async function signUp(username, email, password) {
  return request('/auth/inscription', {
    method: 'POST',
    body: { username, email, password },
  })
}

export async function createSession(token) {
  return request('/session', {
    method: 'POST',
    token,
  })
}

export async function getSession(token) {
  return request('/session', {
    method: 'GET',
    token,
  })
}

export async function saveSession(sessionState, token) {
  return request('/session', {
    method: 'PUT',
    token,
    body: {
      supsTotal: String(sessionState.totalSups),
      supsPerSecond: String(sessionState.supsPerSecond),
      supsPerClick: String(sessionState.supsPerClick),
    },
  })
}
