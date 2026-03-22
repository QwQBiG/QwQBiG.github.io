import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// 抑制 THREE.Clock 弃用警告
const originalWarn = console.warn;
console.warn = function(...args: any[]) {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('THREE.THREE.Clock')) {
    return;
  }
  originalWarn.apply(console, args);
};

// 检测是否为触摸设备
const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

// 角色平面组件 - 带呼吸和视差效果 - 优化版本
function CharacterPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { mouse } = useThree();
  const frameCount = useRef(0);
  
  // 加载角色贴图
  const texture = useTexture('/images/character.png');
  
  // 获取图片原始宽高比
  const imageAspect = texture.image ? texture.image.width / texture.image.height : 1;
  
  // 鼠标位置平滑插值
  const mousePosition = useMemo(() => new THREE.Vector2(0, 0), []);
  const targetRotation = useMemo(() => new THREE.Vector2(0, 0), []);
  
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    
    // 触摸设备降低帧率以节省性能
    frameCount.current++;
    const skipFrames = isTouchDevice ? 2 : 1;
    if (frameCount.current % skipFrames !== 0) return;
    
    const time = state.clock.elapsedTime;
    
    // 平滑鼠标跟随 - 触摸设备使用更快的响应
    const lerpFactor = isTouchDevice ? 0.08 : 0.05;
    mousePosition.x += (mouse.x * 0.5 - mousePosition.x) * lerpFactor;
    mousePosition.y += (mouse.y * 0.5 - mousePosition.y) * lerpFactor;
    
    // 计算目标旋转（视差效果）- 触摸设备降低幅度
    const rotationScale = isTouchDevice ? 0.08 : 0.12;
    targetRotation.x = mousePosition.y * rotationScale;
    targetRotation.y = -mousePosition.x * rotationScale;
    
    // 应用旋转（平滑过渡）
    const rotationLerp = isTouchDevice ? 0.12 : 0.08;
    meshRef.current.rotation.x += (targetRotation.x - meshRef.current.rotation.x) * rotationLerp;
    meshRef.current.rotation.y += (targetRotation.y - meshRef.current.rotation.y) * rotationLerp;
    
    // 位置偏移（增强视差）
    meshRef.current.position.x = mousePosition.x * 0.2;
    meshRef.current.position.y = mousePosition.y * 0.15;
    
    // 呼吸动画 - 微妙的缩放波动
    const breathe = 1 + Math.sin(time * 1.2) * 0.012;
    meshRef.current.scale.set(breathe, breathe, 1);
    
    // 更新 shader 时间 uniforms
    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uMouse.value.set(mousePosition.x, mousePosition.y);
  });
  
  // 自定义 shader 用于边缘光晕效果
  const shaderData = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTexture: { value: texture },
      uGlowColor: { value: new THREE.Color(0xc084fc) },
      uGlowIntensity: { value: 0.25 },
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      
      void main() {
        vUv = uv;
        
        vec3 pos = position;
        
        // 微妙的顶点波动（呼吸感）
        float breathe = sin(uTime * 1.5 + position.x * 2.0) * 0.005;
        pos.z += breathe;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec3 uGlowColor;
      uniform float uGlowIntensity;
      
      varying vec2 vUv;
      
      void main() {
        vec4 texColor = texture2D(uTexture, vUv);
        
        // 丢弃透明像素
        if (texColor.a < 0.01) discard;
        
        // 边缘检测用于发光效果
        vec2 center = vUv - vec2(0.5);
        float dist = length(center);
        float edgeGlow = smoothstep(0.5, 0.35, dist) * uGlowIntensity;
        
        // 动态光晕强度
        float pulse = sin(uTime * 1.0) * 0.1 + 0.9;
        edgeGlow *= pulse;
        
        // 鼠标交互增强发光
        float mouseInfluence = 1.0 - length(uMouse) * 0.2;
        edgeGlow *= mouseInfluence;
        
        // 混合贴图和发光
        vec3 finalColor = texColor.rgb + uGlowColor * edgeGlow;
        
        gl_FragColor = vec4(finalColor, texColor.a);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  }), [texture]);
  
  // 根据宽高比计算平面尺寸，保持图片比例
  // 使用 cover 策略：填满圆形区域，可能裁剪部分图片
  const planeWidth = imageAspect >= 1 ? 4.2 : 4.2 * imageAspect;
  const planeHeight = imageAspect >= 1 ? 4.2 / imageAspect : 4.2;
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[planeWidth, planeHeight, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        {...shaderData}
      />
    </mesh>
  );
}

// 背景光晕效果 - 圆形
function AmbientGlow() {
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!glowRef.current) return;
    const time = state.clock.elapsedTime;
    
    // 光晕呼吸动画
    const scale = 1 + Math.sin(time * 0.6) * 0.04;
    glowRef.current.scale.set(scale, scale, 1);
    
    // 材质透明度波动
    const material = glowRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = 0.12 + Math.sin(time * 0.9) * 0.04;
  });
  
  return (
    <mesh ref={glowRef} position={[0, 0, -0.3]}>
      <circleGeometry args={[2.8, 64]} />
      <meshBasicMaterial
        color={0xe9d5ff}
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// 场景组件
function Scene() {
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.5} />
      
      {/* 主光源 - 粉紫色 */}
      <pointLight position={[5, 5, 5]} intensity={0.7} color="#f0abfc" />
      <pointLight position={[-5, -5, 3]} intensity={0.4} color="#7dd3fc" />
      <pointLight position={[0, 5, -5]} intensity={0.3} color="#f9a8d4" />
      
      {/* 背景光晕 */}
      <AmbientGlow />
      
      {/* 角色主体 */}
      <CharacterPlane />
    </>
  );
}

// 主组件 - 优化版本
export default function AnimeCore() {
  // 根据设备类型调整 DPR
  const dpr = typeof window !== 'undefined' 
    ? Math.min(window.devicePixelRatio, isTouchDevice ? 1.5 : 2) 
    : 1;
  
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        gl={{ 
          antialias: !isTouchDevice, // 触摸设备禁用抗锯齿
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ background: 'transparent' }}
        dpr={dpr}
        frameloop="always"
        performance={{ min: 0.5 }} // 允许帧率下降以保持流畅
      >
        <Scene />
      </Canvas>
    </div>
  );
}
