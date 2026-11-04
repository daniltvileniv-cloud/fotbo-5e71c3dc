import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

// The site shell, wrapped around every public route by src/app/router.jsx.
// It places the active page with <Outlet />, so `children` are ignored — the
// console.error exists because React treats that misuse as legal and the page
// would otherwise just go silently blank.
export default function Layout({ children }) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  if (children) {
    console.error('[FOTBO_CONTRACT] A page rendered <Layout>. router.jsx already wraps every route in it.')
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
