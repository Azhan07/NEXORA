import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Line, OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import Orb from './Orb'
import Particles from './Particles'
import FresnelGlow from './FresnelGlow'

const ORBITS = [
  { r: 3.3, tilt: 0.22, speed: 0.2 },
  { r: 4.8, tilt: -0.14, speed: 0.13 },
  { r: 6.3, tilt: 0.1, speed: 0.09 },
]

function orbitPos(orbit, angle, target) {
  return target.set(
    Math.cos(angle) * orbit.r,
    Math.sin(angle) * orbit.r * Math.sin(orbit.tilt),
    Math.sin(angle) * orbit.r * Math.cos(orbit.tilt),
  )
}

function OrbitRing({ orbit, color, light }) {
  const points = useMemo(() => {
    const v = new THREE.Vector3()
    return Array.from({ length: 129 }, (_, i) => orbitPos(orbit, (i / 128) * Math.PI * 2, v).clone())
  }, [orbit])
  return <Line points={points} color={color} lineWidth={1} transparent opacity={light ? 0.35 : 0.18} />
}

function ToolNode({ tool, orbit, startAngle, selected, hovered, dimmed, onSelect, onHover, pausedRef, motion, positions, light }) {
  const group = useRef()
  const mesh = useRef()
  const angle = useRef(startAngle)

  useFrame((_, delta) => {
    if (!group.current) return
    const dt = Math.min(delta, 0.05)
    if (!pausedRef.current) angle.current += dt * orbit.speed * motion
    orbitPos(orbit, angle.current, group.current.position)
    positions.current[tool.id] = group.current.position

    const target = selected ? 1.75 : hovered ? 1.4 : dimmed ? 0.55 : 1
    const s = group.current.scale.x
    group.current.scale.setScalar(s + (target - s) * 0.12)
    mesh.current.rotation.y += dt * 0.6
    mesh.current.rotation.x += dt * 0.25
  })

  const lit = selected || hovered

  return (
    <group ref={group}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(tool.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          onHover(null)
          document.body.style.cursor = ''
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(tool.id)
        }}
      >
        <icosahedronGeometry args={[0.28, 2]} />
        <meshStandardMaterial
          color={tool.color}
          emissive={tool.color}
          emissiveIntensity={lit ? 1.5 : 0.55}
          roughness={0.3}
          metalness={0.4}
          transparent
          opacity={dimmed ? 0.25 : 1}
          flatShading
        />
      </mesh>
      {!dimmed && <FresnelGlow color={tool.color} scale={0.6} intensity={lit ? 1.8 : 0.9} light={light} />}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
          <torusGeometry args={[0.55, 0.008, 8, 80]} />
          <meshBasicMaterial color={tool.color} toneMapped={false} />
        </mesh>
      )}
      <Html position={[0, 0.62, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`node-label ${lit && !dimmed ? 'show' : ''}`}>{tool.name}</div>
      </Html>
    </group>
  )
}

/** Smooth camera transition toward the selected node. */
function CameraRig({ selectedId, positions, motion }) {
  const controls = useThree((s) => s.controls)
  const t = useRef(0)
  const desired = useMemo(() => new THREE.Vector3(), [])
  const origin = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    t.current = 0
  }, [selectedId])

  useFrame((state, delta) => {
    if (!controls) return
    t.current += delta
    const k = motion ? 0.06 : 1
    const pos = selectedId ? positions.current[selectedId] : null
    if (pos) {
      controls.target.lerp(pos, k)
      if (t.current < 1.6) {
        desired.copy(pos).normalize().multiplyScalar(pos.length() + 3.4)
        desired.y += 1.4
        state.camera.position.lerp(desired, k)
      }
    } else if (t.current < 2) {
      controls.target.lerp(origin, k)
    }
    controls.update()
  })
  return null
}

export default function UniverseScene({ tools, selectedId, hoveredId, visibleIds, onSelect, onHover, accent, motionReduced, isLight, quality }) {
  const positions = useRef({})
  const pausedRef = useRef(false)
  pausedRef.current = !!selectedId || !!hoveredId
  const motion = motionReduced ? 0 : 1
  const low = quality === 'low'

  useEffect(() => () => {
    document.body.style.cursor = ''
  }, [])

  return (
    <Canvas
      dpr={[1, low ? 1.25 : 1.75]}
      camera={{ position: [0, 4.5, 11.5], fov: 50 }}
      gl={{ antialias: !low, alpha: true }}
      onPointerMissed={() => onSelect(null)}
    >
      <ambientLight intensity={isLight ? 0.9 : 0.35} />
      <pointLight position={[0, 0, 0]} intensity={45} color={accent.hex} distance={22} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} />

      <Orb color={accent.hex} color2={accent.hex2} motion={motion} intro={false} light={isLight} baseScale={0.45} />

      {ORBITS.map((o, i) => (
        <OrbitRing key={i} orbit={o} color={i === 1 ? accent.hex2 : accent.hex} light={isLight} />
      ))}

      {tools.map((tool, i) => {
        const orbit = ORBITS[i % ORBITS.length]
        const startAngle = (Math.floor(i / ORBITS.length) / 4) * Math.PI * 2 + i * 0.45
        return (
          <ToolNode
            key={tool.id}
            tool={tool}
            orbit={orbit}
            startAngle={startAngle}
            selected={selectedId === tool.id}
            hovered={hoveredId === tool.id}
            dimmed={!visibleIds.has(tool.id)}
            onSelect={onSelect}
            onHover={onHover}
            pausedRef={pausedRef}
            motion={motion}
            positions={positions}
            light={isLight}
          />
        )
      })}

      <Particles count={low ? 500 : 1400} color={accent.hex} radius={[8, 24]} size={0.06} motion={motion} light={isLight} fadeIn={false} opacity={0.7} />
      {!isLight && <Stars radius={70} depth={30} count={low ? 600 : 1800} factor={3} fade speed={motion} />}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={20}
        autoRotate={!selectedId && !!motion}
        autoRotateSpeed={0.35}
        maxPolarAngle={Math.PI * 0.85}
      />
      <CameraRig selectedId={selectedId} positions={positions} motion={motion} />
    </Canvas>
  )
}
