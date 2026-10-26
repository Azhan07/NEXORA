// Deterministic pseudo-random so charts look the same on every load.
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const rand = seeded(42)

export const ACTIVE_USERS_30D = Array.from({ length: 30 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (29 - i))
  const base = 2100 + i * 38
  const weekly = Math.sin((i / 7) * Math.PI * 2) * 220
  return {
    label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: Math.round(base + weekly + rand() * 260),
  }
})

export const STATS = [
  { id: 'users', label: 'Total users', value: 12480, delta: '+12.4%', up: true },
  { id: 'active', label: 'Active today', value: 3214, delta: '+5.1%', up: true },
  { id: 'prompts', label: 'Prompts sent', value: 248930, delta: '+18.7%', up: true },
  { id: 'latency', label: 'Avg. response (ms)', value: 1180, delta: '-8.2%', up: true },
]

export const DEVICE_SPLIT = [
  { label: 'Desktop', value: 58, color: 'rgb(var(--accent))' },
  { label: 'Mobile', value: 31, color: 'rgb(var(--accent-2))' },
  { label: 'Tablet', value: 11, color: '#fbbf24' },
]

export const DEMO_USERS = [
  { id: 'u1', name: 'Ayesha Khan', email: 'ayesha@studio.io', plan: 'Pro', status: 'Active', lastActive: '2m ago' },
  { id: 'u2', name: 'Daniel Park', email: 'daniel@orbit.dev', plan: 'Team', status: 'Active', lastActive: '14m ago' },
  { id: 'u3', name: 'Sofia Rossi', email: 'sofia@lumen.co', plan: 'Free', status: 'Invited', lastActive: '—' },
  { id: 'u4', name: 'Hamza Ali', email: 'hamza@pixel.pk', plan: 'Pro', status: 'Active', lastActive: '1h ago' },
  { id: 'u5', name: 'Emma Clarke', email: 'emma@northwind.uk', plan: 'Team', status: 'Suspended', lastActive: '6d ago' },
  { id: 'u6', name: 'Kenji Watanabe', email: 'kenji@kumo.jp', plan: 'Pro', status: 'Active', lastActive: '3h ago' },
  { id: 'u7', name: 'Fatima Noor', email: 'fatima@craft.ae', plan: 'Free', status: 'Active', lastActive: 'yesterday' },
  { id: 'u8', name: 'Lucas Martin', email: 'lucas@atelier.fr', plan: 'Enterprise', status: 'Active', lastActive: '5m ago' },
]
