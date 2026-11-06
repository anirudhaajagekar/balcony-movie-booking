const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export const formatPrice = (n) => inr.format(Math.round(n))

export const formatDuration = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`

export const formatVotes = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}K` : String(n)

// "1930" -> "7:30 PM"
export function formatTime(hhmm) {
  const h = Number(hhmm.slice(0, 2))
  const m = hhmm.slice(2)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m} ${suffix}`
}

// Local date -> "2026-11-06"
export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export const todayISO = () => toISODate(new Date())

export function showDateTime(iso, hhmm) {
  const d = parseISODate(iso)
  d.setHours(Number(hhmm.slice(0, 2)), Number(hhmm.slice(2)), 0, 0)
  return d
}

export function formatDateLong(iso) {
  return parseISODate(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function relativeDayLabel(iso) {
  const today = todayISO()
  if (iso === today) return 'Today'
  if (iso === toISODate(addDays(new Date(), 1))) return 'Tomorrow'
  return parseISODate(iso).toLocaleDateString('en-IN', { weekday: 'short' })
}

export function releaseDate(movie) {
  return addDays(new Date(), movie.releaseInDays)
}

export function formatReleaseDate(movie) {
  return releaseDate(movie).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const initials = (name) =>
  name
    .split(' ')
    .map((p) => p[0])
    .filter((c) => /[A-Za-z]/.test(c))
    .slice(0, 2)
    .join('')