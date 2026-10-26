import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import FresnelGlow from './FresnelGlow'
import { pointer } from '../lib/pointer'
import { clamp, easeOutCubic } from '../lib/utils'

function Ring({ radius, color, opacity, tilt, speed, motion, thickness = 0.01, satellite = true }) {
  const spin = useRef()
  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.z += Math.min(delta, 0.05) * speed * motion
  })
  return (
    <group rotation={tilt}>
      <group ref={spin}>
        <mesh>
          <torusGeometry args={[radius, thickness, 12, 240]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
        </mesh>
        {satellite && (
          <mesh position={[radius, 0, 0]}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        )}
      </group>
    </group>
  )
}

/**
 * The NEXORA AI core: distorted glowing sphere, wireframe shell,
 * fresnel halo and three orbital rings.
 *
 * - intro: grows in after `introDelay` (the "1–2s orb forms" beat)
 * - levelRef: 0..1 audio level → bigger distortion + glow
 * - responsive: shrinks to fit narrow (mobile) viewports
 */
export default function Orb({
  color = '#22d3ee',
  color2 = '#34d399',
  motion = 1,
  intro = true,
  introDelay = 0.9,
  levelRef,
  light = false,
  baseScale = 1,
  responsive = false,
}) {
  const group = useRef()
  const inner = useRef()
  const core = useRef()
  const shell = useRef()
  const mat = useRef()
  const smooth = useRef(0)

  useFrame((state, delta) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 0.05)
    const lvl = levelRef?.current ?? 0
    smooth.current += (lvl - smooth.current) * 0.15
    const l = smooth.current

    const introP = !intro || motion === 0 ? 1 : easeOutCubic(clamp((t - introDelay) / 1.4, 0, 1))
    const resp = responsive ? Math.min(1, state.viewport.width / 6.5) : 1
    group.current.scale.setScalar(Math.max(0.0001, introP * baseScale * resp * (1 + l * 0.22)))
    group.current.position.y = motion ? Math.sin(t * 0.8) * 0.06 : 0

    // Mouse parallax
    inner.current.rotation.y = THREE.MathUtils.lerp(inner.current.rotation.y, pointer.x * 0.5 * motion, 0.05)
    inner.current.rotation.x = THREE.MathUtils.lerp(inner.current.rotation.x, -pointer.y * 0.35 * motion, 0.05)

    core.current.rotation.y += dt * 0.2 * motion
    shell.current.rotation.y -= dt * 0.12 * motion
    shell.current.rotation.z += dt * 0.05 * motion

    if (mat.current) {
      mat.current.distort = 0.28 + l * 0.45
      mat.current.emissiveIntensity = 0.45 + l * 1.4 + (motion ? Math.sin(t * 1.5) * 0.06 : 0)
    }
  })

  return (
    <group ref={group}>
      <group ref={inner}>
        <mesh ref={core}>
          <icosahedronGeometry args={[1.15, 48]} />
          <MeshDistortMaterial
            ref={mat}
            color={color}
            emissive={color}
            emissiveIntensity={0.45}
            roughness={0.12}
            metalness={0.55}
            distort={0.28}
            speed={1.6 * motion}
          />
        </mesh>

        <mesh ref={shell}>
          <icosahedronGeometry args={[1.62, 1]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={light ? 0.35 : 0.16} />
        </mesh>

        <FresnelGlow color={color} scale={1.42} intensity={light ? 0.9 : 1.5} power={2.2} light={light} />
        <FresnelGlow color={color2} scale={2.5} intensity={light ? 0.15 : 0.35} power={3.5} light={light} />

        <Ring radius={2.1} color={color} opacity={0.75} tilt={[1.2, 0.2, 0]} speed={0.35} motion={motion} />
        <Ring radius={2.45} color={color2} opacity={0.5} tilt={[1.9, -0.5, 0.3]} speed={-0.25} motion={motion} />
        <Ring radius={2.85} color={color} opacity={0.22} tilt={[1.4, 0.9, 0]} speed={0.15} motion={motion} thickness={0.006} satellite={false} />
      </group>
    </group>
  )
}
