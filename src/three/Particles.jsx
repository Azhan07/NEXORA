import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { pointer } from '../lib/pointer'

function useCircleTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grd.addColorStop(0, 'rgba(255,255,255,1)')
    grd.addColorStop(0.35, 'rgba(255,255,255,0.65)')
    grd.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(c)
  }, [])
}

/**
 * Spherical particle field. Fades in over the first second (the
 * "0–1s: subtle particles appear" beat) and drifts with the cursor.
 */
export default function Particles({
  count = 1500,
  color = '#22d3ee',
  radius = [3.5, 12],
  size = 0.04,
  motion = 1,
  light = false,
  fadeIn = true,
  opacity = 0.85,
}) {
  const ref = useRef()
  const mat = useRef()
  const tex = useCircleTexture()
  const [rMin, rMax] = radius

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = rMin + Math.pow(Math.random(), 1.6) * (rMax - rMin)
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th)
      arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7
      arr[i * 3 + 2] = r * Math.cos(ph)
    }
    return arr
  }, [count, rMin, rMax])

  const animateFade = fadeIn && motion > 0

  useFrame((state, delta) => {
    if (!ref.current) return
    const dt = Math.min(delta, 0.05)
    ref.current.rotation.y += dt * 0.03 * motion
    ref.current.rotation.x += (pointer.y * 0.15 * motion - ref.current.rotation.x) * 0.03
    ref.current.rotation.z += (pointer.x * 0.1 * motion - ref.current.rotation.z) * 0.03
    if (animateFade && mat.current) {
      mat.current.opacity = Math.min(1, state.clock.elapsedTime / 1.2) * opacity
    }
  })

  return (
    <points ref={ref} key={count}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        map={tex}
        size={size}
        color={color}
        transparent
        opacity={animateFade ? 0 : opacity}
        depthWrite={false}
        sizeAttenuation
        blending={light ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  )
}
