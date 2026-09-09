import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
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

// 限制 DPR 上限，避免高分屏性能开销过大
const DPR_LIMIT = 1.5;

const EXPRESSIONS = [
  { label: 'Smile', image: '/generated/site/character.webp' },
  { label: 'Happy', image: '/generated/site/character-happy.webp' },
  { label: 'Wink', image: '/generated/site/character-wink.webp' },
  { label: 'Shy', image: '/generated/site/character-shy.webp' },
];

type ExpressionRequest = { index: number; revision: number };
type CharacterProps = {
  request: ExpressionRequest;
  onDisplay: (index: number) => void;
  onLoadError: () => void;
};
type Portrait = { index: number; texture: THREE.Texture };

function prepareTexture(texture: THREE.Texture) {
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  return texture;
}

// 角色平面组件 - 带呼吸和视差效果 - 优化版本
function CharacterPlane({ request, onDisplay, onLoadError }: CharacterProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { mouse } = useThree();
  const frameCount = useRef(0);
  const [isVisible, setIsVisible] = useState(true);

  // 使用原始 OC 插画，在着色器中取景，保留完整源图。
  const texture = useLoader(
    THREE.TextureLoader,
    EXPRESSIONS[0].image,
  ) as THREE.Texture<HTMLImageElement>;
  prepareTexture(texture);

  const currentPortrait = useRef<Portrait>({ index: 0, texture });
  const desiredPortrait = useRef<Portrait>({ index: 0, texture });
  const transition = useRef<{ target: Portrait; elapsed: number } | null>(null);
  const reduceMotion = useRef(false);
  const loadPortrait = useRef<((index: number) => Promise<THREE.Texture>) | undefined>(undefined);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => { reduceMotion.current = media.matches; };
    updateMotion();
    media.addEventListener('change', updateMotion);
    return () => media.removeEventListener('change', updateMotion);
  }, []);

  useEffect(() => {
    let disposed = false;
    const textures = new Set<THREE.Texture>();
    const cache = new Map<number, Promise<THREE.Texture>>([[0, Promise.resolve(texture)]]);
    const loader = new THREE.TextureLoader();
    const load = (index: number) => {
      const existing = cache.get(index);
      if (existing) return existing;
      const promise = loader.loadAsync(EXPRESSIONS[index].image).then((loaded) => {
        if (disposed) {
          loaded.dispose();
          throw new Error('Portrait component unmounted');
        }
        textures.add(loaded);
        return prepareTexture(loaded);
      }).catch((error: unknown) => {
        cache.delete(index);
        throw error;
      });
      cache.set(index, promise);
      return promise;
    };
    loadPortrait.current = load;
    // 默认肖像先显示，其他表情在后台各加载一次；失败后允许重新请求。
    EXPRESSIONS.slice(1).forEach((_, index) => { void load(index + 1).catch(() => {}); });
    return () => {
      disposed = true;
      loadPortrait.current = undefined;
      textures.forEach((loaded) => loaded.dispose());
    };
  }, [texture]);

  useEffect(() => {
    let cancelled = false;
    void loadPortrait.current?.(request.index).then((loaded) => {
      if (!cancelled) desiredPortrait.current = { index: request.index, texture: loaded };
    }).catch(() => {
      if (!cancelled) {
        desiredPortrait.current = transition.current?.target ?? currentPortrait.current;
        onLoadError();
      }
    });
    return () => { cancelled = true; };
  }, [request, onLoadError]);

  // 鼠标位置平滑插值
  const mousePosition = useMemo(() => new THREE.Vector2(0, 0), []);
  const targetRotation = useMemo(() => new THREE.Vector2(0, 0), []);

  // 使用 IntersectionObserver 检测可见性，离屏时暂停渲染
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 找到 Canvas 容器
    const canvas = meshRef.current?.parent?.parent as any;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    // 观察 Canvas 的父元素
    const container = canvas.parentElement;
    if (container) {
      observer.observe(container);
    }

    return () => observer.disconnect();
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current || !isVisible) return;

    const uniforms = materialRef.current.uniforms;
    if (!transition.current && desiredPortrait.current.index !== currentPortrait.current.index) {
      transition.current = { target: desiredPortrait.current, elapsed: 0 };
      uniforms.uNextTexture.value = desiredPortrait.current.texture;
    }
    if (transition.current) {
      transition.current.elapsed += delta;
      const progress = reduceMotion.current ? 1 : Math.min(transition.current.elapsed / 0.22, 1);
      uniforms.uTransition.value = progress * progress * (3 - 2 * progress);
      if (progress === 1) {
        currentPortrait.current = transition.current.target;
        uniforms.uTexture.value = currentPortrait.current.texture;
        uniforms.uNextTexture.value = currentPortrait.current.texture;
        uniforms.uTransition.value = 0;
        transition.current = null;
        onDisplay(currentPortrait.current.index);
      }
    }

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

  // 自定义 shader 用于边缘光晕效果 - 简化版本，去掉锐化滤镜
  const shaderData = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTexture: { value: texture },
      uNextTexture: { value: texture },
      uTransition: { value: 0 },
      uGlowColor: { value: new THREE.Color(0xc084fc) },
      uGlowIntensity: { value: 0.08 },
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
      uniform sampler2D uNextTexture;
      uniform float uTransition;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec3 uGlowColor;
      uniform float uGlowIntensity;

      varying vec2 vUv;

      vec4 samplePortrait(sampler2D portrait, vec2 portraitUv) {
        vec4 color = texture2D(portrait, clamp(portraitUv, 0.0, 1.0));
        float radius = length(vUv - vec2(0.5));
        float paper = smoothstep(0.94, 0.995, min(color.r, min(color.g, color.b)));
        color.a *= 1.0 - paper * smoothstep(0.16, 0.46, radius);
        color.a *= 1.0 - smoothstep(0.46, 0.5, radius);
        return color;
      }

      void main() {
        // 从 2:3 全身插画取上半身，头顶留白，人物向右微调以视觉居中。
        vec2 portraitUv = vec2(
          0.5 + (vUv.x - 0.53) * (760.0 / 1024.0),
          1.0 - ((1.0 - vUv.y) * 760.0 - 45.0) / 1536.0
        );
        // 两张肖像分别柔化纸边后混合，切换时始终保留完整人物。
        vec4 currentColor = samplePortrait(uTexture, portraitUv);
        vec4 nextColor = samplePortrait(uNextTexture, portraitUv);
        float alpha = mix(currentColor.a, nextColor.a, uTransition);
        vec3 rgb = mix(currentColor.rgb * currentColor.a, nextColor.rgb * nextColor.a, uTransition);
        vec4 texColor = vec4(rgb / max(alpha, 0.001), alpha);

        // 丢弃透明像素
        if (texColor.a < 0.01) discard;

        // 边缘检测用于发光效果
        vec2 center = vUv - vec2(0.5);
        float dist = length(center);
        float edgeGlow = (1.0 - smoothstep(0.35, 0.5, dist)) * uGlowIntensity;

        // 动态光晕强度
        float pulse = sin(uTime * 1.0) * 0.1 + 0.9;
        edgeGlow *= pulse;

        // 鼠标交互增强发光
        float mouseInfluence = 1.0 - length(uMouse) * 0.2;
        edgeGlow *= mouseInfluence;

        // 直接使用贴图颜色，去掉性能开销大的锐化滤镜
        vec3 finalColor = texColor.rgb + uGlowColor * edgeGlow;

        gl_FragColor = vec4(finalColor, texColor.a);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  }), [texture]);

  // 方形取景覆盖球面，半身肖像在小屏幕上也能保持清晰。
  const baseSize = 4.2;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[baseSize, baseSize, 16, 16]} />
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
function Scene(props: CharacterProps) {
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
      <CharacterPlane {...props} />
    </>
  );
}

// 主组件 - 优化版本
export default function AnimeCore() {
  const interactionRef = useRef<HTMLDivElement>(null!);
  const [request, setRequest] = useState<ExpressionRequest>({ index: 0, revision: 0 });
  const [displayedExpression, setDisplayedExpression] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const reportLoadError = useCallback(() => setLoadFailed(true), []);
  const changeExpression = () => {
    setLoadFailed(false);
    setRequest((previous) => ({
      index: loadFailed ? previous.index : (previous.index + 1) % EXPRESSIONS.length,
      revision: previous.revision + 1,
    }));
  };
  const currentLabel = EXPRESSIONS[displayedExpression].label;
  const isLoading = request.index !== displayedExpression && !loadFailed;

  // DPR 设置：限制上限避免高分屏性能开销过大
  const dpr = typeof window !== 'undefined'
    ? Math.min(window.devicePixelRatio, DPR_LIMIT)
    : 1;

  return (
    <div ref={interactionRef} className="w-full h-full relative">
      <Canvas
        eventSource={interactionRef}
        onCreated={(state) => state.setEvents({
          compute: (event, root) => {
            const bounds = interactionRef.current.getBoundingClientRect();
            // 键盘触发的 click 没有指针坐标，继续使用原来的视差位置。
            if (event.type !== 'click' || event.detail !== 0) {
              root.pointer.set(
                ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
                -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
              );
            }
            root.raycaster.setFromCamera(root.pointer, root.camera);
          },
        })}
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        gl={{
          antialias: true, // 所有设备启用抗锯齿
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{
          background: 'transparent',
          imageRendering: 'auto' // 使用 auto 以获得更好的性能
        }}
        dpr={dpr}
        frameloop="always"
        performance={{ min: 0.5 }}
      >
        <Scene request={request} onDisplay={setDisplayedExpression} onLoadError={reportLoadError} />
      </Canvas>
      <button
        type="button"
        className="portrait-expression-button"
        onClick={changeExpression}
        title={loadFailed ? 'Image unavailable. Click to retry' : 'Click to change expression'}
        aria-label={`Current expression: ${currentLabel}. ${loadFailed ? 'Image unavailable. Click to retry' : 'Click to change expression'}`}
        aria-busy={isLoading}
      >
        <span className="portrait-expression-hint" aria-hidden="true">
          {loadFailed ? 'Tap to retry' : request.revision === 0 ? 'Tap to change' : `${currentLabel} · Tap again`}
        </span>
      </button>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {loadFailed ? 'Expression image unavailable. The current portrait is unchanged. Click to retry.' : `Current expression: ${currentLabel}`}
      </span>
      <style>{`
        .portrait-expression-button {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
          border-radius: 50%;
          padding: 0;
          background: transparent;
          cursor: pointer;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .portrait-expression-button:focus-visible {
          outline: 2px solid #a78bfa;
          outline-offset: -6px;
        }
        .portrait-expression-hint {
          position: absolute;
          bottom: 12%;
          left: 50%;
          transform: translateX(-50%);
          padding: 3px 9px;
          border: 1px solid rgba(196, 181, 253, 0.3);
          border-radius: 999px;
          color: #70548d;
          background: rgba(255, 255, 255, 0.74);
          font-size: clamp(10px, 1vw, 11px);
          line-height: 1.4;
          letter-spacing: 0.03em;
          white-space: nowrap;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
