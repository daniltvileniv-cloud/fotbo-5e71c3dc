import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { list, create, patch, remove, get } from '../../services/api.js'
import Button from '../../components/ui/Button.jsx'
import PasteModal from '../../components/ui/PasteModal.jsx'
import { EditableCell } from '../../components/ui/EditableTable.jsx'
import { parsePastedLines } from '../../lib/pasteRows.js'

// ─── Column config ───────────────────────────────────────────────────────
// Order: № | Підрозділ | Звання | ПІБ | Посада | Оцінка | Бал | Дії
const COLUMNS = [
  { key: 'unit',     label: 'Підрозділ',   placeholder: 'Підрозділ',                width: 'w-28' },
  { key: 'rank',     label: 'Звання',      placeholder: 'Звання',                    width: 'w-28' },
  { key: 'position', label: 'Посада',      placeholder: 'Посада',                    width: 'min-w-48' },
  { key: 'name',     label: 'ПІБ',         placeholder: 'Прізвище ім\'я по батькові', width: 'min-w-44' },
  { key: 'grade',    label: 'Оцінка',      placeholder: 'Оцінка',                    width: 'w-28', align: 'center' },
  { key: 'score',    label: 'Бал',         placeholder: 'Бал',                       width: 'w-20', align: 'center' },
]

const EMPTY = { unit: '', rank: '', name: '', position: '', grade: '', score: '', selected: false }

const snapshotOf = (rows) =>
  Object.fromEntries(rows.map((r) => [r.id, { ...EMPTY, ...r }]))

const DEFAULT_HEADER = {
  row2: { text: 'Оцінювання' },
  row1: {
    number: '№ з/п',
    unit: 'Підрозділ',
    rank: 'Звання',
    position: 'Посада',
    name: 'ПІБ',
    grade: 'Оцінка',
    score: 'Бал',
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
function TableRow({ row, index, inputRefs, updateCell, persistCell, handleKeyDown, handlePaste, removeRow, rowsLength, inBase, onAddToBase }) {
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
            onKeyDown={(e) => handleKeyDown(e, row, index)}
            onPaste={(e) => handlePaste(e, index, ci)}
            placeholder={col.placeholder}
            align={col.align || 'left'}
          />
        </td>
      ))}

      {/* Дії */}
      <td className="w-44 border-r border-accent/10 px-1 py-1">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => onAddToBase(row)}
            disabled={inBase || !row.name.trim()}
            title={inBase ? 'Вже в базі Переліку О/С' : 'Додати в базу Переліку О/С'}
            className={`inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 font-sans text-[11px] font-bold uppercase tracking-wider transition ${
              inBase
                ? 'cursor-default bg-success/20 text-success'
                : 'bg-accent text-bg hover:brightness-110 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-40'
            }`}
          >
            {inBase ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                В базі
              </>
            ) : (
              'Додати в базу'
            )}
          </button>
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
        </div>
      </td>
    </tr>
  )
}

// ─── Complete table ──────────────────────────────────────────────────────
function EvaluationTable({
  title,
  rows,
  header,
  onHeaderChange,
  onSaveHeader,
  inputRefs,
  updateCell,
  persistCell,
  handleKeyDown,
  handlePaste,
  removeRow,
  onAddRow,
  addedRows,
  onAddToBase,
  onPasteFromClipboard,
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-none border border-accent/20 bg-surface shadow-2xl shadow-black/50">
      {/* Table label */}
      <div className="flex items-center justify-between border-b border-accent/20 bg-black/50 px-4 py-2">
        <span className="font-serif text-sm font-bold uppercase tracking-[0.15em] text-accent">
          {title}
        </span>
        <span className="font-sans text-[10px] uppercase tracking-widest text-text-muted/40">
          {rows.length} зап.
        </span>
      </div>

      <div className="table-scroll overflow-x-auto">
        <table className="w-full border-collapse font-sans text-sm">
          <thead>
            {/* Full-width editable top row */}
            <tr>
              <FullWidthHeaderCell
                value={header.row2.text}
                onChange={(v) => onHeaderChange('row2', 'text', v)}
                onBlur={onSaveHeader}
              />
            </tr>
            {/* Column headers */}
            <tr className="bg-table-header">
              <HeaderCell
                value={header.row1.number}
                onChange={(v) => onHeaderChange('row1', 'number', v)}
                onBlur={onSaveHeader}
                className="border-r border-black/40 px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-table-header-text"
              />
              {COLUMNS.map((col) => (
                <HeaderCell
                  key={col.key}
                  value={header.row1[col.key]}
                  onChange={(v) => onHeaderChange('row1', col.key, v)}
                  onBlur={onSaveHeader}
                  className={`border-r border-black/40 px-2 py-3 text-xs font-bold uppercase tracking-wider text-table-header-text ${
                    col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                />
              ))}
              <th className="w-44 border-r border-black/40 bg-table-header px-1 py-3 text-center text-xs font-bold uppercase tracking-wider text-table-header-text">
                Дії
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <TableRow
                key={row.id}
                row={row}
                index={i}
                inputRefs={inputRefs}
                updateCell={updateCell}
                persistCell={persistCell}
                handleKeyDown={handleKeyDown}
                handlePaste={handlePaste}
                removeRow={removeRow}
                rowsLength={rows.length}
                inBase={addedRows.has(row.id)}
                onAddToBase={onAddToBase}
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
          <Button variant="ghost" onClick={() => onAddRow('name')}>
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
    </div>
  )
}

// ─── Self-contained editable table (loads its own collection) ────────────
function EditableTable({ collection, headerId, title, exportName }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [focusTarget, setFocusTarget] = useState(null)
  // Rows that were added to the "Перелік О/С" base during this session,
  // tracked by the row's own id so duplicate names never affect each other.
  const [addedRows, setAddedRows] = useState(() => new Set())
  // Paste modal open state
  const [pasteOpen, setPasteOpen] = useState(false)

  const [header, setHeader] = useState(DEFAULT_HEADER)
  const headerDirtyRef = useRef(false)
  const headerRef = useRef(DEFAULT_HEADER)

  const savedRef = useRef({})
  const inputRefs = useRef({})

  useEffect(() => {
    let alive = true
    Promise.all([
      list(collection),
      get('tableConfig', headerId).catch(() => null),
      list('roster').catch(() => []),
    ])
      .then(([data, config, roster]) => {
        if (!alive) return
        const items = Array.isArray(data) ? data : []
        setRows(items)
        savedRef.current = snapshotOf(items)

        // Rows already added to the "Перелік О/С" base, tracked by the
        // evaluation row's own id (sourceId) so duplicate names never
        // affect each other and the state survives a reload.
        const inBase = new Set(
          (Array.isArray(roster) ? roster : [])
            .filter((r) => r.sourceId)
            .map((r) => r.sourceId)
        )
        setAddedRows(inBase)

        if (config) {
          const next = {
            row2: { ...DEFAULT_HEADER.row2, ...config.row2 },
            row1: { ...DEFAULT_HEADER.row1, ...config.row1 },
          }
          headerRef.current = next
          setHeader(next)
        }
      })
      .catch(() => alive && setError('Не вдалося завантажити список. Оновіть сторінку.'))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [collection, headerId])

  useEffect(() => {
    if (!focusTarget) return
    const el = inputRefs.current[`${focusTarget.id}:${focusTarget.field}`]
    if (el) {
      el.focus()
      // Select all text in contentEditable
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
    patch(collection, id, { [field]: value })
      .then((updated) => {
        savedRef.current[id] = { ...savedRef.current[id], ...updated }
      })
      .catch(() => setError('Не вдалося зберегти зміни. Перевірте з\'єднання.'))
      .finally(() => setSaving(false))
  }

  function addRow(focusField = 'name') {
    setError('')
    create(collection, { ...EMPTY })
      .then((item) => {
        setRows((prev) => [...prev, item])
        savedRef.current[item.id] = { ...EMPTY, ...item }
        setFocusTarget({ id: item.id, field: focusField })
      })
      .catch(() => setError('Не вдалося додати рядок.'))
  }

  function removeRow(id) {
    setError('')
    remove(collection, id)
      .then(() => {
        setRows((prev) => prev.filter((r) => r.id !== id))
        delete savedRef.current[id]
      })
      .catch(() => setError('Не вдалося видалити рядок.'))
  }

  function addToBase(row) {
    if (!row.name.trim()) return
    setSaving(true)
    setError('')
    create('roster', {
      unit: row.unit,
      rank: row.rank,
      name: row.name,
      position: row.position,
      grade: row.grade,
      score: row.score,
      sourceId: row.id,
    })
      .then(() => {
        setAddedRows((prev) => new Set(prev).add(row.id))
      })
      .catch(() => setError('Не вдалося додати в базу. Перевірте з\'єднання.'))
      .finally(() => setSaving(false))
  }

  // Parse tab-separated text pasted into the modal and add rows.
  // Columns are detected automatically (підрозділ, звання, посада, ПІБ,
  // оцінка, бал — порядок не важливий). A leading № column and the header
  // row are skipped.
  async function pasteText(text) {
    const records = parsePastedLines(text)
    for (const rec of records) {
      const item = await create(collection, {
        ...EMPTY,
        unit: rec.unit,
        rank: rec.rank,
        name: rec.fullName,
        position: rec.position,
        grade: rec.grade,
        score: rec.score,
      })
      setRows((prev) => [...prev, item])
      savedRef.current[item.id] = { ...EMPTY, ...item }
    }
    setPasteOpen(false)
  }

  function handleKeyDown(e, row, index) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (index === rows.length - 1) addRow()
    }
    if (
      (e.key === 'Backspace' || e.key === 'Delete') &&
      row.name.trim() === '' &&
      rows.length > 1
    ) {
      e.preventDefault()
      removeRow(row.id)
    }
  }

  // Paste goes straight into the focused cell (EditableCell's own handler).
  const handlePaste = null

  function handleHeaderChange(row, field, value) {
    setHeader((prev) => {
      const next = { ...prev, [row]: { ...prev[row], [field]: value } }
      headerRef.current = next
      return next
    })
    headerDirtyRef.current = true
  }

  function saveHeader() {
    if (!headerDirtyRef.current) return
    headerDirtyRef.current = false
    setSaving(true)
    patch('tableConfig', headerId, headerRef.current)
      .catch(() => setError('Не вдалося зберегти заголовок таблиці.'))
      .finally(() => setSaving(false))
  }

  function buildTableText() {
    const h = [
      header.row1.number,
      header.row1.unit,
      header.row1.rank,
      header.row1.position,
      header.row1.name,
      header.row1.grade,
      header.row1.score,
    ]
    const lines = rows.map((r, i) =>
      [i + 1, r.unit, r.rank, r.position, r.name, r.grade, r.score]
        .map((v) => String(v ?? '').trim())
        .join('\t')
    )
    return [h.join('\t'), ...lines].join('\n')
  }

  function exportList() {
    const text = buildTableText()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportName
    a.click()
    URL.revokeObjectURL(url)
  }

  function copyTable() {
    const text = buildTableText()
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => setCopied(true)).catch(() => fallbackCopy(text))
    } else {
      fallbackCopy(text)
    }
    setTimeout(() => setCopied(false), 2000)
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy') } catch (e) {}
    document.body.removeChild(ta)
  }

  const filled = rows.filter((r) => r.name.trim()).length

  return (
    <div>
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

      {loading ? (
        <div className="flex items-center justify-center rounded-none border-2 border-accent/20 bg-surface px-6 py-24 font-sans text-sm text-text-muted">
          Завантаження оцінювання…
        </div>
      ) : (
        <EvaluationTable
          title={title}
          rows={rows}
          header={header}
          onHeaderChange={handleHeaderChange}
          onSaveHeader={saveHeader}
          inputRefs={inputRefs}
          updateCell={updateCell}
          persistCell={persistCell}
          handleKeyDown={handleKeyDown}
          handlePaste={handlePaste}
          removeRow={removeRow}
          onAddRow={addRow}
          addedRows={addedRows}
          onAddToBase={addToBase}
          onPasteFromClipboard={() => setPasteOpen(true)}
        />
      )}

      {/* Paste modal */}
      {pasteOpen && (
        <PasteModal
          title="Вставити з буфера"
          hint="Вставте рядки з Excel у порядку: Підрозділ → Звання → Посада → ПІБ → Оцінка → Бал (як у таблиці). Стовпець № з/п і рядок заголовків пропускаються автоматично."
          onPaste={pasteText}
          onClose={() => setPasteOpen(false)}
        />
      )}

      {/* Export / Copy */}
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={copyTable} disabled={rows.length === 0}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          {copied ? 'Скопійовано ✓' : 'Копіювати таблицю'}
        </Button>
        <Button variant="primary" onClick={exportList} disabled={rows.length === 0}>
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
export default function EvaluationPage() {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-10 md:py-14">
      {/* Page header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/')}
            className="mb-3 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] text-text-muted transition-colors hover:text-accent"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            На головну
          </button>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-[0.12em] text-accent md:text-4xl">
            Оцінювання
          </h1>
          <p className="mt-2 font-sans text-sm text-text-muted">
            Клікніть на комірку, щоб редагувати · зміни зберігаються автоматично
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <EditableTable
          collection="evaluation"
          headerId="eval-header-1"
          title="Оцінювання сержантського складу"
          exportName="otsiniuvannia-serzhanskogo-skladu.txt"
        />
        <EditableTable
          collection="evaluation2"
          headerId="eval-header-2"
          title="Оцінювання сержантського складу — 2"
          exportName="otsiniuvannia-serzhanskogo-skladu-2.txt"
        />
      </div>
    </section>
  )
}