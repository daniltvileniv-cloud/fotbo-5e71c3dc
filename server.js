// The site's own backend. ONE Express server serves BOTH the built front-end
// (dist/) and the JSON API on a SINGLE port, so dev, preview and production
// behave identically. Preview runs `node server.js` from the project root by
// that exact name — do not move or rename this file.
//
// The API is GENERIC: every key in db.json is exposed as a REST collection, so
// new entities need no code here. Adjust behaviour through admin.config.json,
// not by rewriting this file.
import express from 'express'
import { existsSync, readFileSync, writeFileSync, renameSync } from 'fs'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'
import { dirname, extname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, 'db.json')
const CONFIG_PATH = join(__dirname, 'admin.config.json')
const DIST = join(__dirname, 'dist')
const PORT = process.env.PORT || 3001

const config = existsSync(CONFIG_PATH) ? JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) : {}
const ADMIN_PASSWORD = config.password || ''
// What an admin panel manages, and how to render each field. Read by the `admin`
// block when it is attached; harmless and empty when it is not.
const RESOURCES = config.resources || {}
// Collections holding private records (orders, bookings, messages...): reading
// them requires the admin token. List them in admin.config.json.
const PRIVATE = new Set(config.privateCollections || [])
// Collections a visitor may POST to without a token (contact forms, orders...).
const PUBLIC_POST = new Set(config.publicPostCollections || [])

const tokens = new Set()

const readDb = () => (existsSync(DB_PATH) ? JSON.parse(readFileSync(DB_PATH, 'utf8')) : {})

// Atomic write: a crash mid-write must not truncate db.json.
function writeDb(db) {
  const tmp = `${DB_PATH}.tmp`
  writeFileSync(tmp, JSON.stringify(db, null, 2))
  renameSync(tmp, DB_PATH)
}

const app = express()
app.use(express.json({ limit: '5mb' }))

const isAuthed = (req) => {
  const header = req.headers.authorization || ''
  return header.startsWith('Bearer ') && tokens.has(header.slice(7))
}

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {}
  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid password' })
  const token = randomUUID()
  tokens.add(token)
  res.json({ token })
})

// The admin panel's own description of itself. Served from admin.config.json
// MINUS the password: that file is the credential store, and anything the
// front-end can fetch is public to anyone who finds the endpoint. Requires the
// token anyway — only a logged-in admin has any use for it.
app.get('/api/admin/schema', (req, res) => {
  if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthorized' })
  res.json({ resources: RESOURCES })
})

// Guard every collection route. Reads are public except for PRIVATE
// collections; writes need the token except a POST to a PUBLIC_POST collection.
app.use('/api/:collection', (req, res, next) => {
  const { collection } = req.params
  const authed = isAuthed(req)
  if (req.method === 'GET' || req.method === 'HEAD') {
    if (PRIVATE.has(collection) && !authed) return res.status(401).json({ error: 'Unauthorized' })
    return next()
  }
  if (req.method === 'POST' && PUBLIC_POST.has(collection)) return next()
  // Collections listed in publicPostCollections are fully visitor-writable
  // (the Excel-like roster edits rows in place), not just POST-able.
  if (PUBLIC_POST.has(collection) && ['PUT', 'PATCH', 'DELETE'].includes(req.method)) return next()
  if (!authed) return res.status(401).json({ error: 'Unauthorized' })
  next()
})

app.get('/api/:collection', (req, res) => {
  res.json(readDb()[req.params.collection] || [])
})

app.get('/api/:collection/:id', (req, res) => {
  const item = (readDb()[req.params.collection] || []).find((row) => String(row.id) === req.params.id)
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

app.post('/api/:collection', (req, res) => {
  const db = readDb()
  const { collection } = req.params
  const item = { ...req.body, id: randomUUID(), createdAt: new Date().toISOString() }
  db[collection] = [...(db[collection] || []), item]
  writeDb(db)
  res.status(201).json(item)
})

const replace = (merge) => (req, res) => {
  const db = readDb()
  const { collection, id } = req.params
  const rows = db[collection] || []
  const index = rows.findIndex((row) => String(row.id) === id)
  if (index === -1) return res.status(404).json({ error: 'Not found' })
  rows[index] = merge ? { ...rows[index], ...req.body, id: rows[index].id } : { ...req.body, id: rows[index].id }
  db[collection] = rows
  writeDb(db)
  res.json(rows[index])
}

app.put('/api/:collection/:id', replace(false))
app.patch('/api/:collection/:id', replace(true))

app.delete('/api/:collection/:id', (req, res) => {
  const db = readDb()
  const { collection, id } = req.params
  const rows = db[collection] || []
  const next = rows.filter((row) => String(row.id) !== id)
  if (next.length === rows.length) return res.status(404).json({ error: 'Not found' })
  db[collection] = next
  writeDb(db)
  res.status(204).end()
})

// Static front-end LAST, so it never shadows /api.
if (existsSync(DIST)) {
  app.use(express.static(DIST))
  // SPA fallback for NAVIGATIONS only. A missing asset must still 404 —
  // answering 200/index.html for /assets/*.js would hide a broken bundle from
  // the automated smoke check and ship a blank page as "working".
  app.get('*', (req, res, next) => {
    const isAsset = extname(req.path) !== ''
    if (isAsset && !(req.headers.accept || '').includes('text/html')) return next()
    res.sendFile(join(DIST, 'index.html'))
  })
}

app.listen(PORT, () => console.log(`server on ${PORT}`))
