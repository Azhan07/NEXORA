import { motion } from 'framer-motion'
import { formatNumber } from '../../lib/utils'

export default function BarList({ items }) {
  const max = Math.max(...items.map((i) => i.value))
  return (
    <ul className="space-y-3.5">
      {items.map((it, i) => (
        <li key={it.label}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              {it.icon && <it.icon size={14} style={{ color: it.color }} />}
              {it.label}
            </span>
            <span className="font-mono text-xs text-muted">{formatNumber(it.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-line/[0.07]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${it.color}99, ${it.color})`, boxShadow: `0 0 12px ${it.color}66` }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(it.value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
