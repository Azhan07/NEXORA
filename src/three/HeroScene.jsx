import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import Orb from './Orb'
import Particles from './Particles'
import { pointer } from '../lib/pointer'

/** Camera parallax + scroll zoom. progressRef is driven by GSAP ScrollTrigger. */
function Rig({ progressRef, motion }) {
  useFrame(({ camera }) => {
    const p = progressRef?.current ?? 0
    const tx = pointer.x * 0.5 * motion
    const ty = pointer.y * 0.35 * motion
    const tz = 6 - p * 2.6
    camera.position.x += (tx - camera.position.x) * 0.05
    camera.position.y += (ty - camera.position.y) * 0.05
    camera.position.z += (tz - camera.position.z) * (motion ? 0.08 : 1)
    camera.lookAt(0, 0, 0)
  })
  return null
}

/** Rotates/lifts the whole scene as the hero scrolls away. */
function ScrollGroup({ progressRef, children }) {
  const g = useRef()
  useFrame(() => {
    const p = progressRef?.current ?? 0
    if (!g.current) return
    g.current.rotation.z = p * 0.5
    g.current.rotation.y = p * 0.9
    // Sit slightly below centre so the headline above stays readable.
    g.current.position.y = -0.3 + p * 0.9
  })
  return <group ref={g}>{children}</group>
}

/** A point light that follows the cursor — the "light shift on mouse move" beat. */
function CursorLight({ color }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const { width, height } = state.viewport
    ref.current.position.x += ((pointer.x * width) / 2 - ref.current.position.x) * 0.1
    ref.current.position.y += ((pointer.y * height) / 2 - ref.current.position.y) * 0.1
    ref.current.position.z = 3
  })
  return <pointLight ref={ref} color={color} intensity={28} distance={14} decay={2} />
}

export default function HeroScene({ progressRef, active = true, accent, motionReduced, isLight, quality, isMobile }) {
  const motion = motionReduced ? 0 : 1
  const low = quality === 'low' || isMobile
  const frameloop = !active ? 'never' : motionReduced ? 'demand' : 'always'

  return (
    <Canvas
      dpr={[1, low ? 1.25 : 1.75]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: !low, alpha: true, powerPreference: 'high-performance' }}
      frameloop={frameloop}
    >
      <ambientLight intensity={isLight ? 0.9 : 0.35} />
      <directionalLight position={[3, 3, 5]} intensity={0.7} />
      <directionalLight position={[-4, 2, -3]} intensity={2} color={accent.hex2} />
      <CursorLight color={accent.hex} />
      <Rig progressRef={progressRef} motion={motion} />

      <ScrollGroup progressRef={progressRef}>
        <Orb color={accent.hex} color2={accent.hex2} motion={motion} light={isLight} baseScale={0.66} responsive />
      </ScrollGroup>

      <Particles count={low ? 700 : 2200} color={accent.hex} radius={[3.5, 13]} size={0.045} motion={motion} light={isLight} />
      <Particles count={low ? 150 : 400} color={accent.hex2} radius={[2.5, 8]} size={0.07} motion={motion} light={isLight} opacity={0.6} />
    </Canvas>
  )
}
