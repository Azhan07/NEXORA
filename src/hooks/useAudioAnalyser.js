import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Web Audio microphone analyser.
 * - levelRef.current: smoothed 0..1 loudness (read every frame by the 3D orb)
 * - analyserRef.current: AnalyserNode for the waveform canvas
 */
export function useAudioAnalyser() {
  const [active, setActive] = useState(false)
  const [error, setError] = useState(null)
  const analyserRef = useRef(null)
  const levelRef = useRef(0)
  const ctxRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(0)

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    ctxRef.current?.close().catch(() => {})
    streamRef.current = null
    ctxRef.current = null
    analyserRef.current = null
    levelRef.current = 0
    setActive(false)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const Ctx = window.AudioContext || window.webkitAudioContext
      const ctx = new Ctx()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)

      streamRef.current = stream
      ctxRef.current = ctx
      analyserRef.current = analyser

      const data = new Uint8Array(analyser.frequencyBinCount)
      const loop = () => {
        analyser.getByteFrequencyData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) sum += data[i]
        const level = Math.min(1, (sum / data.length / 255) * 2.4)
        levelRef.current += (level - levelRef.current) * 0.25
        rafRef.current = requestAnimationFrame(loop)
      }
      loop()
      setActive(true)
      return true
    } catch {
      setError('Microphone access was blocked or is unavailable.')
      return false
    }
  }, [])

  useEffect(() => stop, [stop])

  return { active, error, start, stop, analyserRef, levelRef }
}
