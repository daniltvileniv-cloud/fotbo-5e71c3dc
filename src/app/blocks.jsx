import AdminApp from '../features/admin/AdminApp.jsx'

// Routes contributed by attached blocks. The attach_block tool owns this file
// and rewrites it whole; nothing else edits it, and no block edits the router.
export const blockRoutes = [
  { path: '/admin/*', element: <AdminApp /> },
]
