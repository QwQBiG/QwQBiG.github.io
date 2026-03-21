import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Sparkles, Stars } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

interface Props {
  onEnter3D: () => void
}

// 3D球体组件
function Orb({ onRotateEnough }: { onRotateEnough: () => void }) {
  const orbRef = useRef<THREE.Group>(null)
  const [hasTriggered, setHasTriggered] = useState(false)
  const rotationRef = useRef(0)

  useFrame((state) => {
    if (orbRef.current && !hasTriggered) {
      rotationRef.current = orbRef.current.rotation.y
      // 检测旋转角度（转够约2圈就触发）
      if (Math.abs(rotationRef.current) > Math.PI * 3.5) {
        setHasTriggered(true)
        onRotateEnough()
      }
    }
  })

  return (
    <group ref={orbRef}>
      {/* 外层光晕 */}
      <mesh>
        <sphereGeometry args={[3.2, 64, 64]} />
        <meshBasicMaterial
          color="#ff99cc"
          transparent
          opacity={0.15}
        />
      </mesh>
      
      {/* 主球体 */}
      <mesh>
        <sphereGeometry args={[2.8, 64, 64]} />
        <meshPhysicalMaterial
          color="#ffb6c1"
          emissive="#ff69b4"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.1}
          thickness={0.5}
        />
      </mesh>
      
      {/* 内层发光核心 */}
      <mesh>
        <sphereGeometry args={[2.4, 32, 32]} />
        <meshBasicMaterial
          color="#ffc0cb"
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* 3D 环绕文字 */}
      <Text
        position={[0, 0.5, 3.2]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/notosanssc/v36/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYxNbPzS5CHYo3zVmQ-Hdy0fPLjRlGq7M__t.woff2"
      >
        iqwqi's World
      </Text>
      
      <Text
        position={[0, -0.3, 3.2]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        opacity={0.8}
      >
        转动进入 3D 世界
      </Text>
    </group>
  )
}

// 粒子系统
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)
  
  const particles = useRef(
    Array.from({ length: 100 }, () => ({
      x: (Math.random() - 0.5) * 15,
      y: (Math.random() - 0.5) * 15,
      z: (Math.random() - 0.5) * 15,
      speed: 0.002 + Math.random() * 0.003
    }))
  )

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001
      pointsRef.current.rotation.x += 0.0005
    }
  })

  const positions = new Float32Array(particles.current.length * 3)
  particles.current.forEach((p, i) => {
    positions[i * 3] = p.x
    positions[i * 3 + 1] = p.y
    positions[i * 3 + 2] = p.z
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.current.length}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ff99cc"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

export default function CentralOrbPortal({ onEnter3D }: Props) {
  const [hasRotatedEnough, setHasRotatedEnough] = useState(false)
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    // 5秒后隐藏提示
    const timer = setTimeout(() => setShowHint(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleRotateEnough = () => {
    if (!hasRotatedEnough) {
      setHasRotatedEnough(true)
      // 延迟触发，让用户看到完成旋转
      setTimeout(() => {
        onEnter3D()
      }, 800)
    }
  }

  return (
    <div className="relative w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
      >
        <ambientLight intensity={0.6} />
        <pointLight color="#ff69b4" position={[5, 5, 5]} intensity={1.2} />
        <pointLight color="#dda0dd" position={[-5, -3, 3]} intensity={0.8} />
        <pointLight color="#e6e6fa" position={[0, -5, 5]} intensity={0.6} />
        
        <Orb onRotateEnough={handleRotateEnough} />
        <ParticleField />
        
        <Sparkles 
          count={80} 
          size={3} 
          color="#ff99cc" 
          scale={8}
          speed={0.4}
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minDistance={6}
          maxDistance={10}
          autoRotate={!hasRotatedEnough}
          autoRotateSpeed={1.2}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* 提示文字 */}
      {showHint && !hasRotatedEnough && (
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium pointer-events-none transition-opacity duration-500"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        >
          ← 拖拽旋转球体进入 3D 世界 →
        </div>
      )}

      {/* 旋转完成提示 */}
      {hasRotatedEnough && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
            animation: 'fadeIn 0.5s ease-out'
          }}
        >
          <div className="text-white text-xl font-bold drop-shadow-lg">
            正在进入 3D 世界...
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.05); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
