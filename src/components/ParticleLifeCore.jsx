import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const EMOJIS = ["ᗜ ᴗ ᗜ", "ᗜ ⩊ ᗜ", "ᗜ ⌓ ᗜ", "ᗜ ▵ ᗜ"];
const PARTICLE_COUNT = 800;

// 检测是否为移动端
function isMobile() {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

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
  
  // 如果像素不足，随机填充
  const result = [...validPixels];
  while (result.length < PARTICLE_COUNT) {
    if (validPixels.length > 0) {
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
  
  if (result.length > PARTICLE_COUNT) {
    const shuffled = result.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, PARTICLE_COUNT);
  }
  
  return result;
}

// 共享的粒子系统逻辑
function useParticleSystem(emojiIndex, isMobileDevice) {
  const pointsRef = useRef();
  const { viewport, mouse } = useThree();
  const [targetPositions, setTargetPositions] = useState([]);
  const [currentPositions, setCurrentPositions] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionProgress = useRef(0);
  const prevEmojiIndex = useRef(emojiIndex);
  const timeRef = useRef(0);
  const mouseInfluence = useRef(new THREE.Vector3(0, 0, 0));
  
  useEffect(() => {
    const pixels = extractPixelsForParticles(EMOJIS[emojiIndex]);
    setTargetPositions(pixels);
    setCurrentPositions(pixels);
  }, []);
  
  useEffect(() => {
    if (emojiIndex !== prevEmojiIndex.current) {
      const newPixels = extractPixelsForParticles(EMOJIS[emojiIndex]);
      setTargetPositions(newPixels);
      setIsTransitioning(true);
      transitionProgress.current = 0;
      prevEmojiIndex.current = emojiIndex;
    }
  }, [emojiIndex]);
  
  // 页面背景渐变色（与 CSS 同步）- 更柔和的蓝紫粉过渡
  const gradientColors = useMemo(() => [
    new THREE.Color(0.70, 0.50, 0.85),   // 柔和紫罗兰
    new THREE.Color(0.85, 0.55, 0.75),   // 紫粉色
    new THREE.Color(0.90, 0.60, 0.70),   // 柔和粉红
    new THREE.Color(0.65, 0.70, 0.90),   // 淡紫蓝
    new THREE.Color(0.55, 0.75, 0.95)    // 柔和天蓝
  ], []);
  
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
      
      const t = Math.random();
      colors[i * 3] = 0.55 + t * 0.25;
      colors[i * 3 + 1] = 0.30 + t * 0.25;
      colors[i * 3 + 2] = 0.65 + t * 0.25;
      
      sizes[i] = isMobileDevice ? 0.16 + Math.random() * 0.09 : 0.19 + Math.random() * 0.12;
      indices[i] = i / PARTICLE_COUNT;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('particleIndex', new THREE.BufferAttribute(indices, 1));
    
    return geo;
  }, [isMobileDevice]);
  
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
        
        vec3 getGradientColor(float t) {
          // 使用平滑的连续渐变，避免分段造成的硬边
          vec3 c1 = mix(uColor1, uColor2, smoothstep(0.0, 0.25, t));
          vec3 c2 = mix(uColor2, uColor3, smoothstep(0.25, 0.5, t));
          vec3 c3 = mix(uColor3, uColor4, smoothstep(0.5, 0.75, t));
          vec3 c4 = mix(uColor4, uColor5, smoothstep(0.75, 1.0, t));
          
          // 混合所有阶段
          vec3 c = mix(mix(c1, c2, step(0.25, t)), mix(c3, c4, step(0.75, t)), step(0.5, t));
          return c * 0.85;
        }
        
        void main() {
          // 使用更平滑的呼吸周期，增加噪声让颜色分布更随机
          float breathCycle = sin(uTime * 0.3) * 0.5 + 0.5;
          float noise = fract(sin(particleIndex * 12.9898) * 43758.5453);
          float colorT = fract(noise * 0.3 + breathCycle + particleIndex * 0.02);
          vColor = getGradientColor(colorT);
          
          vec3 pos = position;
          
          float breathe = sin(uTime * ${isMobileDevice ? '1.5' : '2.0'} + pos.x * ${isMobileDevice ? '2.0' : '3.0'} + pos.y * ${isMobileDevice ? '1.5' : '2.0'}) * ${isMobileDevice ? '0.06' : '0.08'};
          pos.z += breathe;
          
          float dist = distance(pos.xy, uMouse.xy);
          float attractStrength = smoothstep(${isMobileDevice ? '4.0' : '5.0'}, 0.0, dist) * ${isMobileDevice ? '0.3' : '0.5'};
          vec3 attractDir = normalize(uMouse - pos);
          pos += attractDir * attractStrength;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (${isMobileDevice ? '250.0' : '330.0'} / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          
          // 移动端使用更柔和的渲染，避免过曝
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, ${isMobileDevice ? '3.0' : '1.0'});
          
          // 移动端大幅降低亮度
          vec3 finalColor = vColor * ${isMobileDevice ? '1.43' : '(0.7 + 0.3 * (1.0 - dist))'};
          gl_FragColor = vec4(finalColor, alpha * ${isMobileDevice ? '0.8' : '0.85'});
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, [gradientColors, isMobileDevice]);
  
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    timeRef.current = state.clock.elapsedTime;
    material.uniforms.uTime.value = timeRef.current;
    
    const mouseX = mouse.x * viewport.width * 0.5;
    const mouseY = mouse.y * viewport.height * 0.5;
    
    mouseInfluence.current.x += (mouseX - mouseInfluence.current.x) * (isMobileDevice ? 0.03 : 0.05);
    mouseInfluence.current.y += (mouseY - mouseInfluence.current.y) * (isMobileDevice ? 0.03 : 0.05);
    material.uniforms.uMouse.value.set(mouseInfluence.current.x, mouseInfluence.current.y, 0);
    
    const positions = pointsRef.current.geometry.attributes.position.array;
    
    if (isTransitioning) {
      transitionProgress.current += isMobileDevice ? 0.025 : 0.016;
      const t = Math.min(transitionProgress.current, 1);
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const explodePhase = Math.sin(t * Math.PI);
      
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const current = currentPositions[i] || { x: 0, y: 0, z: 0 };
        const target = targetPositions[i] || { x: 0, y: 0, z: 0 };
        
        const randomOffsetX = (Math.random() - 0.5) * explodePhase * (isMobileDevice ? 2 : 3);
        const randomOffsetZ = (Math.random() - 0.5) * explodePhase * (isMobileDevice ? 4 : 6);
        
        positions[i * 3] = current.x + (target.x - current.x) * easeT + randomOffsetX * 0.5;
        positions[i * 3 + 1] = current.y + (target.y - current.y) * easeT + (Math.random() - 0.5) * explodePhase * (isMobileDevice ? 2 : 3) * 0.5;
        positions[i * 3 + 2] = current.z + (target.z - current.z) * easeT + randomOffsetZ;
      }
      
      if (t >= 1) {
        setIsTransitioning(false);
        setCurrentPositions(targetPositions);
      }
    } else {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const target = targetPositions[i] || { x: 0, y: 0, z: 0 };
        
        const noiseX = noise(target.x * 0.5, target.y * 0.5, timeRef.current * (isMobileDevice ? 0.4 : 0.5)) * (isMobileDevice ? 0.1 : 0.15);
        const noiseY = noise(target.y * 0.5, target.x * 0.5, timeRef.current * (isMobileDevice ? 0.25 : 0.3) + 100) * (isMobileDevice ? 0.1 : 0.15);
        const noiseZ = noise(target.z * 0.5, target.x * 0.5, timeRef.current * (isMobileDevice ? 0.2 : 0.25) + 200) * (isMobileDevice ? 0.05 : 0.08);
        const breathe = Math.sin(timeRef.current * (isMobileDevice ? 1.5 : 2.0) + target.x * (isMobileDevice ? 2 : 3)) * (isMobileDevice ? 0.04 : 0.05);
        
        positions[i * 3] = target.x + noiseX;
        positions[i * 3 + 1] = target.y + noiseY;
        positions[i * 3 + 2] = target.z + noiseZ + breathe;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return { pointsRef, geometry, material, isTransitioning };
}

// 粒子组件
function ParticleSystem({ emojiIndex, isMobileDevice }) {
  const { pointsRef, geometry, material } = useParticleSystem(emojiIndex, isMobileDevice);
  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

// 自适应 Bloom 组件 - 使用 mipmap 模糊来模拟光晕
function AdaptiveBloom() {
  const { camera } = useThree();
  const [bloomIntensity, setBloomIntensity] = useState(0.6);
  
  useFrame(() => {
    // 根据相机距离动态调整 Bloom 强度
    // 相机距离越近（放大），Bloom 强度越低，防止过曝
    // 相机距离越远（缩小），Bloom 强度越高，保持可见性
    const distance = camera.position.z;
    const baseIntensity = 0.6;
    const adaptiveIntensity = baseIntensity * (distance / 8); // 8 是默认相机距离
    const clampedIntensity = Math.max(0.25, Math.min(0.8, adaptiveIntensity));
    
    if (Math.abs(bloomIntensity - clampedIntensity) > 0.01) {
      setBloomIntensity(clampedIntensity);
    }
  });
  
  return (
    <Bloom
      intensity={bloomIntensity}
      luminanceThreshold={0.45}
      luminanceSmoothing={0.85}
      height={300}
    />
  );
}

// 桌面端场景
function DesktopScene() {
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);
  const lastSwitchTime = useRef(0);
  
  useFrame((state) => {
    if (state.clock.elapsedTime - lastSwitchTime.current > 4) {
      setCurrentEmojiIndex((prev) => (prev + 1) % EMOJIS.length);
      lastSwitchTime.current = state.clock.elapsedTime;
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#f0abfc" />
      <pointLight position={[-10, -10, 5]} intensity={0.6} color="#7dd3fc" />
      <pointLight position={[0, 5, -10]} intensity={0.6} color="#f9a8d4" />
      
      <Environment preset="city" />
      
      <ParticleSystem emojiIndex={currentEmojiIndex} isMobileDevice={false} />
      
      <EffectComposer>
        <AdaptiveBloom />
      </EffectComposer>
      
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

// 移动端场景 - 保留核心效果，移除后处理
function MobileScene() {
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);
  const lastSwitchTime = useRef(0);
  
  useFrame((state) => {
    if (state.clock.elapsedTime - lastSwitchTime.current > 4) {
      setCurrentEmojiIndex((prev) => (prev + 1) % EMOJIS.length);
      lastSwitchTime.current = state.clock.elapsedTime;
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#f0abfc" />
      <pointLight position={[-5, -5, 3]} intensity={0.5} color="#7dd3fc" />
      
      {/* 移动端不使用 Environment 和 EffectComposer，但保留核心粒子效果 */}
      <ParticleSystem emojiIndex={currentEmojiIndex} isMobileDevice={true} />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.3}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
        minPolarAngle={Math.PI / 2.2}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  );
}

// 主组件
export default function ParticleLifeCore() {
  const [mobile, setMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    setMobile(isMobile());
    
    const handleResize = () => {
      setMobile(isMobile());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 服务端渲染时不渲染 Canvas
  if (!mounted) {
    return <div className="w-full h-full bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full" />;
  }
  
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, mobile ? 12 : 8], fov: mobile ? 65 : 60 }}
        gl={{ 
          antialias: !mobile, 
          alpha: true,
          powerPreference: mobile ? "low-power" : "high-performance"
        }}
        style={{ background: 'transparent' }}
        dpr={mobile ? 1 : (typeof window !== 'undefined' ? window.devicePixelRatio : 1)}
      >
        {mobile ? <MobileScene /> : <DesktopScene />}
      </Canvas>
    </div>
  );
}
