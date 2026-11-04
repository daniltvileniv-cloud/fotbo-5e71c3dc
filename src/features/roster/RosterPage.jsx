import { useEffect, useRef, useState } from 'react'
import { list, remove } from '../../services/api.js'

const PAGE_PASSWORD = '3102'

function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function submit() {
    if (value === PAGE_PASSWORD) {
      onUnlock()
    } else {
      setError(true)
      setValue('')
      inputRef.current?.focus()
    }
  }

  return (
    <section className="relative flex min-h-[calc(100vh-96px)] items-center justify-center overflow-hidden px-6 py-16">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-bg" />
        <div className="absolute inset-0 crosshair-pattern opacity-20" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[500px] -translate-x-1/2 bg-accent/5 blur-[160px] rounded-full" />
        <div className="absolute inset-0 border-[12px] border-primary/30 pointer-events-none" />
        <div className="absolute inset-0 border-[4px] border-accent/10 pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-accent/20 bg-surface p-8 shadow-2xl shadow-black/50">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-accent">Облік особового складу</p>
          <h1 className="mt-2 font-serif text-3xl font-bold uppercase tracking-[0.1em] text-text">
            Перелік О/С
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-[2px] w-12 bg-accent/80" />
            <div className="h-[2px] w-6 bg-accent/40" />
            <div className="h-[2px] w-3 bg-accent/20" />
          </div>
          <p className="mt-4 font-sans text-sm text-text-muted">
            Ця сторінка захищена. Введіть пароль, щоб переглянути перелік.
          </p>

          <form
            className="mt-6 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError(false)
              }}
              placeholder="Пароль"
              autoComplete="off"
              className={`w-full rounded-lg border bg-bg px-4 py-3 font-sans text-lg tracking-[0.3em] text-text outline-none transition focus:ring-2 ${
                error
                  ? 'border-danger/60 focus:border-danger focus:ring-danger/20'
                  : 'border-text-muted/20 focus:border-accent/60 focus:ring-accent/20'
              }`}
            />
            {error && (
              <p className="font-sans text-xs text-danger">Неправильний пароль. Спробуйте ще раз.</p>
            )}
            <button
              type="submit"
              className="mt-1 rounded-lg bg-accent px-4 py-3 font-sans text-sm font-bold uppercase tracking-[0.15em] text-bg transition hover:brightness-110 active:scale-[.98]"
            >
              Увійти
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default function RosterPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const load = () => {
    setLoading(true)
    setLoadError(false)
    return list('roster')
      .then((rows) => setItems(rows.filter((r) => String(r.name || '').trim())))
      .catch(() => {
        setItems([])
        setLoadError(true)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleRemove(id) {
    try {
      await remove('roster', id)
      setItems((prev) => prev.filter((r) => r.id !== id))
    } catch {
      // keep the row if the delete failed
    }
  }

  const shown = items.filter((s) =>
    [s.name, s.rank, s.unit, s.position]
      .join(' ')
      .toLowerCase()
      .includes(q.toLowerCase())
  )

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  return (
    <section className="relative min-h-[calc(100vh-96px)] overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-bg" />
        <div className="absolute inset-0 crosshair-pattern opacity-20" />
        <div className="absolute left-0 top-0 h-[400px] w-[500px] bg-accent/5 blur-[160px] rounded-full" />
        <div className="absolute inset-0 border-[12px] border-primary/30 pointer-events-none" />
        <div className="absolute inset-0 border-[4px] border-accent/10 pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-accent">Облік особового складу</p>
            <h1 className="mt-2 font-serif text-4xl font-bold uppercase tracking-[0.1em] text-text md:text-5xl">
              Перелік О/С
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-[2px] w-12 bg-accent/80" />
              <div className="h-[2px] w-6 bg-accent/40" />
              <div className="h-[2px] w-3 bg-accent/20" />
            </div>
            <p className="mt-4 max-w-xl font-sans text-sm text-text-muted">
              Постійна база сержантів, які пройшли навчання. Додаються кнопкою «Додати в базу» на сторінці
              Оцінювання та зберігаються навіть після видалення з оцінювання.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-sans text-sm uppercase tracking-[0.15em] text-text-muted">
              {shown.length} / {items.length} записів
            </span>
            <button
              onClick={load}
              title="Оновити список"
              className="inline-flex items-center gap-2 rounded-lg border border-accent/30 px-3 py-2 font-sans text-xs font-bold uppercase tracking-wider text-accent transition hover:bg-accent hover:text-bg active:scale-[.97]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M21 12a9 9 0 11-2.64-6.36M21 3v6h-6" />
              </svg>
              Оновити
            </button>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Пошук за ПІБ, званням, підрозділом…"
              className="w-full rounded-lg border border-text-muted/20 bg-surface px-4 py-3 font-sans text-sm text-text outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20 md:w-80"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-text-muted/15 bg-surface shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-text-muted text-bg">
                  <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-[0.15em]">№</th>
                  <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-[0.15em]">Підрозділ</th>
                  <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-[0.15em]">Звання</th>
                  <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-[0.15em]">Посада</th>
                  <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-[0.15em]">ПІБ</th>
                  <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-[0.15em]">Оцінка</th>
                  <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-[0.15em]">Бал</th>
                  <th className="px-4 py-3 text-right font-sans text-xs font-bold uppercase tracking-[0.15em]">Дії</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center font-sans text-sm text-text-muted">
                      Завантаження…
                    </td>
                  </tr>
                ) : shown.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center font-sans text-sm text-text-muted">
                      {loadError ? (
                        <span className="flex flex-col items-center gap-3">
                          <span>Не вдалося завантажити базу. Перевірте з'єднання.</span>
                          <button
                            onClick={load}
                            className="rounded-lg border border-accent/40 px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-accent transition hover:bg-accent hover:text-bg active:scale-[.97]"
                          >
                            Повторити
                          </button>
                        </span>
                      ) : items.length === 0 ? (
                        'База порожня. Додайте сержантів кнопкою «Додати в базу» на сторінці Оцінювання.'
                      ) : (
                        'Записів не знайдено'
                      )}
                    </td>
                  </tr>
                ) : (
                  shown.map((s, i) => (
                    <tr
                      key={s.id}
                      className="border-t border-text-muted/10 transition-colors hover:bg-accent/5"
                    >
                      <td className="px-4 py-3 font-sans text-sm text-text-muted">{i + 1}</td>
                      <td className="px-4 py-3 font-sans text-sm font-semibold text-accent">{s.unit}</td>
                      <td className="px-4 py-3 font-sans text-sm text-text">{s.rank}</td>
                      <td className="px-4 py-3 font-sans text-sm text-text-muted">{s.position}</td>
                      <td className="px-4 py-3 font-sans text-sm font-semibold text-text">{s.name}</td>
                      <td className="px-4 py-3 font-sans text-sm text-text">{s.grade}</td>
                      <td className="px-4 py-3 font-sans text-sm text-text">{s.score}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemove(s.id)}
                          title="Видалити з бази"
                          className="rounded-lg border border-accent/30 px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-accent transition hover:bg-accent hover:text-bg active:scale-[.97]"
                        >
                          Видалити
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}