import { useId, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

/** Smooth SVG area chart with hover tooltip and draw-in animation. */
export default function AreaChart({ data, height = 240 }) {
  const id = useId().replace(/:/g, '')
  const [hover, setHover] = useState(null)
  const W = 640
  const H = height
  const padX = 8
  const padTop = 16
  const padBottom = 28

  const { points, line, area, max, ticks } = useMemo(() => {
    const max = Math.ceil((Math.max(...data.map((d) => d.value)) * 1.15) / 500) * 500
    const points = data.map((d, i) => [
      padX + (i * (W - padX * 2)) / (data.length - 1),
      padTop + (1 - d.value / max) * (H - padTop - padBottom),
    ])
    let line = `M ${points[0][0]} ${points[0][1]}`
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1]
      const [x1, y1] = points[i]
      const cx = (x0 + x1) / 2
      line += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`
    }
    const area = `${line} L ${points[points.length - 1][0]} ${H - padBottom} L ${points[0][0]} ${H - padBottom} Z`
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ y: padTop + (1 - f) * (H - padTop - padBottom), v: Math.round(max * f) }))
    return { points, line, area, max, ticks }
  }, [data, H])

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const i = Math.round(((x - padX) / (W - padX * 2)) * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, i)))
  }

  const hp = hover !== null ? points[hover] : null

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label={`Area chart, max ${max}`}>
        <defs>
          <linearGradient id={`fill-${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'rgb(var(--accent))', stopOpacity: 0.35 }} />
            <stop offset="100%" style={{ stopColor: 'rgb(var(--accent))', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <line key={t.v} x1={0} x2={W} y1={t.y} y2={t.y} className="stroke-line/[0.07]" strokeDasharray="3 5" />
        ))}
        <motion.path d={area} fill={`url(#fill-${id})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} />
        <motion.path
          d={line}
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="stroke-accent"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
        {data.map((d, i) =>
          i % 5 === 0 ? (
            <text key={i} x={points[i][0]} y={H - 8} textAnchor={i === 0 ? 'start' : 'middle'} className="fill-muted text-[11px]">{d.label}</text>
          ) : null,
        )}
        {hp && (
          <g>
            <line x1={hp[0]} x2={hp[0]} y1={padTop} y2={H - padBottom} className="stroke-accent/40" strokeDasharray="4 4" />
            <circle cx={hp[0]} cy={hp[1]} r={9} className="fill-accent/20" />
            <circle cx={hp[0]} cy={hp[1]} r={4.5} className="fill-accent stroke-bg" strokeWidth={2} />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="glass-strong pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg px-3 py-1.5 text-xs"
          style={{ left: `${(hp[0] / W) * 100}%` }}
        >
          <span className="text-muted">{data[hover].label}</span> · <span className="font-semibold">{data[hover].value.toLocaleString()}</span>
        </div>
      )}
    </div>
  )
}
