import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Environment } from '@react-three/drei';
import * as THREE from 'three';

const EMOJIS = ["ᗜ ᴗ ᗜ", "ᗜ ⩊ ᗜ", "ᗜ ⌓ ᗜ", "ᗜ ▵ ᗜ"];

// 从 Canvas 提取像素数据并生成体素位置
function extractPixelsFromText(text, fontSize = 60) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 设置字体并测量文本
  ctx.font = `bold ${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  const metrics = ctx.measureText(text);
  const width = Math.ceil(metrics.width);
  const height = Math.ceil(fontSize * 1.2);
  
  canvas.width = width;
  canvas.height = height;
  
  // 重新设置字体（canvas resize 后需要重新设置）
  ctx.font = `bold ${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  // 提取像素数据
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = [];
  
  // 采样步长（控制体素密度）
  const step = 3;
  
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      const alpha = imageData.data[index + 3];
      
      if (alpha > 128) {
        // 将像素坐标转换为 3D 空间坐标
        // 居中并翻转 Y 轴
        pixels.push({
          x: (x - width / 2) * 0.08,
          y: -(y - height / 2) * 0.08,
          z: 0
        });
      }
    }
  }
  
  return pixels;
}

// 体素表情组件
function VoxelEmoji({ emojiIndex, onCompleteRotation }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [pixels, setPixels] = useState([]);
  const rotationCount = useRef(0);
  const lastRotation = useRef(0);
  
  // 当表情变化时重新提取像素
  useEffect(() => {
    const newPixels = extractPixelsFromText(EMOJIS[emojiIndex]);
    setPixels(newPixels);
  }, [emojiIndex]);
  
  // 创建 InstancedMesh 的矩阵 - 曲面映射
  const { matrices, count } = useMemo(() => {
    const matrices = [];
    const dummy = new THREE.Object3D();
    
    // 曲面参数 - 颜文字在球体外围，半径必须大于核心球
    const radius = 10; // 颜文字曲面半径（大于核心球半径 5.5）
    const arcAngle = Math.PI * 0.8; // 弯曲弧度（约144度，不是完整的半圆）
    
    // 计算像素范围的边界
    const xValues = pixels.map(p => p.x);
    const yValues = pixels.map(p => p.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const xRange = maxX - minX || 1;
    const yRange = maxY - minY || 1;
    const yCenter = (minY + maxY) / 2;
    
    pixels.forEach((pixel, i) => {
      // 将 x 坐标归一化到 [-0.5, 0.5]，然后映射到弧度 [-arcAngle/2, arcAngle/2]
      const normalizedX = (pixel.x - minX) / xRange - 0.5;
      const angleX = normalizedX * arcAngle;
      
      // 圆柱面贴合计算
      // x -> 圆柱面上的角度
      // y -> 保持垂直高度（可以加上轻微的球面弯曲）
      // z -> 从圆心向外的距离
      const newX = Math.sin(angleX) * radius;
      const newZ = Math.cos(angleX) * radius;
      
      // 添加轻微的垂直球面弯曲，让整体更像球面的一部分
      const normalizedY = (pixel.y - yCenter) / (yRange / 2);
      const verticalBend = Math.cos(normalizedY * Math.PI * 0.3) * 0.3; // 轻微的垂直弯曲因子
      const adjustedRadius = radius * (1 - verticalBend * 0.2);
      
      const finalX = Math.sin(angleX) * adjustedRadius;
      const finalZ = Math.cos(angleX) * adjustedRadius;
      const finalY = pixel.y;
      
      // 设置位置
      dummy.position.set(finalX, finalY, finalZ);
      
      // 让方块朝向圆心外侧（法线垂直于曲面）
      // lookAt(0, finalY, 0) 会让方块朝向圆柱轴线
      dummy.lookAt(0, finalY, 0);
      // 翻转 180 度让正面朝外
      dummy.rotateY(Math.PI);
      
      // 设置缩放
      dummy.scale.set(0.08, 0.08, 0.08);
      
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    });
    
    return { matrices, count: pixels.length };
  }, [pixels]);
  
  // 更新 InstancedMesh
  useEffect(() => {
    if (meshRef.current && matrices.length > 0) {
      matrices.forEach((matrix, i) => {
        meshRef.current.setMatrixAt(i, matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [matrices]);
  
  // 自转和表情切换逻辑
  useFrame((state, delta) => {
    if (groupRef.current) {
      // 匀速自转
      groupRef.current.rotation.y += delta * 0.8;
      
      // 检测是否完成一整圈
      const currentRotation = groupRef.current.rotation.y;
      const rotationDiff = currentRotation - lastRotation.current;
      
      // 当旋转超过 2π 时，切换表情
      if (rotationDiff >= Math.PI * 2) {
        rotationCount.current += 1;
        lastRotation.current = currentRotation;
        onCompleteRotation();
      }
    }
  });
  
  if (count === 0) return null;
  
  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#c084fc"
          emissive="#a855f7"
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.1}
        />
      </instancedMesh>
    </group>
  );
}

// 核心能量球组件
function CoreSphere() {
  return (
    <group>
      {/* 核心水晶球 */}
      <Sphere args={[5.5, 64, 64]} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#e9d5ff"
          transmission={1}
          opacity={1}
          roughness={0.2}
          ior={1.5}
          thickness={2}
          specularIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          attenuationColor="#c084fc"
          attenuationDistance={5}
        />
      </Sphere>
      
      {/* 内部发光点光源 - 淡紫色能量光晕 */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2}
        color="#d8b4fe"
        distance={15}
        decay={2}
      />
      
      {/* 稍微偏移的第二光源，增加层次感 */}
      <pointLight
        position={[1, 1, 1]}
        intensity={1}
        color="#f9a8d4"
        distance={10}
        decay={2}
      />
    </group>
  );
}

// 场景组件
function Scene() {
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);
  
  const handleRotationComplete = () => {
    setCurrentEmojiIndex((prev) => (prev + 1) % EMOJIS.length);
  };
  
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.6} />
      
      {/* 主光源 */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        color="#f0abfc"
      />
      
      {/* 补光 - 淡蓝色 */}
      <pointLight
        position={[-10, -10, -5]}
        intensity={0.8}
        color="#7dd3fc"
      />
      
      {/* 背光 - 淡粉色 */}
      <pointLight
        position={[0, 5, -10]}
        intensity={0.6}
        color="#f9a8d4"
      />
      
      {/* 环境反射 - 让玻璃球更高级 */}
      <Environment preset="city" />
      
      {/* 核心能量球 - 在颜文字下方渲染，但颜文字半径更大，会浮在外面 */}
      <CoreSphere />
      
      {/* 体素表情 - 围绕核心球旋转 */}
      <VoxelEmoji
        emojiIndex={currentEmojiIndex}
        onCompleteRotation={handleRotationComplete}
      />
      
      {/* 轨道控制器 */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.6}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI * 3 / 4}
      />
    </>
  );
}

// 主组件
export default function VoxelEmojiCore() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 18], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
