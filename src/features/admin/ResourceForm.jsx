import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { create, get, update } from '../../services/api.js'
import { FieldInput, humanize } from './fields.jsx'
import { useRelated } from './useResource.js'

export default function ResourceForm({ resources }) {
  const { resource, id } = useParams()
  const navigate = useNavigate()
  const spec = resources[resource]
  const fields = spec?.fields || []
  const related = useRelated(fields)
  const isNew = id === 'new'

  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (isNew) return
    let alive = true
    get(resource, id)
      .then((record) => alive && setValues(record || {}))
      .catch((err) => alive && setError(String(err.message || err)))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [resource, id, isNew])

  if (!spec) return <p className="text-text-muted">Unknown resource “{resource}”.</p>

  const missing = fields.filter((f) => f.required && (values[f.name] == null || values[f.name] === ''))

  async function onSubmit(event) {
    event.preventDefault()
    if (missing.length) {
      setError(`Required: ${missing.map(humanize).join(', ')}`)
      return
    }
    setBusy(true)
    setError('')
    try {
      if (isNew) await create(resource, values)
      else await update(resource, id, values)
      navigate(`/admin/${resource}`)
    } catch (err) {
      setError(String(err.message || err))
      setBusy(false)
    }
  }

  if (loading) return <p className="text-text-muted">Loading…</p>

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <h2 className="font-serif text-2xl mb-6">
        {isNew ? `New ${spec.label || resource}` : `Edit ${spec.label || resource}`}
      </h2>

      <div className="space-y-5 rounded-2xl bg-surface p-6">
        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="mb-1.5 block text-sm text-text-muted">
              {humanize(field)}
              {field.required ? ' *' : ''}
            </label>
            <FieldInput
              field={field}
              value={values[field.name]}
              options={related[field.from]}
              onChange={(v) => setValues((prev) => ({ ...prev, [field.name]: v }))}
            />
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={busy} className="rounded-lg bg-primary px-5 py-2.5 text-bg disabled:opacity-50 hover:brightness-110 transition">
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={() => navigate(`/admin/${resource}`)} className="rounded-lg px-5 py-2.5 text-text-muted hover:text-text transition">
          Cancel
        </button>
      </div>
    </form>
  )
}
