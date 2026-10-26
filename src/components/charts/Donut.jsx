import { motion } from 'framer-motion'

export default function Donut({ segments, size = 160, stroke = 18 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const total = segments.reduce((s, x) => s + x.value, 0)
  let offset = 0
  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0" role="img" aria-label="Traffic by device">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-line/[0.07]" />
        {segments.map((s, i) => {
          const len = (s.value / total) * c
          const dash = `${Math.max(0, len - 4)} ${c}`
          const el = (
            <motion.circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              style={{ stroke: s.color }}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.15 }}
            />
          )
          offset += len
          return el
        })}
      </svg>
      <ul className="space-y-2.5 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="w-16 text-muted">{s.label}</span>
            <span className="font-medium">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
