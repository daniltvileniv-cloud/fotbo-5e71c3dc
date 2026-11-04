// The ONLY place the front-end talks to the backend. Components never call
// fetch() directly — they import list/get/create/update/remove from here.
// Relative /api URLs work in every mode: dev (Vite proxy) and preview/production
// (the same Express server serves dist/ and /api on one port).

let token = null

/** Store the admin token returned by login(). Kept in memory only — never in
 *  localStorage, never bundled. */
export function setToken(value) {
  token = value
}

export function getToken() {
  return token
}

const headers = (body) => ({
  ...(body ? { 'Content-Type': 'application/json' } : {}),
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, options)
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`${options.method || 'GET'} /api${path} failed (${response.status}) ${detail}`)
  }
  return response.status === 204 ? null : response.json()
}

// Reads carry the token too when one exists. Without it a collection listed in
// admin.config.json `privateCollections` answers 401 to its own admin panel —
// the server guards GET on those, and a visitor simply has no token to send.
export const list = (collection) => request(`/${collection}`, { headers: headers(false) })
export const get = (collection, id) => request(`/${collection}/${id}`, { headers: headers(false) })

export const create = (collection, item) =>
  request(`/${collection}`, { method: 'POST', headers: headers(true), body: JSON.stringify(item) })

export const update = (collection, id, item) =>
  request(`/${collection}/${id}`, { method: 'PUT', headers: headers(true), body: JSON.stringify(item) })

export const patch = (collection, id, changes) =>
  request(`/${collection}/${id}`, { method: 'PATCH', headers: headers(true), body: JSON.stringify(changes) })

export const remove = (collection, id) =>
  request(`/${collection}/${id}`, { method: 'DELETE', headers: headers(false) })

/** What the admin panel manages, from admin.config.json (never the password).
 *  Admin-only, so it is called after login. */
export const adminSchema = () => request('/admin/schema', { headers: headers(false) })

/** Admin login. On success the token is stored and every mutating call carries it. */
export async function login(password) {
  const data = await request('/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  setToken(data.token)
  return data.token
}
