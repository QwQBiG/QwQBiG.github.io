import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 加载动画组件
function LoadingSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-full h-full max-w-[120px] max-h-[120px]">
        {/* 外圈脉冲动画 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 animate-ping"></div>
        {/* 中间旋转环 */}
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-400 border-r-pink-400 animate-spin"></div>
        {/* 内部脉冲点 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <span className="text-xs text-gray-500 animate-pulse">加载中...</span>
      </div>
    </div>
  );
}

// 3D 甜甜圈组件
function Donut() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <mesh ref={meshRef} scale={1.2}>
        <torusGeometry args={[1, 0.4, 32, 64]} />
        <MeshDistortMaterial
          color="#c084fc"
          emissive="#a855f7"
          emissiveIntensity={0.2}
          roughness={0.2}
          metalness={0.8}
          distort={0.2}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

// 3D 立方体组件（备选）
function Cube() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <mesh ref={meshRef} scale={1.5}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#3b82f6"
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}

// 粒子背景
function Particles() {
  const points = useRef();
  const particleCount = 50;
  
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// 主场景组件
function Scene({ shape = 'donut' }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c084fc" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#60a5fa" />
      
      {shape === 'donut' ? <Donut /> : <Cube />}
      <Particles />
      
      <Environment preset="city" />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// 主组件
export default function ThreeAvatar({ 
  shape = 'donut',
  className = '',
  style = {}
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // 模拟加载延迟，确保 3D 场景准备就绪
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-full h-full ${className}`}
        style={style}
      >
        <span className="text-gray-500 text-xs md:text-sm">3D 加载失败</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full h-full ${className}`}
      style={{
        ...style,
        overflow: 'hidden',
      }}
    >
      {/* Loading 骨架屏 */}
      {isLoading && <LoadingSkeleton />}
      
      {/* 3D Canvas - 使用 w-full h-full 贴合父级 */}
      <div 
        className={`w-full h-full transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: 'high-performance'
          }}
          dpr={[1, 2]}
          onError={() => setHasError(true)}
          style={{ width: '100%', height: '100%' }}
        >
          <Scene shape={shape} />
        </Canvas>
      </div>
      
      {/* 底部渐变遮罩 */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(255,255,255,0.3), transparent)'
        }}
      />
    </div>
  );
}
