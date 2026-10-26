import { Canvas } from '@react-three/fiber'
import Orb from './Orb'
import Particles from './Particles'

/** Small audio-reactive orb used in the Workspace side panel. */
export default function AudioOrbScene({ levelRef, accent, motionReduced, isLight }) {
  const motion = motionReduced ? 0.15 : 1
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 7], fov: 45 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={isLight ? 0.9 : 0.4} />
      <directionalLight position={[3, 3, 5]} intensity={0.8} />
      <directionalLight position={[-4, 2, -3]} intensity={2} color={accent.hex2} />
      <pointLight position={[0, 0, 4]} intensity={18} color={accent.hex} />
      <Orb color={accent.hex} color2={accent.hex2} motion={motion} intro={false} levelRef={levelRef} light={isLight} baseScale={0.85} />
      <Particles count={260} color={accent.hex} radius={[3, 5.5]} size={0.05} motion={motion} light={isLight} fadeIn={false} opacity={0.7} />
    </Canvas>
  )
}
