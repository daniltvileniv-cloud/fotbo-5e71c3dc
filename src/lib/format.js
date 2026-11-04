export const formatPrice = (value, currency = 'USD', locale = 'en-US') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(value) || 0)

export const formatDate = (value, locale = 'en-US') =>
  new Date(value).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
