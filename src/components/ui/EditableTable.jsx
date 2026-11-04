import { useEffect, useRef } from 'react'

/**
 * Contenteditable table cell.
 * - Lets the user select across cells with the mouse and copy manually.
 * - Intercepts paste to fill many cells at once (see useTablePaste).
 * - Commits its value on blur.
 */
export function EditableCell({
  value,
  onCommit,
  onKeyDown,
  onPaste,
  placeholder,
  align = 'left',
  cellRef,
  className = '',
}) {
  const ref = useRef(null)

  // Keep the DOM text in sync with the saved value, but never while editing.
  useEffect(() => {
    if (document.activeElement !== ref.current) {
      ref.current.textContent = value ?? ''
    }
  }, [value])

  function handleBlur() {
    const text = ref.current.textContent ?? ''
    if (text !== (value ?? '')) {
      onCommit(text)
    }
  }

  // Paste plain text into the current cell at the caret position.
  function handlePaste(e) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    if (!text) return
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || !ref.current.contains(sel.anchorNode)) {
      ref.current.textContent = text
      return
    }
    const range = sel.getRangeAt(0)
    range.deleteContents()
    const node = document.createTextNode(text)
    range.insertNode(node)
    range.setStartAfter(node)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  return (
    <div
      ref={(el) => {
        ref.current = el
        if (cellRef) cellRef(el)
      }}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={placeholder}
      data-placeholder={placeholder}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
      onPaste={onPaste || handlePaste}
      className={`min-h-[2.25rem] w-full cursor-text whitespace-pre-wrap break-words px-2 py-2 font-sans text-text outline-none transition-colors hover:bg-accent/5 focus:bg-accent/10 focus:ring-1 focus:ring-accent/60 ${
        align === 'center' ? 'text-center' : 'text-left'
      } ${className}`}
    />
  )
}

/**
 * Paste handler for a whole table.
 *
 * When the user pastes tab/newline separated data (e.g. from Excel) into any
 * cell, it fills the grid starting at that cell across the data columns,
 * creating new rows automatically when the pasted block is taller than the
 * current table.
 *
 * @param {object} opts
 * @param {Array}  opts.rows        current rows
 * @param {Function} opts.setRows   state setter
 * @param {string} opts.collection  api collection name
 * @param {object} opts.EMPTY       empty row shape
 * @param {object} opts.savedRef    ref of last-saved snapshots
 * @param {Array}  opts.dataCols    ordered data field keys (excludes № and Дії)
 * @param {Function} opts.create    api create
 * @param {Function} opts.patch     api patch
 * @returns {Function} handlePaste(e, rowIndex, colIndex)
 */
export function useTablePaste({ rows, setRows, collection, EMPTY, savedRef, dataCols, create, patch }) {
  async function handlePaste(e, rowIndex, colIndex) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    if (!text) return

    const lines = text.split(/\r?\n/)
    // Drop a single trailing empty line (common when copying from Excel).
    if (lines.length && lines[lines.length - 1].trim() === '') lines.pop()

    const grid = lines.map((l) => l.split('\t'))
    const needed = rowIndex + grid.length

    // Create missing rows so the pasted block always fits.
    let current = rows
    while (current.length < needed) {
      const item = await create(collection, { ...EMPTY })
      current = [...current, item]
      savedRef.current[item.id] = { ...EMPTY, ...item }
    }
    setRows(current)

    // Collect every cell update.
    const updates = []
    grid.forEach((rowVals, r) => {
      const targetRow = current[rowIndex + r]
      rowVals.forEach((val, c) => {
        const targetCol = colIndex + c
        if (targetCol < dataCols.length) {
          updates.push({ id: targetRow.id, field: dataCols[targetCol], value: val })
        }
      })
    })
    if (!updates.length) return

    // Apply to state.
    setRows((prev) =>
      prev.map((row) => {
        const rowUpdates = updates.filter((u) => u.id === row.id)
        if (!rowUpdates.length) return row
        const next = { ...row }
        rowUpdates.forEach((u) => {
          next[u.field] = u.value
        })
        return next
      })
    )

    // Persist each changed cell.
    updates.forEach((u) => {
      patch(collection, u.id, { [u.field]: u.value }).catch(() => {})
    })
  }

  return handlePaste
}