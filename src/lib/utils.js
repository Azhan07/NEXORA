export const cn = (...classes) => classes.filter(Boolean).join(' ')

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)

export const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export const truncate = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s)

export function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export const formatNumber = (n) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)

/** Moves the .spotlight radial highlight to follow the cursor. */
export function trackSpotlight(e) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
