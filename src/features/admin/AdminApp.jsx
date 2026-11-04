import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { adminSchema } from '../../services/api.js'
import { AdminAuthProvider, useAdminAuth } from '../../store/adminAuth.jsx'
import AdminLogin from './AdminLogin.jsx'
import ResourceForm from './ResourceForm.jsx'
import ResourceList from './ResourceList.jsx'

// Generic admin panel. It renders whatever admin.config.json declares under
// `resources`, so adding a managed collection is a few lines of JSON, not a new
// screen. Reached only by typing /admin — never linked from the site.
function AdminShell() {
  const { signOut } = useAdminAuth()
  const [resources, setResources] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminSchema()
      .then((data) => setResources(data.resources || {}))
      .catch((err) => setError(String(err.message || err)))
  }, [])

  if (error) return <div className="min-h-screen bg-bg text-text p-8">{error}</div>
  if (!resources) return <div className="min-h-screen bg-bg text-text p-8 text-text-muted">Loading…</div>

  const names = Object.keys(resources)
  if (!names.length) {
    return (
      <div className="min-h-screen bg-bg text-text p-8">
        <p className="text-text-muted">
          No resources declared. Add them under <code>resources</code> in admin.config.json.
        </p>
      </div>
    )
  }

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 transition ${isActive ? 'bg-primary text-bg' : 'text-text-muted hover:text-text'}`

  return (
    <div className="min-h-screen bg-bg text-text flex">
      <aside className="w-56 shrink-0 border-r border-text-muted/10 p-5">
        <Link to="/admin" className="font-serif text-xl block mb-6">Admin</Link>
        <nav className="space-y-1">
          {names.map((name) => (
            <NavLink key={name} to={`/admin/${name}`} className={linkClass}>
              {resources[name].label || name}
            </NavLink>
          ))}
        </nav>
        <button onClick={signOut} className="mt-8 text-sm text-text-muted hover:text-text transition">
          Sign out
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-x-auto">
        <Routes>
          <Route index element={<Navigate to={names[0]} replace />} />
          <Route path=":resource" element={<ResourceList resources={resources} />} />
          <Route path=":resource/:id" element={<ResourceForm resources={resources} />} />
        </Routes>
      </main>
    </div>
  )
}

function Gate() {
  const { authed } = useAdminAuth()
  return authed ? <AdminShell /> : <AdminLogin />
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Gate />
    </AdminAuthProvider>
  )
}
