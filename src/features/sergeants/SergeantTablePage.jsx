import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { list, create, patch, remove, get } from '../../services/api.js'
import Button from '../../components/ui/Button.jsx'
import PasteModal from '../../components/ui/PasteModal.jsx'
import { EditableCell } from '../../components/ui/EditableTable.jsx'
import { parsePastedLines } from '../../lib/pasteRows.js'

// ─── Column config ───────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'unit',       label: 'Підрозділ',    placeholder: 'Підрозділ',                   width: 'w-28', align: 'center' },
  { key: 'rank',       label: 'Звання',       placeholder: 'Звання',                     width: 'w-28' },
  { key: 'position',   label: 'Посада',       placeholder: 'Посада',                     width: 'min-w-48' },
  { key: 'fullName',   label: 'ПІБ',          placeholder: 'Прізвище ім\'я по батькові',  width: 'min-w-44' },
]

const EMPTY = { rank: '', fullName: '', unit: '', position: '' }

const DATA_COLS = ['unit', 'rank', 'position', 'fullName']

const snapshotOf = (rows) =>
  Object.fromEntries(rows.map((r) => [r.id, { ...EMPTY, ...r }]))

const DEFAULT_HEADER = {
  row2: { text: '09.00 — 13.00' },
  row1: {
    number: '№ з/п',
    unit: 'Підрозділ',
    rank: 'Звання',
    position: 'Посада',
    name: 'ПІБ',
  },
}

// ─── Full-width editable top row ─────────────────────────────────────────
function FullWidthHeaderCell({ value, onChange, onBlur }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => { setDraft(value) }, [value])

  function handleClick() {
    setEditing(true)
    setDraft(value)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function handleBlur() {
    setEditing(false)
    if (draft !== value) {
      onChange(draft)
      onBlur()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      inputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setDraft(value)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <th colSpan={COLUMNS.length + 2} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
          className="absolute inset-0 h-full w-full bg-text-muted px-4 py-2 font-sans text-sm font-bold uppercase tracking-wider text-bg outline-none ring-2 ring-accent"
        />
      </th>
    )
  }

  return (
    <th
      colSpan={COLUMNS.length + 2}
      onClick={handleClick}
      className="cursor-pointer select-none bg-text-muted px-4 py-2 text-center font-sans text-xs font-bold uppercase tracking-[0.2em] text-bg transition-colors hover:brightness-110"
      title="Клікніть, щоб змінити"
    >
      {value}
    </th>
  )
}

// ─── Editable header cell ────────────────────────────────────────────────
function HeaderCell({ value, onChange, onBlur, className = '' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => { setDraft(value) }, [value])

  function handleClick() {
    setEditing(true)
    setDraft(value)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function handleBlur() {
    setEditing(false)
    if (draft !== value) {
      onChange(draft)
      onBlur()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      inputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setDraft(value)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <th className={`relative ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
          className="absolute inset-0 h-full w-full bg-surface px-2 py-2 font-sans text-sm font-bold uppercase tracking-wider text-text outline-none ring-2 ring-accent"
        />
      </th>
    )
  }

  return (
    <th
      onClick={handleClick}
      className={`cursor-pointer select-none transition-colors hover:brightness-110 ${className}`}
      title="Клікніть, щоб змінити"
    >
      {value}
    </th>
  )
}

// ─── One data row ────────────────────────────────────────────────────────
function TableRow({ row, index, side, inputRefs, updateCell, persistCell, handleKeyDown, removeRow, rowsLength }) {
  return (
    <tr
      className={`border-b border-accent/10 transition-colors ${
        index % 2 === 0 ? 'bg-surface' : 'bg-black/40'
      } hover:bg-accent/5`}
    >
      <td className="w-10 border-r border-accent/10 px-2 py-1 text-center font-sans text-xs text-text-muted">
        {index + 1}
      </td>

      {COLUMNS.map((col, ci) => (
        <td key={col.key} className={`border-r border-accent/10 px-1 py-1 ${col.width}`}>
          <EditableCell
            cellRef={(el) => {
              inputRefs.current[`${row.id}:${col.key}`] = el
            }}
            value={row[col.key]}
            onCommit={(v) => {
              updateCell(row.id, col.key, v)
              persistCell(row.id, col.key, v)
            }}
            onKeyDown={(e) => handleKeyDown(e, row, index, side, rowsLength)}
            placeholder={col.placeholder}
            align={col.align || 'left'}
          />
        </td>
      ))}

      <td className="w-10 px-1 py-1 text-right">
        <Button
          variant="danger"
          onClick={() => removeRow(row.id)}
          disabled={rowsLength === 1}
          aria-label="Видалити рядок"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </Button>
      </td>
    </tr>
  )
}

// ─── One complete table ──────────────────────────────────────────────────
function SergeantTable({
  label,
  side,
  rows,
  header,
  onHeaderChange,
  onSaveHeader,
  inputRefs,
  updateCell,
  persistCell,
  handleKeyDown,
  removeRow,
  onAddRow,
  onCopy,
  onExport,
  copied,
  onPasteFromClipboard,
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-none border border-accent/20 bg-surface shadow-2xl shadow-black/50">
      {/* Table label */}
      <div className="flex items-center justify-between border-b border-accent/20 bg-black/50 px-4 py-2">
        <span className="font-serif text-sm font-bold uppercase tracking-[0.15em] text-accent">
          {label}
        </span>
        <span className="font-sans text-[10px] uppercase tracking-widest text-text-muted/40">
          {rows.length} зап.
        </span>
      </div>

      <div className="table-scroll overflow-x-auto">
        <table className="w-full border-collapse font-sans text-sm">
          <thead>
            <tr>
              <FullWidthHeaderCell
                value={header.row2.text}
                onChange={(v) => onHeaderChange('row2', 'text', v)}
                onBlur={onSaveHeader}
              />
            </tr>
            <tr className="bg-table-header">
              <HeaderCell
                value={header.row1.number}
                onChange={(v) => onHeaderChange('row1', 'number', v)}
                onBlur={onSaveHeader}
                className="border-r border-black/40 px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-table-header-text"
              />
              <HeaderCell
                value={header.row1.unit}
                onChange={(v) => onHeaderChange('row1', 'unit', v)}
                onBlur={onSaveHeader}
                className="border-r border-black/40 px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-table-header-text"
              />
              <HeaderCell
                value={header.row1.rank}
                onChange={(v) => onHeaderChange('row1', 'rank', v)}
                onBlur={onSaveHeader}
                className="border-r border-black/40 px-2 py-3 text-left text-xs font-bold uppercase tracking-wider text-table-header-text"
              />
              <HeaderCell
                value={header.row1.position}
                onChange={(v) => onHeaderChange('row1', 'position', v)}
                onBlur={onSaveHeader}
                className="border-r border-black/40 px-2 py-3 text-left text-xs font-bold uppercase tracking-wider text-table-header-text"
              />
              <HeaderCell
                value={header.row1.name}
                onChange={(v) => onHeaderChange('row1', 'name', v)}
                onBlur={onSaveHeader}
                className="border-r border-black/40 px-2 py-3 text-left text-xs font-bold uppercase tracking-wider text-table-header-text"
              />
              <th className="w-10 border-r border-black/40 bg-table-header px-1 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <TableRow
                key={row.id}
                row={row}
                index={i}
                side={side}
                inputRefs={inputRefs}
                updateCell={updateCell}
                persistCell={persistCell}
                handleKeyDown={handleKeyDown}
                removeRow={removeRow}
                rowsLength={rows.length}
              />
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="px-6 py-16 text-center font-sans text-sm text-text-muted">
                  Немає записів
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-accent/20 bg-black/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onAddRow}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Додати рядок
          </Button>
          <Button variant="ghost" onClick={onPasteFromClipboard}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Вставити з буфера
          </Button>
        </div>
        <span className="font-sans text-[10px] uppercase tracking-widest text-text-muted/50">
          Enter — новий · Backspace — видалити · Ctrl+V — вставити в комірку
        </span>
      </div>

      {/* Copy / Export */}
      <div className="flex items-center justify-end gap-2 border-t border-accent/20 bg-black/50 px-4 py-3">
        <Button variant="ghost" onClick={onCopy} disabled={rows.length === 0}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          {copied ? 'Скопійовано ✓' : 'Копіювати таблицю'}
        </Button>
        <Button variant="primary" onClick={onExport} disabled={rows.length === 0}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Експорт
        </Button>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────
export default function SergeantTablePage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [focusTarget, setFocusTarget] = useState(null)

  const [headerLeft, setHeaderLeft] = useState(DEFAULT_HEADER)
  const [headerRight, setHeaderRight] = useState(DEFAULT_HEADER)
  const headerDirtyRef = useRef({ left: false, right: false })
  const headerLeftRef = useRef(DEFAULT_HEADER)
  const headerRightRef = useRef(DEFAULT_HEADER)

  const [copiedLeft, setCopiedLeft] = useState(false)
  const [copiedRight, setCopiedRight] = useState(false)

  // Which table's paste modal is open: null | 'left' | 'right'
  const [pasteOpen, setPasteOpen] = useState(null)

  const savedRef = useRef({})
  const inputRefs = useRef({})

  // Load sergeants + header config
  useEffect(() => {
    let alive = true
    Promise.all([
      list('sergeants'),
      get('tableConfig', 'sgt-header-1').catch(() => null),
      get('tableConfig', 'sgt-header-2').catch(() => null),
    ])
      .then(([sergeantsData, configL, configR]) => {
        if (!alive) return
        const items = Array.isArray(sergeantsData) ? sergeantsData : []
        // Ensure every row has a side — default to 'left' if missing
        const withSide = items.map((r) => ({ side: 'left', ...r }))
        setRows(withSide)
        savedRef.current = snapshotOf(withSide)

        if (configL) {
          const nextL = {
            row2: { ...DEFAULT_HEADER.row2, ...configL.row2 },
            row1: { ...DEFAULT_HEADER.row1, ...configL.row1 },
          }
          headerLeftRef.current = nextL
          setHeaderLeft(nextL)
        }
        if (configR) {
          const nextR = {
            row2: { ...DEFAULT_HEADER.row2, ...configR.row2 },
            row1: { ...DEFAULT_HEADER.row1, ...configR.row1 },
          }
          headerRightRef.current = nextR
          setHeaderRight(nextR)
        }
      })
      .catch(() => alive && setError('Не вдалося завантажити список. Оновіть сторінку.'))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!focusTarget) return
    const el = inputRefs.current[`${focusTarget.id}:${focusTarget.field}`]
    if (el) {
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }
    setFocusTarget(null)
  }, [focusTarget])

  function updateCell(id, field, value) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  function persistCell(id, field, value) {
    const saved = savedRef.current[id]
    if (saved && saved[field] === value) return
    setSaving(true)
    setError('')
    patch('sergeants', id, { [field]: value })
      .then((updated) => {
        savedRef.current[id] = { ...savedRef.current[id], ...updated }
      })
      .catch(() => setError('Не вдалося зберегти зміни. Перевірте з\'єднання.'))
      .finally(() => setSaving(false))
  }

  function addRow(side, focusField = 'fullName') {
    setError('')
    create('sergeants', { ...EMPTY, side })
      .then((item) => {
        const withSide = { side, ...item }
        setRows((prev) => [...prev, withSide])
        savedRef.current[withSide.id] = { ...EMPTY, ...withSide }
        setFocusTarget({ id: withSide.id, field: focusField })
      })
      .catch(() => setError('Не вдалося додати рядок.'))
  }

  function removeRow(id) {
    setError('')
    remove('sergeants', id)
      .then(() => {
        setRows((prev) => prev.filter((r) => r.id !== id))
        delete savedRef.current[id]
      })
      .catch(() => setError('Не вдалося видалити рядок.'))
  }

  // ── Split rows by `side` field (not by position) ──────────────────────
  const leftRows = rows.filter((r) => r.side === 'left')
  const rightRows = rows.filter((r) => r.side === 'right')

  function handleKeyDown(e, row, index, side, tableLength) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (index === tableLength - 1) addRow(side)
    }
    if (
      (e.key === 'Backspace' || e.key === 'Delete') &&
      row.fullName.trim() === '' &&
      tableLength > 1
    ) {
      e.preventDefault()
      removeRow(row.id)
    }
  }

  // ── Header editing ─────────────────────────────────────────────────────
  function handleHeaderChange(side, row, field, value) {
    const setter = side === 'left' ? setHeaderLeft : setHeaderRight
    const ref = side === 'left' ? headerLeftRef : headerRightRef
    setter((prev) => {
      const next = { ...prev, [row]: { ...prev[row], [field]: value } }
      ref.current = next
      return next
    })
    headerDirtyRef.current[side] = true
  }

  function saveHeader(side) {
    if (!headerDirtyRef.current[side]) return
    headerDirtyRef.current[side] = false
    const key = side === 'left' ? 'sgt-header-1' : 'sgt-header-2'
    const header = side === 'left' ? headerLeftRef.current : headerRightRef.current
    setSaving(true)
    patch('tableConfig', key, header)
      .catch(() => setError('Не вдалося зберегти заголовок таблиці.'))
      .finally(() => setSaving(false))
  }

  // ── Export ─────────────────────────────────────────────────────────────
  function exportList() {
    const h = [
      headerLeft.row1.number,
      headerLeft.row1.unit,
      headerLeft.row1.rank,
      headerLeft.row1.position,
      headerLeft.row1.name,
    ]
    const lines = rows.map((r, i) =>
      [i + 1, r.unit, r.rank, r.position, r.fullName]
        .map((v) => String(v ?? '').trim())
        .join('\t')
    )
    const text = [h.join('\t'), ...lines].join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'zalucheennia-serzhanskogo-skladu.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function buildTableText(header, tableRows) {
    const h = [
      header.row1.number,
      header.row1.unit,
      header.row1.rank,
      header.row1.position,
      header.row1.name,
    ]
    const lines = tableRows.map((r, i) =>
      [i + 1, r.unit, r.rank, r.position, r.fullName]
        .map((v) => String(v ?? '').trim())
        .join('\t')
    )
    return [h.join('\t'), ...lines].join('\n')
  }

  function copyTable(header, tableRows, setCopied) {
    const text = buildTableText(header, tableRows)
    const done = () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done))
    } else {
      fallbackCopy(text, done)
    }
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy') } catch (e) {}
    document.body.removeChild(ta)
    done()
  }

  function exportTable(header, tableRows, filename) {
    const text = buildTableText(header, tableRows)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Parse tab-separated text pasted into the modal and add rows.
  // Columns are detected automatically (звання, ПІБ, посада, підрозділ …),
  // so the copy order from Excel does not matter. A leading № column and
  // the header row are skipped.
  async function pasteText(text, side) {
    const records = parsePastedLines(text)
    for (const rec of records) {
      const item = await create('sergeants', { ...EMPTY, side, ...rec })
      const withSide = { side, ...item }
      setRows((prev) => [...prev, withSide])
      savedRef.current[withSide.id] = { ...EMPTY, ...withSide }
    }
    setPasteOpen(null)
  }

  const filled = rows.filter((r) => r.fullName.trim()).length

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-10 md:py-14">
      {/* Page header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/')}
            className="mb-3 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] text-text-muted transition-colors hover:text-accent"
          >
            На головну
          </button>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-[0.12em] text-accent md:text-4xl">
            Залучення Сержанського складу
          </h1>
          <p className="mt-2 font-sans text-sm text-text-muted">
            Клікніть на комірку, щоб редагувати · зміни зберігаються автоматично
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden font-sans text-xs text-text-muted sm:inline">
            {filled} / {rows.length} записів
          </span>
          <Button variant="primary" onClick={exportList} disabled={rows.length === 0}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Експорт
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-none border border-danger/50 bg-danger/15 px-4 py-3 font-sans text-sm text-danger">
          ⚠ {error}
        </div>
      )}

      {/* Saving indicator */}
      <div className="mb-3 flex h-5 items-center justify-end font-sans text-[11px] uppercase tracking-widest text-text-muted/60">
        {saving ? 'Збереження…' : loading ? 'Завантаження…' : 'Збережено'}
      </div>

      {/* Two-column table layout */}
      {loading ? (
        <div className="flex items-center justify-center rounded-none border-2 border-accent/20 bg-surface px-6 py-24 font-sans text-sm text-text-muted">
          Завантаження табеля…
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <SergeantTable
            label="1-1"
            side="left"
            rows={leftRows}
            header={headerLeft}
            onHeaderChange={(r, f, v) => handleHeaderChange('left', r, f, v)}
            onSaveHeader={() => saveHeader('left')}
            inputRefs={inputRefs}
            updateCell={updateCell}
            persistCell={persistCell}
            handleKeyDown={handleKeyDown}
            removeRow={removeRow}
            onAddRow={() => addRow('left')}
            onCopy={() => copyTable(headerLeft, leftRows, setCopiedLeft)}
            onExport={() => exportTable(headerLeft, leftRows, 'zalucheennia-1.txt')}
            copied={copiedLeft}
            onPasteFromClipboard={() => setPasteOpen('left')}
          />

          <SergeantTable
            label="2-2"
            side="right"
            rows={rightRows}
            header={headerRight}
            onHeaderChange={(r, f, v) => handleHeaderChange('right', r, f, v)}
            onSaveHeader={() => saveHeader('right')}
            inputRefs={inputRefs}
            updateCell={updateCell}
            persistCell={persistCell}
            handleKeyDown={handleKeyDown}
            removeRow={removeRow}
            onAddRow={() => addRow('right')}
            onCopy={() => copyTable(headerRight, rightRows, setCopiedRight)}
            onExport={() => exportTable(headerRight, rightRows, 'zalucheennia-2.txt')}
            copied={copiedRight}
            onPasteFromClipboard={() => setPasteOpen('right')}
          />
        </div>
      )}

      {/* Paste modal */}
      {pasteOpen && (
        <PasteModal
          title="Вставити з буфера"
          hint="Вставте рядки з Excel у порядку: Підрозділ → Звання → Посада → ПІБ (як у таблиці). Стовпець № з/п і рядок заголовків пропускаються автоматично."
          onPaste={(text) => pasteText(text, pasteOpen)}
          onClose={() => setPasteOpen(null)}
        />
      )}
    </section>
  )
}