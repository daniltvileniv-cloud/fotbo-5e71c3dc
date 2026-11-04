import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { remove } from '../../services/api.js'
import { formatValue, humanize, labelOf } from './fields.jsx'
import { useRecords, useRelated } from './useResource.js'

export default function ResourceList({ resources }) {
  const { resource } = useParams()
  const spec = resources[resource]
  const fields = spec?.fields || []
  const { records, loading, error, reload } = useRecords(resource)
  const related = useRelated(fields)
  const [query, setQuery] = useState('')

  const columns = useMemo(
    () => (spec?.listFields ? fields.filter((f) => spec.listFields.includes(f.name)) : fields.slice(0, 4)),
    [spec, fields],
  )

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return records
    return records.filter((r) => JSON.stringify(r).toLowerCase().includes(q))
  }, [records, query])

  if (!spec) return <p className="text-text-muted">Unknown resource “{resource}”.</p>

  async function onDelete(record) {
    if (!window.confirm(`Delete “${labelOf(record, spec.labelKey)}”?`)) return
    await remove(resource, record.id)
    reload()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 justify-between mb-6">
        <h2 className="font-serif text-2xl">{spec.label || resource}</h2>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="rounded-lg border border-text-muted/25 bg-bg px-3 py-2 text-text outline-none focus:border-accent"
          />
          <Link to={`/admin/${resource}/new`} className="rounded-lg bg-primary px-4 py-2 text-bg hover:brightness-110 transition">
            New
          </Link>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-text-muted">Loading…</p>
      ) : !shown.length ? (
        <p className="text-text-muted">Nothing here yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="text-text-muted">
              <tr>
                {columns.map((f) => (
                  <th key={f.name} className="px-4 py-3 font-medium">{humanize(f)}</th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {shown.map((record) => (
                <tr key={record.id} className="border-t border-text-muted/10">
                  {columns.map((f) => (
                    <td key={f.name} className="px-4 py-3 align-middle">
                      {f.type === 'image' && record[f.name] ? (
                        <img src={record[f.name]} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        formatValue(record[f.name], f, related[f.from])
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link to={`/admin/${resource}/${record.id}`} className="text-accent hover:underline">Edit</Link>
                    <button onClick={() => onDelete(record)} className="ml-4 text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
