import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float, Stars, Cloud } from '@react-three/drei'
import { useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'

// 浮动卡片组件
function FloatingCard({ 
  position, 
  rotation, 
  color, 
  title, 
  delay = 0 
}: { 
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
  title: string
  delay?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.1
      meshRef.current.rotation.x = rotation[0] + Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.02
      meshRef.current.rotation.y = rotation[1] + Math.cos(state.clock.elapsedTime * 0.2 + delay) * 0.02
    }
  })

  return (
    <Float
      speed={2}
      rotationIntensity={0.3}
      floatIntensity={0.5}
    >
      <group position={position} rotation={rotation}>
        {/* 卡片主体 */}
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.1 : 1}
        >
          <boxGeometry args={[2.2, 1.4, 0.15]} />
          <meshPhysicalMaterial
            color={color}
            metalness={0.1}
            roughness={0.2}
            transmission={0.3}
            thickness={0.5}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
        
        {/* 卡片边框发光 */}
        <mesh position={[0, 0, 0.08]} scale={hovered ? 1.1 : 1}>
          <boxGeometry args={[2.25, 1.45, 0.05]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
          />
        </mesh>
        
        {/* 卡片标题 */}
        <Text
          position={[0, 0.3, 0.1]}
          fontSize={0.25}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/notosanssc/v36/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYxNbPzS5CHYo3zVmQ-Hdy0fPLjRlGq7M__t.woff2"
        >
          {title}
        </Text>
        
        {/* 装饰线条 */}
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[1.5, 0.02]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      </group>
    </Float>
  )
}

// 中心岛屿
function CentralIsland() {
  const islandRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (islandRef.current) {
      islandRef.current.rotation.y += 0.002
    }
  })

  return (
    <group ref={islandRef}>
      {/* 岛屿底座 */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[4, 5, 1.5, 64]} />
        <meshStandardMaterial
          color="#ffb6c1"
          roughness={0.8}
        />
      </mesh>
      
      {/* 草地层 */}
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[3.8, 3.8, 0.3, 64]} />
        <meshStandardMaterial
          color="#90EE90"
          roughness={0.9}
        />
      </mesh>
      
      {/* 中心水晶柱 */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.8, 1, 3, 32]} />
        <meshPhysicalMaterial
          color="#ff69b4"
          metalness={0.3}
          roughness={0.1}
          transmission={0.6}
          thickness={2}
          emissive="#ff1493"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* 发光核心 */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
        />
        <pointLight color="#ff69b4" intensity={2} distance={10} />
      </mesh>
    </group>
  )
}

// 浮动粒子
function FloatingParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  
  const particleCount = 200
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ff99cc"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

// 返回按钮
function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <div 
      className="absolute top-6 left-6 z-50 cursor-pointer group"
      onClick={onBack}
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 transition-all duration-300 group-hover:bg-white/30 group-hover:scale-105">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-white text-sm font-medium">返回 2D 模式</span>
      </div>
    </div>
  )
}

export default function FloatingIslandHome({ onBack }: { onBack: () => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-full h-full bg-gradient-to-b from-pink-200 to-purple-200" />
  }

  // 卡片数据
  const cards = [
    { position: [-5, 2, -2] as [number, number, number], rotation: [0.1, 0.3, -0.05] as [number, number, number], color: '#ff99cc', title: '最新文章', delay: 0 },
    { position: [5, 1.5, -1] as [number, number, number], rotation: [0.05, -0.2, 0.03] as [number, number, number], color: '#dda0dd', title: '文章归档', delay: 0.5 },
    { position: [-4, -1, 2] as [number, number, number], rotation: [-0.1, 0.4, 0.05] as [number, number, number], color: '#87ceeb', title: '标签云', delay: 1 },
    { position: [4, -0.5, 3] as [number, number, number], rotation: [-0.05, -0.3, -0.03] as [number, number, number], color: '#f0e68c', title: '精选合集', delay: 1.5 },
    { position: [0, 3.5, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], color: '#ffb6c1', title: '关于我', delay: 2 },
  ]

  return (
    <div className="relative w-full h-[100dvh] h-screen overflow-hidden">
      <BackButton onBack={onBack} />
      
      <Canvas
        camera={{ position: [0, 3, 12], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'linear-gradient(to bottom, #ffd1dc 0%, #e6e6fa 50%, #ffb6c1 100%)' }}
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[0, 5, 0]} intensity={1.5} color="#ff69b4" />
        <pointLight position={[-5, 3, 5]} intensity={0.8} color="#dda0dd" />
        <pointLight position={[5, 3, -5]} intensity={0.8} color="#87ceeb" />
        
        <CentralIsland />
        
        {cards.map((card, index) => (
          <FloatingCard
            key={index}
            position={card.position}
            rotation={card.rotation}
            color={card.color}
            title={card.title}
            delay={card.delay}
          />
        ))}
        
        <FloatingParticles />
        
        <Stars
          radius={50}
          depth={50}
          count={500}
          factor={4}
          saturation={0.5}
          fade
          speed={0.5}
        />
        
        <Cloud
          position={[-8, 6, -10]}
          speed={0.2}
          opacity={0.6}
          color="#ffffff"
        />
        <Cloud
          position={[8, 5, -8]}
          speed={0.15}
          opacity={0.5}
          color="#fff0f5"
        />
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={8}
          maxDistance={20}
          enableDamping
          dampingFactor={0.05}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
      
      {/* 底部提示 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm pointer-events-none">
        拖拽旋转视角 • 滚轮缩放
      </div>
    </div>
  )
}
