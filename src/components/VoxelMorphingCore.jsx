import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Environment } from '@react-three/drei';
import * as THREE from 'three';

const EMOJIS = ["ᗜ ᴗ ᗜ", "ᗜ ⩊ ᗜ", "ᗜ ⌓ ᗜ", "ᗜ ▵ ᗜ"];

// 从 Canvas 提取像素数据
function extractPixelsFromText(text, fontSize = 60) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  ctx.font = `bold ${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  const metrics = ctx.measureText(text);
  const width = Math.ceil(metrics.width);
  const height = Math.ceil(fontSize * 1.2);
  
  canvas.width = width;
  canvas.height = height;
  
  ctx.font = `bold ${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = [];
  const step = 3;
  
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      const alpha = imageData.data[index + 3];
      
      if (alpha > 128) {
        pixels.push({
          x: (x - width / 2) * 0.06,
          y: -(y - height / 2) * 0.06,
          z: 0
        });
      }
    }
  }
  
  return pixels;
}

// 单个粒子组件
function VoxelParticle({ position, targetPosition, isMorphing, morphProgress, time }) {
  const meshRef = useRef();
  const randomOffset = useMemo(() => ({
    x: (Math.random() - 0.5) * 6,
    y: (Math.random() - 0.5) * 6,
    z: (Math.random() - 0.5) * 8
  }), []);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    let finalX, finalY, finalZ;
    
    if (isMorphing) {
      // 散聚动画 - 从当前位置向目标位置过渡，同时爆炸散开
      const t = morphProgress;
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad
      
      // 爆炸阶段 (0-0.5) 和收敛阶段 (0.5-1)
      const explodeFactor = Math.sin(t * Math.PI); // 在 0.5 时达到峰值
      
      finalX = position.x + (targetPosition.x - position.x) * easeT + randomOffset.x * explodeFactor * 0.5;
      finalY = position.y + (targetPosition.y - position.y) * easeT + randomOffset.y * explodeFactor * 0.5;
      finalZ = position.z + (targetPosition.z - position.z) * easeT + randomOffset.z * explodeFactor;
    } else {
      // 静止状态 - 呼吸波浪效果
      finalX = targetPosition.x;
      finalY = targetPosition.y;
      
      // Z轴波浪：基于 X 坐标和时间的正弦波
      const waveZ = Math.sin(targetPosition.x * 0.8 + state.clock.elapsedTime * 1.5) * 0.4 +
                    Math.cos(targetPosition.y * 0.6 + state.clock.elapsedTime * 1.2) * 0.3;
      finalZ = targetPosition.z + waveZ;
    }
    
    meshRef.current.position.set(finalX, finalY, finalZ);
    
    // 轻微的旋转动画，增加生动感
    meshRef.current.rotation.x = Math.sin(time * 0.5 + finalX) * 0.1;
    meshRef.current.rotation.y = Math.cos(time * 0.3 + finalY) * 0.1;
  });
  
  return (
    <RoundedBox
      ref={meshRef}
      args={[0.09, 0.09, 0.09]}
      radius={0.02}
      smoothness={4}
    >
      <meshPhysicalMaterial
        color="#c084fc"
        transmission={0.5}
        opacity={1}
        roughness={0.2}
        metalness={0.1}
        ior={1.5}
        thickness={0.5}
        clearcoat={0.8}
        clearcoatRoughness={0.1}
        attenuationColor="#e9d5ff"
        attenuationDistance={2}
      />
    </RoundedBox>
  );
}

// 颜文字粒子系统
function VoxelEmojiSystem() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isMorphing, setIsMorphing] = useState(false);
  const [morphProgress, setMorphProgress] = useState(0);
  const timeRef = useRef(0);
  const lastSwitchTime = useRef(0);
  
  // 提取所有表情的像素数据
  const allPixels = useMemo(() => {
    return EMOJIS.map(emoji => extractPixelsFromText(emoji));
  }, []);
  
  // 获取最大粒子数，不足的用随机位置填充
  const maxCount = useMemo(() => {
    return Math.max(...allPixels.map(p => p.length));
  }, [allPixels]);
  
  // 标准化像素数组，确保所有表情有相同数量的粒子
  const normalizedPixels = useMemo(() => {
    return allPixels.map(pixels => {
      const result = [...pixels];
      // 如果粒子不足，添加随机分布的填充粒子
      while (result.length < maxCount) {
        result.push({
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 8,
          z: (Math.random() - 0.5) * 4
        });
      }
      return result;
    });
  }, [allPixels, maxCount]);
  
  // 当前显示的目标位置
  const currentPixels = normalizedPixels[currentIndex];
  const nextPixels = normalizedPixels[nextIndex];
  
  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
    
    // 检查是否需要切换表情（每4-5秒）
    if (!isMorphing && state.clock.elapsedTime - lastSwitchTime.current > 4.5) {
      setIsMorphing(true);
      setMorphProgress(0);
    }
    
    // 处理散聚动画
    if (isMorphing) {
      setMorphProgress(prev => {
        const newProgress = prev + 0.016; // 约60fps
        if (newProgress >= 1) {
          // 动画完成，切换到下一个表情
          setCurrentIndex(nextIndex);
          setNextIndex((nextIndex + 1) % EMOJIS.length);
          setIsMorphing(false);
          lastSwitchTime.current = state.clock.elapsedTime;
          return 0;
        }
        return newProgress;
      });
    }
  });
  
  return (
    <group>
      {currentPixels.map((pixel, i) => (
        <VoxelParticle
          key={i}
          position={pixel}
          targetPosition={isMorphing ? nextPixels[i] : currentPixels[i]}
          isMorphing={isMorphing}
          morphProgress={morphProgress}
          time={timeRef.current}
        />
      ))}
    </group>
  );
}

// 场景组件
function Scene() {
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.5} />
      
      {/* 主光源 - 淡紫色 */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        color="#f0abfc"
      />
      
      {/* 补光 - 淡蓝色 */}
      <pointLight
        position={[-10, -10, 5]}
        intensity={0.6}
        color="#7dd3fc"
      />
      
      {/* 背光 - 淡粉色 */}
      <pointLight
        position={[0, 5, -10]}
        intensity={0.5}
        color="#f9a8d4"
      />
      
      {/* 环境反射 */}
      <Environment preset="city" />
      
      {/* 颜文字粒子系统 */}
      <VoxelEmojiSystem />
      
      {/* 受限的轨道控制器 */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.5}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  );
}

// 主组件
export default function VoxelMorphingCore() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
