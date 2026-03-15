import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const EMOJIS = ["ᗜ ᴗ ᗜ", "ᗜ ⩊ ᗜ", "ᗜ ⌓ ᗜ", "ᗜ ▵ ᗜ"];
const PARTICLE_COUNT = 800;

// 简化的 Perlin Noise 实现
function noise(x, y, z) {
  return Math.sin(x * 0.5) * Math.cos(y * 0.5) * Math.sin(z * 0.5 + x * 0.3);
}

// 从 Canvas 提取像素数据并生成粒子位置
function extractPixelsForParticles(text, fontSize = 80) {
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
  const validPixels = [];
  const step = 3;
  
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      const alpha = imageData.data[index + 3];
      
      if (alpha > 128) {
        validPixels.push({
          x: (x - width / 2) * 0.04,
          y: -(y - height / 2) * 0.04,
          z: 0
        });
      }
    }
  }
  
  // 如果像素不足，随机填充到 2000 个
  const result = [...validPixels];
  while (result.length < PARTICLE_COUNT) {
    if (validPixels.length > 0) {
      // 在已有像素附近随机分布
      const base = validPixels[Math.floor(Math.random() * validPixels.length)];
      result.push({
        x: base.x + (Math.random() - 0.5) * 0.5,
        y: base.y + (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.3
      });
    } else {
      result.push({
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 6,
        z: (Math.random() - 0.5) * 2
      });
    }
  }
  
  // 如果像素过多，随机采样
  if (result.length > PARTICLE_COUNT) {
    const shuffled = result.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, PARTICLE_COUNT);
  }
  
  return result;
}

// 粒子生命体组件
function ParticleLife({ emojiIndex }) {
  const pointsRef = useRef();
  const { viewport, mouse } = useThree();
  const [targetPositions, setTargetPositions] = useState([]);
  const [currentPositions, setCurrentPositions] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionProgress = useRef(0);
  const prevEmojiIndex = useRef(emojiIndex);
  const timeRef = useRef(0);
  const mouseInfluence = useRef(new THREE.Vector3(0, 0, 0));
  
  // 初始化位置
  useEffect(() => {
    const pixels = extractPixelsForParticles(EMOJIS[emojiIndex]);
    setTargetPositions(pixels);
    setCurrentPositions(pixels);
  }, []);
  
  // 表情切换时的过渡
  useEffect(() => {
    if (emojiIndex !== prevEmojiIndex.current) {
      const newPixels = extractPixelsForParticles(EMOJIS[emojiIndex]);
      setTargetPositions(newPixels);
      setIsTransitioning(true);
      transitionProgress.current = 0;
      prevEmojiIndex.current = emojiIndex;
    }
  }, [emojiIndex]);
  
  // 创建 BufferGeometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const indices = new Float32Array(PARTICLE_COUNT);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      
      // 深紫色/紫罗兰色，不使用白色
      const t = Math.random();
      colors[i * 3] = 0.4 + t * 0.25;      // R: 0.4-0.65 (降低红色)
      colors[i * 3 + 1] = 0.2 + t * 0.2;   // G: 0.2-0.4 (降低绿色)
      colors[i * 3 + 2] = 0.7 + t * 0.25;  // B: 0.7-0.95 (保持蓝色)
      
      sizes[i] = 0.18 + Math.random() * 0.12;
      indices[i] = i / PARTICLE_COUNT; // 0-1 的粒子索引
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('particleIndex', new THREE.BufferAttribute(indices, 1));
    
    return geo;
  }, []);
  
  // 页面背景渐变色（与 CSS 同步）- 增强饱和度
  const gradientColors = useMemo(() => [
    new THREE.Color(0.65, 0.45, 0.75),   // 深紫罗兰
    new THREE.Color(0.85, 0.50, 0.70),   // 玫红粉
    new THREE.Color(0.90, 0.45, 0.65),   // 桃红
    new THREE.Color(0.50, 0.65, 0.90),   // 紫蓝
    new THREE.Color(0.45, 0.60, 0.85)    // 深天蓝
  ], []);

  // 自定义 ShaderMaterial
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector3(0, 0, 0) },
        uColor1: { value: gradientColors[0] },
        uColor2: { value: gradientColors[1] },
        uColor3: { value: gradientColors[2] },
        uColor4: { value: gradientColors[3] },
        uColor5: { value: gradientColors[4] }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        attribute float particleIndex;
        varying vec3 vColor;
        uniform float uTime;
        uniform vec3 uMouse;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColor4;
        uniform vec3 uColor5;
        
        // 与页面背景同步的 15 秒呼吸周期
        vec3 getGradientColor(float t) {
          // t 在 0-1 之间循环，对应 background-position 的变化
          float phase = t * 4.0; // 0-4 对应 5 个色段的过渡
          
          vec3 c;
          if (phase < 1.0) {
            c = mix(uColor1, uColor2, phase);
          } else if (phase < 2.0) {
            c = mix(uColor2, uColor3, phase - 1.0);
          } else if (phase < 3.0) {
            c = mix(uColor3, uColor4, phase - 2.0);
          } else {
            c = mix(uColor4, uColor5, phase - 3.0);
          }
          
          // 降低亮度，避免发白，但保持饱和度
           return c * 0.85;
        }
        
        void main() {
          // 15 秒呼吸周期，与页面 CSS animation 同步
          float breathCycle = sin(uTime * 0.419) * 0.5 + 0.5; // 0-1 循环
          
          // 根据粒子索引和呼吸周期计算颜色
          float colorT = fract(particleIndex * 0.1 + breathCycle);
          vColor = getGradientColor(colorT);
          
          vec3 pos = position;
          
          // 添加呼吸波动效果
          float breathe = sin(uTime * 2.0 + pos.x * 3.0 + pos.y * 2.0) * 0.08;
          pos.z += breathe;
          
          // 鼠标吸引力场
          float dist = distance(pos.xy, uMouse.xy);
          float attractStrength = smoothstep(5.0, 0.0, dist) * 0.5;
          vec3 attractDir = normalize(uMouse - pos);
          pos += attractDir * attractStrength;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          // 创建圆形粒子
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          
          // 柔和的边缘，减少发光
          float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
          
          // 不使用额外的白色发光，保持原始颜色
           // 稍微降低亮度避免发白，但保持饱和度
           vec3 finalColor = vColor * 0.9;
           gl_FragColor = vec4(finalColor, alpha * 0.85);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, [gradientColors]);
  
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    timeRef.current = state.clock.elapsedTime;
    material.uniforms.uTime.value = timeRef.current;
    
    // 鼠标位置转换到 3D 空间
    const mouseX = mouse.x * viewport.width * 0.5;
    const mouseY = mouse.y * viewport.height * 0.5;
    
    // 平滑插值鼠标影响
    mouseInfluence.current.x += (mouseX - mouseInfluence.current.x) * 0.05;
    mouseInfluence.current.y += (mouseY - mouseInfluence.current.y) * 0.05;
    material.uniforms.uMouse.value.set(
      mouseInfluence.current.x,
      mouseInfluence.current.y,
      0
    );
    
    const positions = pointsRef.current.geometry.attributes.position.array;
    
    // 处理表情切换过渡
    if (isTransitioning) {
      transitionProgress.current += 0.02;
      const t = Math.min(transitionProgress.current, 1);
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      // 爆炸效果 - Z轴散开
      const explodePhase = Math.sin(t * Math.PI);
      
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const current = currentPositions[i] || { x: 0, y: 0, z: 0 };
        const target = targetPositions[i] || { x: 0, y: 0, z: 0 };
        
        // 基础插值
        const baseX = current.x + (target.x - current.x) * easeT;
        const baseY = current.y + (target.y - current.y) * easeT;
        const baseZ = current.z + (target.z - current.z) * easeT;
        
        // 添加爆炸散开
        const randomOffset = (Math.random() - 0.5) * explodePhase * 3;
        
        positions[i * 3] = baseX;
        positions[i * 3 + 1] = baseY;
        positions[i * 3 + 2] = baseZ + randomOffset;
      }
      
      if (t >= 1) {
        setIsTransitioning(false);
        setCurrentPositions(targetPositions);
      }
    } else {
      // 正常状态 - Perlin Noise 流动
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const target = targetPositions[i] || { x: 0, y: 0, z: 0 };
        
        // Perlin Noise 扰动
        const noiseX = noise(target.x * 0.5, target.y * 0.5, timeRef.current * 0.5) * 0.15;
        const noiseY = noise(target.y * 0.5, target.x * 0.5, timeRef.current * 0.3 + 100) * 0.15;
        const noiseZ = noise(timeRef.current * 0.2, target.x * 0.3, target.y * 0.3) * 0.2;
        
        // 呼吸效果
        const breathe = Math.sin(timeRef.current * 1.5 + target.x * 2) * 0.05;
        
        positions[i * 3] = target.x + noiseX;
        positions[i * 3 + 1] = target.y + noiseY;
        positions[i * 3 + 2] = target.z + noiseZ + breathe;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}

// 场景组件
function Scene() {
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);
  const lastSwitchTime = useRef(0);
  
  useFrame((state) => {
    // 每 4 秒切换一次表情
    if (state.clock.elapsedTime - lastSwitchTime.current > 4) {
      setCurrentEmojiIndex((prev) => (prev + 1) % EMOJIS.length);
      lastSwitchTime.current = state.clock.elapsedTime;
    }
  });
  
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.4} />
      
      {/* 主光源 */}
      <pointLight position={[10, 10, 10]} intensity={1} color="#f0abfc" />
      <pointLight position={[-10, -10, 5]} intensity={0.6} color="#7dd3fc" />
      
      {/* 环境反射 */}
      <Environment preset="city" />
      
      {/* 粒子生命体 */}
      <ParticleLife emojiIndex={currentEmojiIndex} />
      
      {/* 后处理辉光 - 降低强度 */}
      <EffectComposer>
        <Bloom
          intensity={0.6}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.8}
          height={300}
        />
      </EffectComposer>
      
      {/* 受限的轨道控制器 */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.4}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  );
}

// 检测是否为移动设备
function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 简化的粒子效果（移动端降级）
function SimpleParticleEmoji() {
  const pointsRef = useRef();
  const [emojiIndex, setEmojiIndex] = useState(0);
  const lastSwitchTime = useRef(0);
  
  // 提取像素（简化版）
  const pixels = useMemo(() => {
    return extractPixelsForParticles(EMOJIS[emojiIndex], 60);
  }, [emojiIndex]);
  
  // 创建几何体
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(pixels.length * 3);
    const colors = new Float32Array(pixels.length * 3);
    
    pixels.forEach((pixel, i) => {
      positions[i * 3] = pixel.x;
      positions[i * 3 + 1] = pixel.y;
      positions[i * 3 + 2] = pixel.z;
      
      // 粉紫色
      colors[i * 3] = 0.7;
      colors[i * 3 + 1] = 0.4;
      colors[i * 3 + 2] = 0.8;
    });
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [pixels]);
  
  // 简化材质
  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
  }, []);
  
  useFrame((state) => {
    // 缓慢旋转
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.005;
    }
    
    // 切换表情
    if (state.clock.elapsedTime - lastSwitchTime.current > 4) {
      setEmojiIndex((prev) => (prev + 1) % EMOJIS.length);
      lastSwitchTime.current = state.clock.elapsedTime;
    }
  });
  
  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

// 主组件
export default function ParticleLifeCore() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);
  
  // 移动端使用降级方案
  if (isMobile) {
    return (
      <div className="w-full h-full">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ 
            antialias: false,
            alpha: true,
            powerPreference: "low-power"
          }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.6} />
          <SimpleParticleEmoji />
        </Canvas>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
