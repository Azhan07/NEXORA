import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { usePrefs } from '../context/PreferencesContext'
import { cn } from '../lib/utils'

/** Wraps any button/link and pulls it toward the cursor on hover. */
export default function MagneticButton({ children, strength = 0.3, className = '' }) {
  const ref = useRef(null)
  const { motionReduced } = usePrefs()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.4 })

  const onMove = (e) => {
    if (motionReduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  )
}
