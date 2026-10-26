import { useEffect, useRef } from 'react'

/**
 * Canvas waveform bars. Uses the live AnalyserNode when the mic is on,
 * otherwise draws a gentle idle / "speaking" wave driven by levelRef.
 */
export default function Waveform({ analyserRef, levelRef, active, bars = 48, className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = 0
    let data = null

    const draw = (t) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().split(' ').join(',')
      const analyser = analyserRef?.current
      if (analyser) {
        if (!data || data.length !== analyser.frequencyBinCount) data = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
      }

      if (w < 10 || h < 4) {
        raf = requestAnimationFrame(draw)
        return
      }
      const count = Math.max(8, Math.min(bars, Math.floor(w / 5)))
      const gap = count < bars ? 2 : 3
      const bw = Math.max(1, (w - gap * (count - 1)) / count)
      const level = levelRef?.current ?? 0
      for (let i = 0; i < count; i++) {
        let v
        if (analyser && data) {
          const idx = Math.floor((i / count) * data.length * 0.7)
          v = data[idx] / 255
        } else {
          const center = 1 - Math.abs(i - count / 2) / (count / 2)
          v = 0.08 + (Math.sin(t / 380 + i * 0.45) * 0.5 + 0.5) * (0.12 + level * 0.9) * center
        }
        const bh = Math.max(3, v * h)
        const x = i * (bw + gap)
        const y = (h - bh) / 2
        ctx.fillStyle = `rgba(${accent},${0.35 + v * 0.65})`
        ctx.beginPath()
        ctx.roundRect ? ctx.roundRect(x, y, bw, bh, Math.min(bw, bh) / 2) : ctx.rect(x, y, bw, bh)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [analyserRef, levelRef, active, bars])

  return <canvas ref={canvasRef} className={className} aria-hidden />
}
