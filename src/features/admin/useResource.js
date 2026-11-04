import { useCallback, useEffect, useState } from 'react'
import { list } from '../../services/api.js'

/** Records of every collection a resource's `select` fields point at, keyed by
 *  collection name — so the list and the form can show a category NAME instead
 *  of the raw id they store. */
export function useRelated(fields) {
  const [related, setRelated] = useState({})

  useEffect(() => {
    const sources = [...new Set((fields || []).filter((f) => f.type === 'select' && f.from).map((f) => f.from))]
    if (!sources.length) return
    let alive = true
    Promise.all(sources.map((name) => list(name).catch(() => [])))
      .then((results) => {
        if (!alive) return
        setRelated(Object.fromEntries(sources.map((name, i) => [name, results[i]])))
      })
    return () => {
      alive = false
    }
  }, [fields])

  return related
}

/** One collection's records, with a reload hook for after a mutation. */
export function useRecords(collection) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(() => {
    setLoading(true)
    list(collection)
      .then((rows) => {
        setRecords(Array.isArray(rows) ? rows : [])
        setError('')
      })
      .catch((err) => setError(String(err.message || err)))
      .finally(() => setLoading(false))
  }, [collection])

  useEffect(reload, [reload])

  return { records, loading, error, reload }
}
