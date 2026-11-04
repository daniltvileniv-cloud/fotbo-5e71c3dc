import { useEffect, useRef, useState } from 'react'
import Button from './Button.jsx'

// ─── Modal for pasting tab-separated data into a table ──────────────────
// The user pastes (Ctrl+V) into a textarea — this always works regardless of
// clipboard permissions — then confirms. The parent parses the text.
export default function PasteModal({ title, hint, onPaste, onClose }) {
  const [text, setText] = useState('')
  const taRef = useRef(null)

  useEffect(() => {
    taRef.current?.focus()
  }, [])

  function handleSubmit() {
    if (!text.trim()) return
    onPaste(text)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl rounded-lg border border-accent/30 bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-accent">{title}</h3>
        <p className="mt-1 font-sans text-xs text-text-muted">{hint}</p>

        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              handleSubmit()
            }
            if (e.key === 'Escape') onClose()
          }}
          rows={10}
          placeholder="Вставте скопійовані дані (Ctrl+V)…"
          className="mt-3 w-full resize-y rounded-md border border-accent/20 bg-black/40 p-3 font-sans text-sm text-text outline-none ring-accent focus:ring-2"
        />

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="font-sans text-[11px] uppercase tracking-widest text-text-muted/60">
            Ctrl+Enter — вставити
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>Скасувати</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!text.trim()}>
              Вставити
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}