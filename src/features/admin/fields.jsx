// Field vocabulary for the generic admin. A resource in admin.config.json
// describes its fields with these types; nothing here is per-project, so the
// panel renders any collection without new code.
//
//   text | textarea | number | money | boolean | date | image | select
//
// `select` links to another collection: { type: 'select', from: 'categories' }.
// The option label comes from that resource's labelKey (see labelOf).

export const FIELD_TYPES = ['text', 'textarea', 'number', 'money', 'boolean', 'date', 'image', 'select']

/** Column/field caption. `label` in the config wins; otherwise the field name is
 *  made readable (imageUrl -> "Image url") so a minimal config still looks right. */
export function humanize(field) {
  if (field.label) return field.label
  const spaced = field.name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Human label for a record: the resource's labelKey, or the first thing that reads like a name. */
export function labelOf(record, labelKey) {
  if (!record) return ''
  if (labelKey && record[labelKey] != null) return String(record[labelKey])
  for (const key of ['name', 'title', 'label', 'email']) {
    if (record[key] != null) return String(record[key])
  }
  return String(record.id ?? '')
}

export function formatValue(value, field, options) {
  if (value == null || value === '') return '—'
  switch (field.type) {
    case 'money':
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: field.currency || 'USD',
      }).format(Number(value) || 0)
    case 'boolean':
      return value ? 'Yes' : 'No'
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'select': {
      const match = (options || []).find((o) => String(o.id) === String(value))
      return match ? labelOf(match, field.labelKey) : String(value)
    }
    case 'textarea':
      return String(value).length > 80 ? `${String(value).slice(0, 80)}…` : String(value)
    default:
      return String(value)
  }
}

const inputClass =
  'w-full rounded-lg border border-text-muted/25 bg-bg px-3 py-2 text-text outline-none focus:border-accent'

export function FieldInput({ field, value, options, onChange }) {
  const common = { id: field.name, className: inputClass }

  if (field.type === 'textarea') {
    return <textarea {...common} rows={4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  }
  if (field.type === 'boolean') {
    return (
      <input
        id={field.name}
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 rounded border-text-muted/40 accent-primary"
      />
    )
  }
  if (field.type === 'select') {
    return (
      <select {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {(options || []).map((o) => (
          <option key={o.id} value={o.id}>
            {labelOf(o, field.labelKey)}
          </option>
        ))}
      </select>
    )
  }
  if (field.type === 'image') {
    return (
      <div className="space-y-2">
        <input {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="https://…" />
        {value ? <img src={value} alt="" className="h-24 w-24 rounded-lg object-cover" /> : null}
      </div>
    )
  }

  const type = field.type === 'number' || field.type === 'money' ? 'number' : field.type === 'date' ? 'date' : 'text'
  return (
    <input
      {...common}
      type={type}
      step={field.type === 'money' ? '0.01' : undefined}
      value={value ?? ''}
      onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
    />
  )
}
