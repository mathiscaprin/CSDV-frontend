const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };

  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    mode: "cors",
    credentials: "include",
  };

  if (method.toUpperCase() === "GET") {
    options.cache = "no-store";
    headers["Cache-Control"] = "no-cache";
  }

  const response = await fetch(`${API_BASE}${path}`, options);

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { ok: response.ok, status: response.status, data };
}

export async function signIn(email, password) {
  return request("/auth/connexion", {
    method: "POST",
    body: { email, password },
  });
}

export async function signUp(username, email, password) {
  return request("/auth/inscription", {
    method: "POST",
    body: { username, email, password },
  });
}

export async function createSession() {
  return request("/session", {
    method: "POST",
  });
}

export async function getSession() {
  return request("/session", {
    method: "GET",
  });
}

export async function saveSession(sessionState) {
  return request("/session", {
    method: "PUT",
    body: {
      supsTotal: String(sessionState.totalSups),
      supsPerSecond: String(sessionState.supsPerSecond),
      supsPerClick: String(sessionState.supsPerClick),
    },
  });
}

export async function getSuccesses(token) {
  return request("/succes", {
    method: "GET",
    token,
  });
}

export async function getLeaderboard() {
  return request("/session/classement", {
    method: "GET",
  });
}

export async function signOut() {
  return request("/auth/deconnexion", {
    method: "POST",
  });
}
