import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { login as apiLogin, setToken } from '../services/api.js'

// Admin session. The token the server hands back lives in React state ONLY —
// never localStorage, never a file. A reload drops it and returns to the login
// form; that is correct, not a bug to work around.
const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [authed, setAuthed] = useState(false)

  const signIn = useCallback(async (password) => {
    await apiLogin(password)
    setAuthed(true)
  }, [])

  const signOut = useCallback(() => {
    setToken(null)
    setAuthed(false)
  }, [])

  const value = useMemo(() => ({ authed, signIn, signOut }), [authed, signIn, signOut])
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>')
  return ctx
}
