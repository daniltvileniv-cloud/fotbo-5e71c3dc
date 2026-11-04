import { useState } from 'react'
import { useAdminAuth } from '../../store/adminAuth.jsx'

export default function AdminLogin() {
  const { signIn } = useAdminAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(password)
    } catch {
      setError('Wrong password')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-surface rounded-2xl p-8 shadow-sm">
        <h1 className="font-serif text-2xl mb-6">Admin</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full rounded-lg border border-text-muted/25 bg-bg px-4 py-3 text-text outline-none focus:border-accent"
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-bg disabled:opacity-50 hover:brightness-110 transition"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
