import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'
import { usePrefs } from '../context/PreferencesContext'

export default function AnimatedNumber({ value, duration = 1.6, format = (n) => Math.round(n).toLocaleString() }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const { motionReduced } = usePrefs()
  const [display, setDisplay] = useState(motionReduced ? value : 0)

  useEffect(() => {
    if (!inView) return
    if (motionReduced) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: setDisplay })
    return () => controls.stop()
  }, [inView, value, duration, motionReduced])

  return <span ref={ref}>{format(display)}</span>
}
