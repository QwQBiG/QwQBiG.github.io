/* empty css                                 */
import { b as createAstro, c as createComponent, m as maybeRenderHead, d as addAttribute, f as renderSlot, e as renderScript, a as renderTemplate, r as renderComponent, g as renderHead } from '../chunks/astro/server_BR9bRUNn.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                 */
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { g as getCollection } from '../chunks/_astro_content_BTp7kt0N.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro$2 = createAstro("https://iqwqi.win");
const $$GlassCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$GlassCard;
  const {
    class: className = "",
    hover = true,
    padding = "medium",
    tilt = true
  } = Astro2.props;
  const paddingClasses = {
    none: "",
    small: "p-4 md:p-5",
    medium: "p-6 md:p-8",
    large: "p-8 md:p-10"
  };
  const hoverClasses = hover ? "hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 ease-out cursor-pointer" : "";
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`
    glass-card
    relative overflow-hidden
    bg-white/30 
    backdrop-blur-xl 
    border border-white/60 
    rounded-[2rem]
    ${paddingClasses[padding]}
    ${hoverClasses}
    ${className}
  `, "class")}${addAttribute(tilt ? "true" : void 0, "data-tilt")} style="
    transform-style: preserve-3d;
    will-change: transform;
    box-shadow: 
      0 20px 40px -15px rgba(0, 0, 0, 0.08),
      0 40px 60px -20px rgba(0, 0, 0, 0.05),
      inset 0 1px 1px 0 rgba(255, 255, 255, 0.7),
      inset 0 -1px 1px 0 rgba(255, 255, 255, 0.3);
    /* GPU 加速 */
    transform: translateZ(0);
    backface-visibility: hidden;
  " data-astro-cid-6qox3hei> <!-- 顶部边缘高光 - 模拟玻璃反光 --> <div class="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-[1]" data-astro-cid-6qox3hei></div> <!-- 内部光晕效果 - 柔和渐变 --> <div class="absolute inset-0 rounded-[2rem] pointer-events-none z-[1]" style="
      background: linear-gradient(
        165deg,
        rgba(255, 255, 255, 0.5) 0%,
        rgba(255, 255, 255, 0.2) 30%,
        rgba(255, 255, 255, 0.05) 60%,
        rgba(255, 255, 255, 0) 100%
      );
    " data-astro-cid-6qox3hei></div> <!-- 底部微光 - 增加立体感 --> <div class="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-[2rem] pointer-events-none z-[1]" style="
      background: linear-gradient(
        to top,
        rgba(255, 255, 255, 0.15) 0%,
        transparent 100%
      );
    " data-astro-cid-6qox3hei></div> <!-- 动态高光/反光层 - 跟随鼠标 --> <div class="glare absolute inset-0 rounded-[2rem] pointer-events-none z-[2] opacity-0 transition-opacity duration-500" style="
      background: radial-gradient(
        circle at 50% 50%,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 255, 255, 0.5) 20%,
        rgba(255, 255, 255, 0.2) 40%,
        transparent 70%
      );
      mix-blend-mode: soft-light;
    " data-astro-cid-6qox3hei></div> <!-- 内容区域 - 使用最高的z-index确保点击事件不被覆盖层拦截 --> <div class="relative z-[999] h-full" style="pointer-events: auto;" data-astro-cid-6qox3hei> ${renderSlot($$result, $$slots["default"])} </div> </div> ${renderScript($$result, "D:/Projects/MyBlog-Astro/src/components/ui/GlassCard.astro?astro&type=script&index=0&lang.ts")} `;
}, "D:/Projects/MyBlog-Astro/src/components/ui/GlassCard.astro", void 0);

const originalWarn = console.warn;
console.warn = function(...args) {
  if (args[0] && typeof args[0] === "string" && args[0].includes("THREE.THREE.Clock")) {
    return;
  }
  originalWarn.apply(console, args);
};
const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
const DPR_LIMIT = 1.5;
function CharacterPlane() {
  const meshRef = useRef(null);
  const materialRef = useRef(null);
  const { mouse } = useThree();
  const frameCount = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  useRef(null);
  const texture = useTexture("/images/character.png", (loader) => {
    loader.minFilter = THREE.LinearFilter;
    loader.magFilter = THREE.LinearFilter;
    loader.anisotropy = 8;
  });
  const imageAspect = texture.image ? texture.image.width / texture.image.height : 1;
  const mousePosition = useMemo(() => new THREE.Vector2(0, 0), []);
  const targetRotation = useMemo(() => new THREE.Vector2(0, 0), []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = meshRef.current?.parent?.parent;
    if (!canvas) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    const container = canvas.parentElement;
    if (container) {
      observer.observe(container);
    }
    return () => observer.disconnect();
  }, []);
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current || !isVisible) return;
    frameCount.current++;
    const skipFrames = isTouchDevice ? 2 : 1;
    if (frameCount.current % skipFrames !== 0) return;
    const time = state.clock.elapsedTime;
    const lerpFactor = isTouchDevice ? 0.08 : 0.05;
    mousePosition.x += (mouse.x * 0.5 - mousePosition.x) * lerpFactor;
    mousePosition.y += (mouse.y * 0.5 - mousePosition.y) * lerpFactor;
    const rotationScale = isTouchDevice ? 0.08 : 0.12;
    targetRotation.x = mousePosition.y * rotationScale;
    targetRotation.y = -mousePosition.x * rotationScale;
    const rotationLerp = isTouchDevice ? 0.12 : 0.08;
    meshRef.current.rotation.x += (targetRotation.x - meshRef.current.rotation.x) * rotationLerp;
    meshRef.current.rotation.y += (targetRotation.y - meshRef.current.rotation.y) * rotationLerp;
    meshRef.current.position.x = mousePosition.x * 0.2;
    meshRef.current.position.y = mousePosition.y * 0.15;
    const breathe = 1 + Math.sin(time * 1.2) * 0.012;
    meshRef.current.scale.set(breathe, breathe, 1);
    materialRef.current.uniforms.uTime.value = time;
    materialRef.current.uniforms.uMouse.value.set(mousePosition.x, mousePosition.y);
  });
  const shaderData = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTexture: { value: texture },
      uGlowColor: { value: new THREE.Color(12616956) },
      uGlowIntensity: { value: 0.25 }
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

        // 直接使用贴图颜色，去掉性能开销大的锐化滤镜
        vec3 finalColor = texColor.rgb + uGlowColor * edgeGlow;

        gl_FragColor = vec4(finalColor, texColor.a);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  }), [texture]);
  const baseSize = 3.8;
  const planeWidth = imageAspect >= 1 ? baseSize : baseSize * imageAspect;
  const planeHeight = imageAspect >= 1 ? baseSize / imageAspect : baseSize;
  return /* @__PURE__ */ jsxs("mesh", { ref: meshRef, position: [0, 0, 0], children: [
    /* @__PURE__ */ jsx("planeGeometry", { args: [planeWidth, planeHeight, 16, 16] }),
    /* @__PURE__ */ jsx(
      "shaderMaterial",
      {
        ref: materialRef,
        ...shaderData
      }
    )
  ] });
}
function AmbientGlow() {
  const glowRef = useRef(null);
  useFrame((state) => {
    if (!glowRef.current) return;
    const time = state.clock.elapsedTime;
    const scale = 1 + Math.sin(time * 0.6) * 0.04;
    glowRef.current.scale.set(scale, scale, 1);
    const material = glowRef.current.material;
    material.opacity = 0.12 + Math.sin(time * 0.9) * 0.04;
  });
  return /* @__PURE__ */ jsxs("mesh", { ref: glowRef, position: [0, 0, -0.3], children: [
    /* @__PURE__ */ jsx("circleGeometry", { args: [2.8, 64] }),
    /* @__PURE__ */ jsx(
      "meshBasicMaterial",
      {
        color: 15324671,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }
    )
  ] });
}
function Scene() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("ambientLight", { intensity: 0.5 }),
    /* @__PURE__ */ jsx("pointLight", { position: [5, 5, 5], intensity: 0.7, color: "#f0abfc" }),
    /* @__PURE__ */ jsx("pointLight", { position: [-5, -5, 3], intensity: 0.4, color: "#7dd3fc" }),
    /* @__PURE__ */ jsx("pointLight", { position: [0, 5, -5], intensity: 0.3, color: "#f9a8d4" }),
    /* @__PURE__ */ jsx(AmbientGlow, {}),
    /* @__PURE__ */ jsx(CharacterPlane, {})
  ] });
}
function AnimeCore() {
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, DPR_LIMIT) : 1;
  return /* @__PURE__ */ jsx("div", { className: "w-full h-full relative", children: /* @__PURE__ */ jsx(
    Canvas,
    {
      camera: { position: [0, 0, 4.5], fov: 50 },
      gl: {
        antialias: true,
        // 所有设备启用抗锯齿
        alpha: true,
        powerPreference: "high-performance"
      },
      style: {
        background: "transparent",
        imageRendering: "auto"
        // 使用 auto 以获得更好的性能
      },
      dpr,
      frameloop: "always",
      performance: { min: 0.5 },
      children: /* @__PURE__ */ jsx(Scene, {})
    }
  ) });
}

const $$Astro$1 = createAstro("https://iqwqi.win");
const $$ClockWidget = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$ClockWidget;
  return renderTemplate`${maybeRenderHead()}<div class="clock-widget w-full h-full flex flex-col items-center justify-center relative" data-astro-cid-fnozbsfw> <!-- 装饰性背景圆环 --> <div class="absolute inset-0 flex items-center justify-center pointer-events-none" data-astro-cid-fnozbsfw> <div class="w-24 h-24 md:w-28 md:h-28 rounded-full border border-white/20 opacity-50" data-astro-cid-fnozbsfw></div> <div class="absolute w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/10 opacity-30" data-astro-cid-fnozbsfw></div> </div> <!-- 时间显示区域 --> <div class="time-display relative flex items-baseline gap-1 z-10" data-astro-cid-fnozbsfw> <span id="clock-time" class="clock-digits" data-astro-cid-fnozbsfw>00:00</span> <span id="clock-seconds" class="clock-seconds" data-astro-cid-fnozbsfw>:00</span> </div> <!-- 日期显示 --> <div id="clock-date" class="clock-date mt-2 md:mt-3 text-center px-2 z-10" data-astro-cid-fnozbsfw>
Loading...
</div> <!-- 装饰性指示点 --> <div class="flex gap-1.5 mt-3 z-10" data-astro-cid-fnozbsfw> <span class="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-80" data-astro-cid-fnozbsfw></span> <span class="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 opacity-60" data-astro-cid-fnozbsfw></span> <span class="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 opacity-40" data-astro-cid-fnozbsfw></span> </div> </div>  ${renderScript($$result, "D:/Projects/MyBlog-Astro/src/components/widgets/ClockWidget.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/Projects/MyBlog-Astro/src/components/widgets/ClockWidget.astro", void 0);

const $$Astro = createAstro("https://iqwqi.win");
const $$CalendarWidget = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$CalendarWidget;
  return renderTemplate`${maybeRenderHead()}<div class="calendar-widget w-full h-full flex flex-col" style="position: relative; z-index: 50;"> <!-- 月份标题 --> <div class="calendar-header flex items-center justify-between mb-2 md:mb-3" style="position: relative; z-index: 51;"> <button id="prev-month" class="calendar-nav-btn p-1.5 rounded-lg hover:bg-white/50 transition-colors flex-shrink-0" style="position: relative; z-index: 100; pointer-events: auto; cursor: pointer;" type="button"> <svg class="w-3 h-3 md:w-4 md:h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg> </button> <span id="calendar-month-year" class="calendar-title text-xs md:text-sm font-semibold tracking-wide text-center flex-1 px-1 truncate"></span> <button id="next-month" class="calendar-nav-btn p-1.5 rounded-lg hover:bg-white/50 transition-colors flex-shrink-0" style="position: relative; z-index: 100; pointer-events: auto; cursor: pointer;" type="button"> <svg class="w-3 h-3 md:w-4 md:h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </button> </div> <!-- 星期标题 --> <div class="calendar-weekdays grid grid-cols-7 gap-0.5 md:gap-1 mb-1 md:mb-2"> ${["M", "T", "W", "T", "F", "S", "S"].map((day) => renderTemplate`<div class="calendar-weekday text-center text-[10px] md:text-xs font-medium py-0.5 font-['Cormorant_Garamond']"> ${day} </div>`)} </div> <!-- 日期网格 --> <div id="calendar-days" class="calendar-days grid grid-cols-7 gap-0.5 md:gap-1 flex-1"> <!-- 由 JS 动态生成 --> </div> </div>  ${renderScript($$result, "D:/Projects/MyBlog-Astro/src/components/widgets/CalendarWidget.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/Projects/MyBlog-Astro/src/components/widgets/CalendarWidget.astro", void 0);

const $$MusicWidget = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="music-bar w-full h-full flex items-center gap-2 md:gap-3 px-1" style="position: relative; z-index: 200; pointer-events: auto;" data-astro-cid-plon32kj> <!-- 播放/暂停按钮 - 使用最高z-index确保在最上层 --> <button id="play-btn" class="play-btn flex-shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center" style="position: relative; z-index: 9999; pointer-events: auto; cursor: pointer;" data-astro-cid-plon32kj> <svg id="play-icon" class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-plon32kj> <path d="M8 5v14l11-7z" data-astro-cid-plon32kj></path> </svg> <svg id="pause-icon" class="w-5 h-5 text-white hidden" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-plon32kj> <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" data-astro-cid-plon32kj></path> </svg> </button> <!-- 歌曲信息 + 进度条区域 --> <div class="flex-[5] min-w-0 flex flex-col justify-center gap-1.5 md:gap-2" data-astro-cid-plon32kj> <!-- 歌曲信息 --> <div class="flex items-center justify-between min-w-0 gap-1 md:gap-2" data-astro-cid-plon32kj> <div class="flex items-center gap-2 min-w-0 overflow-hidden flex-1" data-astro-cid-plon32kj> <!-- 频谱动画 --> <div id="playing-indicator" class="flex gap-0.5 items-end h-3 opacity-0 transition-opacity flex-shrink-0" data-astro-cid-plon32kj> <span class="w-0.5 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full animate-bar-1" data-astro-cid-plon32kj></span> <span class="w-0.5 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full animate-bar-2" data-astro-cid-plon32kj></span> <span class="w-0.5 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full animate-bar-3" data-astro-cid-plon32kj></span> </div> <!-- 滚动歌曲信息容器 --> <div class="track-scroll-container overflow-hidden flex-1" data-astro-cid-plon32kj> <div class="track-scroll-content" data-astro-cid-plon32kj> <span class="track-name text-xs md:text-base font-semibold" data-astro-cid-plon32kj>world.execute(me)</span> <span class="text-gray-400/50 mx-1" data-astro-cid-plon32kj>·</span> <span class="artist-name text-[10px] md:text-sm" data-astro-cid-plon32kj>Neuro</span> <!-- 复制一份用于无缝循环 --> <span class="track-name duplicate text-xs md:text-base font-semibold ml-8" data-astro-cid-plon32kj>world.execute(me)</span> <span class="text-gray-400/50 duplicate mx-1" data-astro-cid-plon32kj>·</span> <span class="artist-name duplicate text-[10px] md:text-sm" data-astro-cid-plon32kj>Neuro</span> </div> </div> </div> <span id="time-display" class="time-display text-[10px] md:text-sm font-mono flex-shrink-0" data-astro-cid-plon32kj>0:00 / 0:00</span> </div> <!-- 进度条 --> <div class="progress-wrapper relative h-5 flex items-center cursor-pointer" id="progress-container" style="pointer-events: auto; z-index: 101;" data-astro-cid-plon32kj> <div class="progress-track w-full h-1.5 md:h-2 rounded-full overflow-hidden" data-astro-cid-plon32kj> <div id="progress-fill" class="progress-fill h-full rounded-full" style="width: 0%" data-astro-cid-plon32kj></div> </div> <!-- 进度滑块 --> <div id="progress-thumb" class="progress-thumb absolute w-3 h-3 md:w-3.5 md:h-3.5 rounded-full shadow-md" style="left: 0%" data-astro-cid-plon32kj></div> </div> </div> <!-- 音量控制 + 切歌按钮 --> <div class="flex items-center gap-1 flex-shrink-0" data-astro-cid-plon32kj> <button id="volume-btn" class="volume-btn p-1 rounded-full hover:bg-white/50 transition-colors" title="静音/取消静音" data-astro-cid-plon32kj> <!-- 有音量图标 --> <svg id="volume-on-icon" class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-plon32kj> <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" data-astro-cid-plon32kj></path> </svg> <!-- 静音图标 --> <svg id="volume-off-icon" class="w-4 h-4 text-gray-500 hidden" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-plon32kj> <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" data-astro-cid-plon32kj></path> </svg> </button> <button id="prev-btn" class="nav-btn p-1 rounded-full hover:bg-white/50 transition-colors" data-astro-cid-plon32kj> <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-plon32kj> <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" data-astro-cid-plon32kj></path> </svg> </button> <button id="next-btn" class="nav-btn p-1 rounded-full hover:bg-white/50 transition-colors" data-astro-cid-plon32kj> <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-plon32kj> <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" data-astro-cid-plon32kj></path> </svg> </button> </div> </div> <audio id="audio-player" preload="none" class="hidden" crossorigin="anonymous" data-astro-cid-plon32kj> <source src="/music/world.execute(me);[Neuro].aac" type="audio/aac" data-astro-cid-plon32kj>
Your browser does not support the audio element.
</audio>  ${renderScript($$result, "D:/Projects/MyBlog-Astro/src/components/widgets/MusicWidget.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/Projects/MyBlog-Astro/src/components/widgets/MusicWidget.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const csPosts = await getCollection("cs", ({ data }) => !data.draft);
  const seriesEntries = csPosts.filter((post) => {
    const slashCount = (post.slug.match(/\//g) || []).length;
    return slashCount === 1 && post.id.includes("index.md");
  });
  const regularPosts = csPosts.filter((post) => {
    const slashCount = (post.slug.match(/\//g) || []).length;
    return slashCount >= 2;
  });
  const sortedPosts = regularPosts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );
  seriesEntries.filter((entry) => entry.data.pin).map((entry) => {
    const seriesName = entry.data.title;
    const seriesSlug = entry.slug;
    const postCount = regularPosts.filter(
      (post) => post.data.series?.includes(seriesName)
    ).length;
    return {
      title: entry.data.title,
      description: entry.data.description,
      slug: seriesSlug,
      postCount
    };
  });
  const latestPosts = sortedPosts.slice(0, 3);
  const totalPosts = regularPosts.length;
  const totalSeries = seriesEntries.length;
  const totalTags = new Set(regularPosts.flatMap((p) => p.data.tags || [])).size;
  const yearsActive = (/* @__PURE__ */ new Date()).getFullYear() - 2024;
  return renderTemplate(_a || (_a = __template([`<html lang="zh-CN" data-astro-cid-j7pv25f6> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>QwQBiG's World</title><meta name="description" content="CS Learning Notes | Algorithms | Programming | Embedded Development"><link rel="icon" type="image/png" href="/ZhenXun.png"><!-- \u8D44\u6E90\u9884\u8FDE\u63A5\u4F18\u5316 --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><!-- \u9884\u52A0\u8F7D\u5173\u952E\u8D44\u6E90 --><link rel="preload" href="/ZhenXun.png" as="image" fetchpriority="high"><link rel="preload" href="/images/character.png" as="image" fetchpriority="high"><!-- \u5B57\u4F53\u9884\u52A0\u8F7D\uFF1A\u63D0\u524D\u52A0\u8F7D latin \u5B50\u96C6\uFF0C\u907F\u514D FOUT/FOIT --><!-- Google Fonts v2 API \u5DF2\u81EA\u52A8\u6309 unicode-range \u5206\u7247\uFF0C\u6B64\u5904\u53EA\u9884\u52A0\u8F7D latin \u5B50\u96C6 --><!-- Quicksand latin (\u8986\u76D6 300/400/500/600/700) --><link rel="preload" href="https://fonts.gstatic.com/s/quicksand/v37/6xKtdSZaM9iE8KbpRA_hK1QN.woff2" as="font" type="font/woff2" crossorigin><!-- Cormorant Garamond Normal latin (\u8986\u76D6 400/500/600/700) --><link rel="preload" href="https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2" as="font" type="font/woff2" crossorigin><!-- Cormorant Garamond Italic latin (\u8986\u76D6 400/500) --><link rel="preload" href="https://fonts.gstatic.com/s/cormorantgaramond/v21/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEtImSo.woff2" as="font" type="font/woff2" crossorigin>`, '</head> <body class="gradient-bg" data-astro-cid-j7pv25f6> <!-- \u5916\u5C42\u5305\u88C5\u5668 - \u59CB\u7EC8\u5C45\u4E2D --> <div class="min-h-screen w-full flex items-center justify-center overflow-hidden py-6 [@media(min-width:924px)]:py-8 px-4 sm:px-6 [@media(min-width:924px)]:px-12 xl:px-12" data-astro-cid-j7pv25f6> <!-- \u7F51\u683C\u5BB9\u5668 - \u7531\u5916\u5C42 flex \u63A8\u5230\u5C4F\u5E55\u4E2D\u5FC3 --> <div class="flex flex-col [@media(min-width:924px)]:grid [@media(min-width:924px)]:grid-cols-3 gap-6 [@media(min-width:924px)]:gap-10 relative" data-astro-cid-j7pv25f6> <!-- ========== \u79FB\u52A8\u7AEF\u7B2C1\u4E2A / \u684C\u9762\u7AEF\u5DE6\u4E0A ========== --> <!-- \u6B22\u8FCE\u5361\u7247 - \u79FB\u52A8\u7AEF\u7B2C1\uFF0C\u684C\u9762\u7AEF\u5DE6\u4E0A\u5411\u53F3\u4E0B\u504F\u79FB --> <div class="order-1 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-1 [@media(min-width:924px)]:row-start-1 [@media(min-width:924px)]:place-self-start [@media(min-width:924px)]:translate-y-4 welcome-card-offset" data-astro-cid-j7pv25f6> ', ' </div> <!-- \u7EDF\u8BA1\u5361\u7247 - \u79FB\u52A8\u7AEF\u7B2C4\uFF0C\u684C\u9762\u7AEF\u5DE6\u4E2D\u9760\u53F3 --> <div class="order-4 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-1 [@media(min-width:924px)]:row-start-2 [@media(min-width:924px)]:place-self-start [@media(min-width:924px)]:self-center [@media(min-width:924px)]:translate-x-16 [@media(min-width:924px)]:-translate-y-4" data-astro-cid-j7pv25f6> ', ' </div> <!-- \u65F6\u949F - \u79FB\u52A8\u7AEF\u7B2C6\uFF0C\u684C\u9762\u7AEF\u53F3\u4E0A\u9760\u5DE6\u4E0B --> <div class="order-6 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-3 [@media(min-width:924px)]:row-start-1 [@media(min-width:924px)]:place-self-end [@media(min-width:924px)]:self-start [@media(min-width:924px)]:-translate-x-64 [@media(min-width:924px)]:translate-y-20" data-astro-cid-j7pv25f6> ', ' </div> <!-- ========== \u7B2C1\u884C\u4E2D\u95F4 - \u4E0A\u65B9\u56FE\u7247\u5361\u7247 ========== --> <!-- \u56FE\u7247\u5361\u7247 - \u79FB\u52A8\u7AEF\u7B2C8\uFF0C\u684C\u9762\u7AEF\u4E2D\u4E0A --> <div class="order-8 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-2 [@media(min-width:924px)]:row-start-1 [@media(min-width:924px)]:place-self-center [@media(min-width:924px)]:self-start [@media(min-width:924px)]:translate-y-4" data-astro-cid-j7pv25f6> <a href="/gallery/" class="block" data-astro-cid-j7pv25f6> ', ` </a> </div> <!-- ========== \u7B2C2\u884C - \u4E2D\u5FC3C\u4F4D ========== --> <!-- \u5BFC\u822A\u83DC\u5355 - \u79FB\u52A8\u7AEF\u7B2C7\uFF0C\u684C\u9762\u7AEF\u5DE6\u4E2D\uFF0C\u70B9\u51FB\u540E\u56FA\u5B9A\u5230\u5DE6\u4E0A\u89D2 --> <div id="navCard" class="order-7 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-1 [@media(min-width:924px)]:row-start-2 [@media(min-width:924px)]:place-self-start [@media(min-width:924px)]:self-center [@media(min-width:924px)]:translate-x-64 [@media(min-width:924px)]:-translate-y-0 transition-all duration-500" data-astro-cid-j7pv25f6> <!-- \u5185\u8054 GlassCard \u7ED3\u6784\uFF0C\u521D\u59CB\u72B6\u6001\u66F4\u5BBD\u677E\uFF0C\u8F6C\u6362\u540E\u4E0E FloatingNavCard \u4E00\u81F4 --> <div class="glass-card relative overflow-hidden bg-white/30 backdrop-blur-xl border border-white/60 rounded-[2rem] p-5 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 ease-out cursor-pointer w-full max-w-[85vw] [@media(min-width:924px)]:w-auto" data-tilt="true" style="
              transform-style: preserve-3d;
              will-change: transform;
              box-shadow:
                0 20px 40px -15px rgba(0, 0, 0, 0.08),
                0 40px 60px -20px rgba(0, 0, 0, 0.05),
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.7),
                inset 0 -1px 1px 0 rgba(255, 255, 255, 0.3);
            " data-astro-cid-j7pv25f6> <!-- \u9876\u90E8\u8FB9\u7F18\u9AD8\u5149 - \u6A21\u62DF\u73BB\u7483\u53CD\u5149 --> <div class="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-[1]" data-astro-cid-j7pv25f6></div> <!-- \u5185\u90E8\u5149\u6655\u6548\u679C - \u67D4\u548C\u6E10\u53D8 --> <div class="absolute inset-0 rounded-[2rem] pointer-events-none z-[1]" style="
                background: linear-gradient(
                  165deg,
                  rgba(255, 255, 255, 0.5) 0%,
                  rgba(255, 255, 255, 0.2) 30%,
                  rgba(255, 255, 255, 0.05) 60%,
                  rgba(255, 255, 255, 0) 100%
                );
              " data-astro-cid-j7pv25f6></div> <!-- \u5E95\u90E8\u5FAE\u5149 - \u589E\u52A0\u7ACB\u4F53\u611F --> <div class="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-[2rem] pointer-events-none z-[1]" style="
                background: linear-gradient(
                  to top,
                  rgba(255, 255, 255, 0.15) 0%,
                  transparent 100%
                );
              " data-astro-cid-j7pv25f6></div> <!-- \u52A8\u6001\u9AD8\u5149/\u53CD\u5149\u5C42 - \u8DDF\u968F\u9F20\u6807 --> <div class="glare absolute inset-0 rounded-[2rem] pointer-events-none z-[2] opacity-0 transition-opacity duration-500" style="
                background: radial-gradient(
                  circle at 50% 50%,
                  rgba(255, 255, 255, 0.9) 0%,
                  rgba(255, 255, 255, 0.5) 20%,
                  rgba(255, 255, 255, 0.2) 40%,
                  transparent 70%
                );
                mix-blend-mode: soft-light;
              " data-astro-cid-j7pv25f6></div> <!-- \u5185\u5BB9\u533A\u57DF --> <div class="relative z-[999] h-full" style="pointer-events: auto;" data-astro-cid-j7pv25f6> <div class="nav-container flex [@media(min-width:924px)]:flex-row flex-col gap-4" data-astro-cid-j7pv25f6> <!-- \u5DE6\u4FA7\uFF1A\u5934\u50CF\uFF08\u684C\u9762\u7AEF\uFF09/ \u4E0A\u65B9\uFF1A\u5934\u50CF\uFF08\u79FB\u52A8\u7AEF\uFF09 --> <div class="flex-shrink-0" data-astro-cid-j7pv25f6> <div class="nav-avatar relative w-14 h-14 [@media(min-width:924px)]:w-16 [@media(min-width:924px)]:h-16 translate-x-2 translate-y-2" data-astro-cid-j7pv25f6> <img src="/ZhenXun.png" alt="iqwqi" class="w-full h-full object-cover rounded-[1rem] border-2 border-white/60 shadow-md" data-astro-cid-j7pv25f6> <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm" data-astro-cid-j7pv25f6></div> </div> </div> <!-- \u53F3\u4FA7\uFF1A\u5BFC\u822A\u94FE\u63A5 --> <nav class="nav-links flex flex-col gap-2" data-astro-cid-j7pv25f6> <a href="/cs/" class="nav-link font-['Quicksand']" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>posts</span> </a> <a href="/series/" class="nav-link font-['Quicksand']" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>series</span> </a> <a href="/tags/" class="nav-link font-['Quicksand']" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>tags</span> </a> <a href="/archives/" class="nav-link font-['Quicksand']" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>archives</span> </a> <a href="/poetry/" class="nav-link font-['Quicksand']" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>poetry</span> </a> <a href="/about/" class="nav-link font-['Quicksand']" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>about</span> </a> <a href="/search/" class="nav-link font-['Quicksand']" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>search</span> </a> </nav> </div> </div> </div> </div> <!-- 3D \u79FB\u52A8\u7AEF\u7B2C2\uFF0C\u684C\u9762\u7AEF\u4E2D\u5FC3\u7EDD\u5BF9C\u4F4D --> <div class="order-2 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-2 [@media(min-width:924px)]:row-start-2 [@media(min-width:924px)]:place-self-center flex justify-center items-center" data-astro-cid-j7pv25f6> <div class="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] [@media(min-width:924px)]:w-[500px] [@media(min-width:924px)]:h-[500px] flex items-center justify-center" data-astro-cid-j7pv25f6> <!-- \u5927\u5706\u5F62\u80CC\u666F - \u53EA\u6709\u5706\u5F62\uFF0C\u6CA1\u6709\u65B9\u5F62\u80CC\u666F\uFF0C\u66F4\u6DF1\u7684\u5F25\u6563\u9634\u5F71 --> <div class="absolute w-[250px] h-[250px] sm:w-[280px] sm:h-[280px] md:w-[340px] md:h-[340px] [@media(min-width:924px)]:w-[440px] [@media(min-width:924px)]:h-[440px] rounded-full bg-white/30 backdrop-blur-xl border border-white/60" style="box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.15), 0 50px 100px -30px rgba(0, 0, 0, 0.1), 0 80px 140px -40px rgba(0, 0, 0, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.7);" data-astro-cid-j7pv25f6></div> <!-- \u4E2D\u5FC3 3D \u52A8\u6F2B\u89D2\u8272\u5C55\u793A - \u547C\u5438\u611F\u7403\u4F53\u6837\u5F0F --> <div class="absolute w-44 h-44 sm:w-52 sm:h-52 md:w-64 md:h-64 [@media(min-width:924px)]:w-80 [@media(min-width:924px)]:h-80 rounded-full overflow-hidden z-10 breathing-sphere" data-astro-cid-j7pv25f6> `, ` </div> <!-- \u73AF\u5F62\u6587\u5B57 - \u4F18\u96C5\u76843D\u60AC\u6D6E\u52A8\u6548 + \u4EA4\u4E92 --> <div id="interactiveRing" class="absolute w-[270px] h-[270px] sm:w-[300px] sm:h-[300px] md:w-[380px] md:h-[380px] [@media(min-width:924px)]:w-[480px] [@media(min-width:924px)]:h-[480px] floating-ring cursor-pointer" style="perspective: 1000px; transform-style: preserve-3d;" data-astro-cid-j7pv25f6> <svg viewBox="0 0 300 300" class="w-full h-full ring-text-rotate" style="transform-style: preserve-3d;" data-astro-cid-j7pv25f6> <defs data-astro-cid-j7pv25f6> <path id="textCircle" d="M 150, 150 m -110, 0 a 110,110 0 1,1 220,0 a 110,110 0 1,1 -220,0" fill="none" data-astro-cid-j7pv25f6></path> <!-- \u6E10\u53D8\u5B9A\u4E49 --> <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%" data-astro-cid-j7pv25f6> <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" data-astro-cid-j7pv25f6></stop> <stop offset="50%" style="stop-color:#ec4899;stop-opacity:1" data-astro-cid-j7pv25f6></stop> <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" data-astro-cid-j7pv25f6></stop> </linearGradient> <!-- \u53D1\u5149\u6EE4\u955C --> <filter id="glow" data-astro-cid-j7pv25f6> <feGaussianBlur stdDeviation="2" result="coloredBlur" data-astro-cid-j7pv25f6></feGaussianBlur> <feMerge data-astro-cid-j7pv25f6> <feMergeNode in="coloredBlur" data-astro-cid-j7pv25f6></feMergeNode> <feMergeNode in="SourceGraphic" data-astro-cid-j7pv25f6></feMergeNode> </feMerge> </filter> </defs> <!-- \u6587\u5B57 --> <text class="text-[11px] md:text-[12px] font-medium tracking-[0.12em] font-['Cormorant_Garamond'] italic" fill="url(#textGradient)" style="filter: drop-shadow(0 1px 2px rgba(139, 92, 246, 0.3));" data-astro-cid-j7pv25f6> <textPath href="#textCircle" startOffset="15%" data-astro-cid-j7pv25f6>
iqwqi \u2022 cs learner \u2022 code lover \u2022 embedded explorer \u2022 dreamer \u2022 creator \u2022 iqwqi \u2022 cs learner \u2022 code lover \u2022 embedded explorer \u2022 dreamer \u2022 creator \u2022
</textPath> </text> </svg> </div> </div> </div> <!-- \u793E\u4EA4\u94FE\u63A5 - \u79FB\u52A8\u7AEF\u7B2C5\uFF0C\u684C\u9762\u7AEF\u53F3\u4E2D\u9760\u5DE6\uFF08\u65E5\u5386\u5DE6\u8FB9\uFF09 --> <div class="order-5 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-3 [@media(min-width:924px)]:row-start-2 [@media(min-width:924px)]:place-self-start [@media(min-width:924px)]:self-center [@media(min-width:924px)]:translate-x-4 [@media(min-width:924px)]:translate-y-2" data-astro-cid-j7pv25f6> `, ' </div> <!-- \u65E5\u5386 - \u79FB\u52A8\u7AEF\u7B2C10\uFF0C\u684C\u9762\u7AEF\u53F3\u4E2D\u9760\u53F3 --> <div class="order-10 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-3 [@media(min-width:924px)]:row-start-2 [@media(min-width:924px)]:place-self-end [@media(min-width:924px)]:self-center [@media(min-width:924px)]:-translate-x-24 [@media(min-width:924px)]:translate-y-0" data-astro-cid-j7pv25f6> ', ' </div> <!-- ========== \u7B2C3\u884C ========== --> <!-- \u5E38\u7528\u6807\u7B7E - \u79FB\u52A8\u7AEF\u7B2C8\uFF0C\u684C\u9762\u7AEF\u5DE6\u4E0B\u9760\u53F3\u4E0A --> <div class="order-8 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-1 [@media(min-width:924px)]:row-start-3 [@media(min-width:924px)]:place-self-start [@media(min-width:924px)]:self-end [@media(min-width:924px)]:translate-x-32 [@media(min-width:924px)]:-translate-y-32" data-astro-cid-j7pv25f6> ', ' </div> <!-- \u97F3\u4E50\u64AD\u653E\u5668 - \u79FB\u52A8\u7AEF\u7B2C3\uFF0C\u684C\u9762\u7AEF\u4E2D\u4E0B\u9760\u4E0A\u504F\u53F3 --> <div class="order-3 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-2 [@media(min-width:924px)]:row-start-3 [@media(min-width:924px)]:place-self-start [@media(min-width:924px)]:self-center [@media(min-width:924px)]:translate-x-0 [@media(min-width:924px)]:-translate-y-8" style="position: relative; z-index: 50;" data-astro-cid-j7pv25f6> ', ' </div> <!-- \u6700\u65B0\u6587\u7AE0 - \u79FB\u52A8\u7AEF\u7B2C9\uFF0C\u684C\u9762\u7AEF\u53F3\u4E0B\u9760\u5DE6\u4E0A --> <div class="order-9 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-3 [@media(min-width:924px)]:row-start-3 [@media(min-width:924px)]:place-self-start [@media(min-width:924px)]:self-start [@media(min-width:924px)]:-translate-x-8 [@media(min-width:924px)]:-translate-y-32" data-astro-cid-j7pv25f6> ', ` </div> </div> <!-- /grid --> </div> <!-- \u89C6\u53E3\u9AD8\u5EA6\u4FEE\u590D - \u89E3\u51B3\u79FB\u52A8\u7AEF\u5730\u5740\u680F\u5BFC\u81F4\u7684\u5E03\u5C40\u95EE\u9898 --> <script>
    (function() {
      // \u8BBE\u7F6E\u89C6\u53E3\u9AD8\u5EA6 CSS \u53D8\u91CF
      function setVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', vh + 'px');
      }
      
      // \u521D\u59CB\u5316\u5E76\u76D1\u542C resize
      setVH();
      window.addEventListener('resize', setVH);
      
      // \u76D1\u542C\u65B9\u5411\u53D8\u5316
      window.addEventListener('orientationchange', function() {
        setTimeout(setVH, 100);
      });
    })();
  <\/script> <!-- \u73AF\u5F62\u6587\u5B57\u4EA4\u4E92\u811A\u672C --> <script>
    (function() {
      const ring = document.getElementById('interactiveRing');
      
      if (!ring) return;
      
      // \u68C0\u6D4B\u662F\u5426\u4E3A\u89E6\u6478\u8BBE\u5907
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      
      let isInteracting = false;
      let animationId = null;
      let currentRotateX = 0;
      let currentRotateY = 0;
      let targetRotateX = 0;
      let targetRotateY = 0;
      let lastUpdateTime = 0;
      
      // \u5E73\u6ED1\u63D2\u503C\u51FD\u6570 - \u89E6\u6478\u8BBE\u5907\u4F7F\u7528\u66F4\u5FEB\u7684\u54CD\u5E94
      function lerp(start, end, factor) {
        return start + (end - start) * factor;
      }
      
      // \u66F4\u65B0\u73AF\u5F62\u6587\u5B57\u76843D\u65CB\u8F6C - \u4F18\u5316\u7248\u672C
      function updateRingTransform(timestamp) {
        // \u8282\u6D41\uFF1A\u89E6\u6478\u8BBE\u5907\u6BCF 16ms (60fps) \u66F4\u65B0\u4E00\u6B21\uFF0C\u975E\u89E6\u6478\u8BBE\u5907\u53EF\u4EE5\u66F4\u5FEB
        const minInterval = isTouchDevice ? 16 : 8;
        if (timestamp - lastUpdateTime < minInterval) {
          animationId = requestAnimationFrame(updateRingTransform);
          return;
        }
        lastUpdateTime = timestamp;
        
        // \u4F7F\u7528\u4E0D\u540C\u7684\u63D2\u503C\u56E0\u5B50\uFF1A\u89E6\u6478\u8BBE\u5907\u66F4\u5FEB\u54CD\u5E94
        const lerpFactor = isTouchDevice ? 0.15 : 0.1;
        currentRotateX = lerp(currentRotateX, targetRotateX, lerpFactor);
        currentRotateY = lerp(currentRotateY, targetRotateY, lerpFactor);
        
        // \u6279\u91CF\u8BBE\u7F6E\u6837\u5F0F\uFF0C\u51CF\u5C11\u91CD\u6392
        ring.style.cssText += \`--rotateX: \${currentRotateX.toFixed(2)}deg; --rotateY: \${currentRotateY.toFixed(2)}deg; --translateZ: \${isInteracting ? '30px' : '0px'};\`;
        
        animationId = requestAnimationFrame(updateRingTransform);
      }
      
      // \u5F00\u59CB\u52A8\u753B\u5FAA\u73AF
      animationId = requestAnimationFrame(updateRingTransform);
      
      // \u9F20\u6807\u79FB\u52A8\u4E8B\u4EF6
      function handleMove(clientX, clientY) {
        const rect = ring.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // \u8BA1\u7B97\u9F20\u6807\u76F8\u5BF9\u4E8E\u73AF\u5F62\u4E2D\u5FC3\u7684\u4F4D\u7F6E (-1 \u5230 1)
        const percentX = (clientX - centerX) / (rect.width / 2);
        const percentY = (clientY - centerY) / (rect.height / 2);
        
        // \u9650\u5236\u8303\u56F4
        const clampedX = Math.max(-1, Math.min(1, percentX));
        const clampedY = Math.max(-1, Math.min(1, percentY));
        
        // \u8BBE\u7F6E\u76EE\u6807\u65CB\u8F6C\u89D2\u5EA6 (\u6700\u5927 \xB115\u5EA6)
        targetRotateY = clampedX * 15;
        targetRotateX = -clampedY * 15;
      }
      
      // \u9F20\u6807\u8FDB\u5165
      ring.addEventListener('mouseenter', function() {
        isInteracting = true;
        ring.classList.add('interacting');
      });
      
      // \u9F20\u6807\u79FB\u52A8
      ring.addEventListener('mousemove', function(e) {
        handleMove(e.clientX, e.clientY);
      });
      
      // \u9F20\u6807\u79BB\u5F00
      ring.addEventListener('mouseleave', function() {
        isInteracting = false;
        ring.classList.remove('interacting');
        targetRotateX = 0;
        targetRotateY = 0;
      });
      
      // \u89E6\u6478\u4E8B\u4EF6\u652F\u6301
      ring.addEventListener('touchstart', function(e) {
        isInteracting = true;
        ring.classList.add('interacting');
        e.preventDefault();
      }, { passive: false });
      
      ring.addEventListener('touchmove', function(e) {
        if (e.touches.length > 0) {
          handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
        e.preventDefault();
      }, { passive: false });
      
      ring.addEventListener('touchend', function() {
        isInteracting = false;
        ring.classList.remove('interacting');
        targetRotateX = 0;
        targetRotateY = 0;
      });
      
      // \u8BBE\u5907\u65B9\u5411\u652F\u6301 (\u79FB\u52A8\u7AEF)
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(e) {
          if (!isInteracting && e.beta !== null && e.gamma !== null) {
            // beta: \u524D\u540E\u503E\u659C (-180 \u5230 180), gamma: \u5DE6\u53F3\u503E\u659C (-90 \u5230 90)
            targetRotateX = Math.max(-15, Math.min(15, e.beta * 0.3));
            targetRotateY = Math.max(-15, Math.min(15, e.gamma * 0.3));
          }
        });
      }
    })();
    
    // \u5BFC\u822A\u5361\u7247\u4F18\u96C5\u52A8\u6548 - \u70B9\u51FB\u4EFB\u610F\u94FE\u63A5\u65F6\u89E6\u53D1 - \u4F18\u5316\u7248\u672C
    (function() {
      const navCard = document.getElementById('navCard');
      const gridContainer = document.querySelector('.grid');
      
      if (!navCard) return;
      
      // \u68C0\u6D4B\u662F\u5426\u4E3A\u89E6\u6478\u8BBE\u5907
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      
      // \u91CD\u7F6E\u5BFC\u822A\u680F\u5230\u5361\u7247\u72B6\u6001\u7684\u51FD\u6570
      function resetNavCardToCardState() {
        // \u79FB\u9664\u56FA\u5B9A\u5B9A\u4F4D\u6837\u5F0F
        navCard.style.position = '';
        navCard.style.top = '';
        navCard.style.left = '';
        navCard.style.zIndex = '';
        
        // \u6062\u590D\u684C\u9762\u7AEF\u4F4D\u79FB\u7C7B
        navCard.classList.add('[@media(min-width:924px)]:translate-x-64', '[@media(min-width:924px)]:-translate-y-0');
        
        // \u79FB\u9664 GPU \u52A0\u901F\u548C\u5E03\u5C40\u8F6C\u6362\u7C7B
        navCard.classList.remove('gpu-accelerated', 'nav-card-layout-change');
        
        // \u6062\u590D\u5176\u4ED6\u5143\u7D20\u7684\u663E\u793A
        if (gridContainer) {
          const children = gridContainer.children;
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.id !== 'navCard') {
              child.style.willChange = '';
              child.style.transition = '';
              child.style.opacity = '';
              child.style.transform = '';
            }
          }
        }
      }
      
      // \u9875\u9762\u53EF\u89C1\u6027\u53D8\u5316\u65F6\u91CD\u7F6E\u5BFC\u822A\u680F\uFF08\u5904\u7406\u4ECE\u5176\u4ED6\u9875\u9762\u8FD4\u56DE\u7684\u60C5\u51B5\uFF09
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
          // \u9875\u9762\u91CD\u65B0\u53EF\u89C1\u65F6\uFF0C\u91CD\u7F6E\u5BFC\u822A\u680F\u72B6\u6001
          resetNavCardToCardState();
        }
      });
      
      // \u9875\u9762\u52A0\u8F7D\u65F6\u786E\u4FDD\u5BFC\u822A\u680F\u5728\u6B63\u786E\u4F4D\u7F6E
      window.addEventListener('pageshow', function(e) {
        // \u5982\u679C\u662F\u4ECE\u7F13\u5B58\u52A0\u8F7D\u7684\u9875\u9762\uFF08\u5982\u6D4F\u89C8\u5668\u8FD4\u56DE\uFF09\uFF0C\u91CD\u7F6E\u5BFC\u822A\u680F
        if (e.persisted) {
          resetNavCardToCardState();
        }
      });
      
      // \u83B7\u53D6\u6240\u6709\u4F1A\u8DF3\u8F6C\u7684\u94FE\u63A5
      const allLinks = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
      
      allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          
          // \u6392\u9664\u5916\u90E8\u94FE\u63A5\u548C\u951A\u70B9\u94FE\u63A5
          if (!href || href.startsWith('http') || href.startsWith('#')) return;
          
          e.preventDefault();
          
          // \u4F7F\u7528 requestAnimationFrame \u786E\u4FDD\u6D41\u7545\u7684\u52A8\u753B\u5F00\u59CB
          requestAnimationFrame(() => {
            // \u76F4\u63A5\u8BBE\u7F6E\u56FA\u5B9A\u5B9A\u4F4D\u5230\u5DE6\u4E0A\u89D2
            navCard.style.position = 'fixed';
            navCard.style.top = '16px';
            navCard.style.left = '16px';
            navCard.style.zIndex = '9999';
            navCard.classList.remove('[@media(min-width:924px)]:translate-x-64', '[@media(min-width:924px)]:-translate-y-0');

            // \u6DFB\u52A0 GPU \u52A0\u901F\u7C7B
            navCard.classList.add('gpu-accelerated');
            
            // \u7ACB\u5373\u5F00\u59CB\u5E03\u5C40\u8F6C\u6362\u52A8\u753B
            navCard.classList.add('nav-card-layout-change');
          });

          // \u5176\u4ED6\u5143\u7D20\u6DE1\u51FA\uFF08\u6392\u9664\u7EDF\u8BA1\u5361\u7247\uFF09- \u4F7F\u7528 requestAnimationFrame \u6279\u91CF\u5904\u7406
          if (gridContainer) {
            requestAnimationFrame(() => {
              const children = gridContainer.children;
              for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const hasStats = child.querySelector('.stat-number');
                if (!hasStats && child.id !== 'navCard') {
                  child.style.willChange = 'opacity, transform';
                  child.style.transition = 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
                  child.style.opacity = '0';
                  child.style.transform = 'scale(0.97)';
                }
              }
            });
          }
          
          // \u5EF6\u8FDF\u8DF3\u8F6C - \u79FB\u52A8\u7AEF\u4F7F\u7528\u66F4\u77ED\u7684\u5EF6\u8FDF
          const delay = isTouchDevice ? 650 : 750;
          setTimeout(() => {
            window.location.href = href;
          }, delay);
        });
      });
    })();
  <\/script> </body> </html>`], [`<html lang="zh-CN" data-astro-cid-j7pv25f6> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>QwQBiG's World</title><meta name="description" content="CS Learning Notes | Algorithms | Programming | Embedded Development"><link rel="icon" type="image/png" href="/ZhenXun.png"><!-- \u8D44\u6E90\u9884\u8FDE\u63A5\u4F18\u5316 --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><!-- \u9884\u52A0\u8F7D\u5173\u952E\u8D44\u6E90 --><link rel="preload" href="/ZhenXun.png" as="image" fetchpriority="high"><link rel="preload" href="/images/character.png" as="image" fetchpriority="high"><!-- \u5B57\u4F53\u9884\u52A0\u8F7D\uFF1A\u63D0\u524D\u52A0\u8F7D latin \u5B50\u96C6\uFF0C\u907F\u514D FOUT/FOIT --><!-- Google Fonts v2 API \u5DF2\u81EA\u52A8\u6309 unicode-range \u5206\u7247\uFF0C\u6B64\u5904\u53EA\u9884\u52A0\u8F7D latin \u5B50\u96C6 --><!-- Quicksand latin (\u8986\u76D6 300/400/500/600/700) --><link rel="preload" href="https://fonts.gstatic.com/s/quicksand/v37/6xKtdSZaM9iE8KbpRA_hK1QN.woff2" as="font" type="font/woff2" crossorigin><!-- Cormorant Garamond Normal latin (\u8986\u76D6 400/500/600/700) --><link rel="preload" href="https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2" as="font" type="font/woff2" crossorigin><!-- Cormorant Garamond Italic latin (\u8986\u76D6 400/500) --><link rel="preload" href="https://fonts.gstatic.com/s/cormorantgaramond/v21/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEtImSo.woff2" as="font" type="font/woff2" crossorigin>`, '</head> <body class="gradient-bg" data-astro-cid-j7pv25f6> <!-- \u5916\u5C42\u5305\u88C5\u5668 - \u59CB\u7EC8\u5C45\u4E2D --> <div class="min-h-screen w-full flex items-center justify-center overflow-hidden py-6 [@media(min-width:924px)]:py-8 px-4 sm:px-6 [@media(min-width:924px)]:px-12 xl:px-12" data-astro-cid-j7pv25f6> <!-- \u7F51\u683C\u5BB9\u5668 - \u7531\u5916\u5C42 flex \u63A8\u5230\u5C4F\u5E55\u4E2D\u5FC3 --> <div class="flex flex-col [@media(min-width:924px)]:grid [@media(min-width:924px)]:grid-cols-3 gap-6 [@media(min-width:924px)]:gap-10 relative" data-astro-cid-j7pv25f6> <!-- ========== \u79FB\u52A8\u7AEF\u7B2C1\u4E2A / \u684C\u9762\u7AEF\u5DE6\u4E0A ========== --> <!-- \u6B22\u8FCE\u5361\u7247 - \u79FB\u52A8\u7AEF\u7B2C1\uFF0C\u684C\u9762\u7AEF\u5DE6\u4E0A\u5411\u53F3\u4E0B\u504F\u79FB --> <div class="order-1 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-1 [@media(min-width:924px)]:row-start-1 [@media(min-width:924px)]:place-self-start [@media(min-width:924px)]:translate-y-4 welcome-card-offset" data-astro-cid-j7pv25f6> ', ' </div> <!-- \u7EDF\u8BA1\u5361\u7247 - \u79FB\u52A8\u7AEF\u7B2C4\uFF0C\u684C\u9762\u7AEF\u5DE6\u4E2D\u9760\u53F3 --> <div class="order-4 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-1 [@media(min-width:924px)]:row-start-2 [@media(min-width:924px)]:place-self-start [@media(min-width:924px)]:self-center [@media(min-width:924px)]:translate-x-16 [@media(min-width:924px)]:-translate-y-4" data-astro-cid-j7pv25f6> ', ' </div> <!-- \u65F6\u949F - \u79FB\u52A8\u7AEF\u7B2C6\uFF0C\u684C\u9762\u7AEF\u53F3\u4E0A\u9760\u5DE6\u4E0B --> <div class="order-6 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-3 [@media(min-width:924px)]:row-start-1 [@media(min-width:924px)]:place-self-end [@media(min-width:924px)]:self-start [@media(min-width:924px)]:-translate-x-64 [@media(min-width:924px)]:translate-y-20" data-astro-cid-j7pv25f6> ', ' </div> <!-- ========== \u7B2C1\u884C\u4E2D\u95F4 - \u4E0A\u65B9\u56FE\u7247\u5361\u7247 ========== --> <!-- \u56FE\u7247\u5361\u7247 - \u79FB\u52A8\u7AEF\u7B2C8\uFF0C\u684C\u9762\u7AEF\u4E2D\u4E0A --> <div class="order-8 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-2 [@media(min-width:924px)]:row-start-1 [@media(min-width:924px)]:place-self-center [@media(min-width:924px)]:self-start [@media(min-width:924px)]:translate-y-4" data-astro-cid-j7pv25f6> <a href="/gallery/" class="block" data-astro-cid-j7pv25f6> ', ` </a> </div> <!-- ========== \u7B2C2\u884C - \u4E2D\u5FC3C\u4F4D ========== --> <!-- \u5BFC\u822A\u83DC\u5355 - \u79FB\u52A8\u7AEF\u7B2C7\uFF0C\u684C\u9762\u7AEF\u5DE6\u4E2D\uFF0C\u70B9\u51FB\u540E\u56FA\u5B9A\u5230\u5DE6\u4E0A\u89D2 --> <div id="navCard" class="order-7 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-1 [@media(min-width:924px)]:row-start-2 [@media(min-width:924px)]:place-self-start [@media(min-width:924px)]:self-center [@media(min-width:924px)]:translate-x-64 [@media(min-width:924px)]:-translate-y-0 transition-all duration-500" data-astro-cid-j7pv25f6> <!-- \u5185\u8054 GlassCard \u7ED3\u6784\uFF0C\u521D\u59CB\u72B6\u6001\u66F4\u5BBD\u677E\uFF0C\u8F6C\u6362\u540E\u4E0E FloatingNavCard \u4E00\u81F4 --> <div class="glass-card relative overflow-hidden bg-white/30 backdrop-blur-xl border border-white/60 rounded-[2rem] p-5 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 ease-out cursor-pointer w-full max-w-[85vw] [@media(min-width:924px)]:w-auto" data-tilt="true" style="
              transform-style: preserve-3d;
              will-change: transform;
              box-shadow:
                0 20px 40px -15px rgba(0, 0, 0, 0.08),
                0 40px 60px -20px rgba(0, 0, 0, 0.05),
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.7),
                inset 0 -1px 1px 0 rgba(255, 255, 255, 0.3);
            " data-astro-cid-j7pv25f6> <!-- \u9876\u90E8\u8FB9\u7F18\u9AD8\u5149 - \u6A21\u62DF\u73BB\u7483\u53CD\u5149 --> <div class="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-[1]" data-astro-cid-j7pv25f6></div> <!-- \u5185\u90E8\u5149\u6655\u6548\u679C - \u67D4\u548C\u6E10\u53D8 --> <div class="absolute inset-0 rounded-[2rem] pointer-events-none z-[1]" style="
                background: linear-gradient(
                  165deg,
                  rgba(255, 255, 255, 0.5) 0%,
                  rgba(255, 255, 255, 0.2) 30%,
                  rgba(255, 255, 255, 0.05) 60%,
                  rgba(255, 255, 255, 0) 100%
                );
              " data-astro-cid-j7pv25f6></div> <!-- \u5E95\u90E8\u5FAE\u5149 - \u589E\u52A0\u7ACB\u4F53\u611F --> <div class="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-[2rem] pointer-events-none z-[1]" style="
                background: linear-gradient(
                  to top,
                  rgba(255, 255, 255, 0.15) 0%,
                  transparent 100%
                );
              " data-astro-cid-j7pv25f6></div> <!-- \u52A8\u6001\u9AD8\u5149/\u53CD\u5149\u5C42 - \u8DDF\u968F\u9F20\u6807 --> <div class="glare absolute inset-0 rounded-[2rem] pointer-events-none z-[2] opacity-0 transition-opacity duration-500" style="
                background: radial-gradient(
                  circle at 50% 50%,
                  rgba(255, 255, 255, 0.9) 0%,
                  rgba(255, 255, 255, 0.5) 20%,
                  rgba(255, 255, 255, 0.2) 40%,
                  transparent 70%
                );
                mix-blend-mode: soft-light;
              " data-astro-cid-j7pv25f6></div> <!-- \u5185\u5BB9\u533A\u57DF --> <div class="relative z-[999] h-full" style="pointer-events: auto;" data-astro-cid-j7pv25f6> <div class="nav-container flex [@media(min-width:924px)]:flex-row flex-col gap-4" data-astro-cid-j7pv25f6> <!-- \u5DE6\u4FA7\uFF1A\u5934\u50CF\uFF08\u684C\u9762\u7AEF\uFF09/ \u4E0A\u65B9\uFF1A\u5934\u50CF\uFF08\u79FB\u52A8\u7AEF\uFF09 --> <div class="flex-shrink-0" data-astro-cid-j7pv25f6> <div class="nav-avatar relative w-14 h-14 [@media(min-width:924px)]:w-16 [@media(min-width:924px)]:h-16 translate-x-2 translate-y-2" data-astro-cid-j7pv25f6> <img src="/ZhenXun.png" alt="iqwqi" class="w-full h-full object-cover rounded-[1rem] border-2 border-white/60 shadow-md" data-astro-cid-j7pv25f6> <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm" data-astro-cid-j7pv25f6></div> </div> </div> <!-- \u53F3\u4FA7\uFF1A\u5BFC\u822A\u94FE\u63A5 --> <nav class="nav-links flex flex-col gap-2" data-astro-cid-j7pv25f6> <a href="/cs/" class="nav-link font-['Quicksand']" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>posts</span> </a> <a href="/series/" class="nav-link font-['Quicksand']" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>series</span> </a> <a href="/tags/" class="nav-link font-['Quicksand']" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>tags</span> </a> <a href="/archives/" class="nav-link font-['Quicksand']" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>archives</span> </a> <a href="/poetry/" class="nav-link font-['Quicksand']" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>poetry</span> </a> <a href="/about/" class="nav-link font-['Quicksand']" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>about</span> </a> <a href="/search/" class="nav-link font-['Quicksand']" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-astro-cid-j7pv25f6></path> </svg> <span data-astro-cid-j7pv25f6>search</span> </a> </nav> </div> </div> </div> </div> <!-- 3D \u79FB\u52A8\u7AEF\u7B2C2\uFF0C\u684C\u9762\u7AEF\u4E2D\u5FC3\u7EDD\u5BF9C\u4F4D --> <div class="order-2 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-2 [@media(min-width:924px)]:row-start-2 [@media(min-width:924px)]:place-self-center flex justify-center items-center" data-astro-cid-j7pv25f6> <div class="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] [@media(min-width:924px)]:w-[500px] [@media(min-width:924px)]:h-[500px] flex items-center justify-center" data-astro-cid-j7pv25f6> <!-- \u5927\u5706\u5F62\u80CC\u666F - \u53EA\u6709\u5706\u5F62\uFF0C\u6CA1\u6709\u65B9\u5F62\u80CC\u666F\uFF0C\u66F4\u6DF1\u7684\u5F25\u6563\u9634\u5F71 --> <div class="absolute w-[250px] h-[250px] sm:w-[280px] sm:h-[280px] md:w-[340px] md:h-[340px] [@media(min-width:924px)]:w-[440px] [@media(min-width:924px)]:h-[440px] rounded-full bg-white/30 backdrop-blur-xl border border-white/60" style="box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.15), 0 50px 100px -30px rgba(0, 0, 0, 0.1), 0 80px 140px -40px rgba(0, 0, 0, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.7);" data-astro-cid-j7pv25f6></div> <!-- \u4E2D\u5FC3 3D \u52A8\u6F2B\u89D2\u8272\u5C55\u793A - \u547C\u5438\u611F\u7403\u4F53\u6837\u5F0F --> <div class="absolute w-44 h-44 sm:w-52 sm:h-52 md:w-64 md:h-64 [@media(min-width:924px)]:w-80 [@media(min-width:924px)]:h-80 rounded-full overflow-hidden z-10 breathing-sphere" data-astro-cid-j7pv25f6> `, ` </div> <!-- \u73AF\u5F62\u6587\u5B57 - \u4F18\u96C5\u76843D\u60AC\u6D6E\u52A8\u6548 + \u4EA4\u4E92 --> <div id="interactiveRing" class="absolute w-[270px] h-[270px] sm:w-[300px] sm:h-[300px] md:w-[380px] md:h-[380px] [@media(min-width:924px)]:w-[480px] [@media(min-width:924px)]:h-[480px] floating-ring cursor-pointer" style="perspective: 1000px; transform-style: preserve-3d;" data-astro-cid-j7pv25f6> <svg viewBox="0 0 300 300" class="w-full h-full ring-text-rotate" style="transform-style: preserve-3d;" data-astro-cid-j7pv25f6> <defs data-astro-cid-j7pv25f6> <path id="textCircle" d="M 150, 150 m -110, 0 a 110,110 0 1,1 220,0 a 110,110 0 1,1 -220,0" fill="none" data-astro-cid-j7pv25f6></path> <!-- \u6E10\u53D8\u5B9A\u4E49 --> <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%" data-astro-cid-j7pv25f6> <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" data-astro-cid-j7pv25f6></stop> <stop offset="50%" style="stop-color:#ec4899;stop-opacity:1" data-astro-cid-j7pv25f6></stop> <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" data-astro-cid-j7pv25f6></stop> </linearGradient> <!-- \u53D1\u5149\u6EE4\u955C --> <filter id="glow" data-astro-cid-j7pv25f6> <feGaussianBlur stdDeviation="2" result="coloredBlur" data-astro-cid-j7pv25f6></feGaussianBlur> <feMerge data-astro-cid-j7pv25f6> <feMergeNode in="coloredBlur" data-astro-cid-j7pv25f6></feMergeNode> <feMergeNode in="SourceGraphic" data-astro-cid-j7pv25f6></feMergeNode> </feMerge> </filter> </defs> <!-- \u6587\u5B57 --> <text class="text-[11px] md:text-[12px] font-medium tracking-[0.12em] font-['Cormorant_Garamond'] italic" fill="url(#textGradient)" style="filter: drop-shadow(0 1px 2px rgba(139, 92, 246, 0.3));" data-astro-cid-j7pv25f6> <textPath href="#textCircle" startOffset="15%" data-astro-cid-j7pv25f6>
iqwqi \u2022 cs learner \u2022 code lover \u2022 embedded explorer \u2022 dreamer \u2022 creator \u2022 iqwqi \u2022 cs learner \u2022 code lover \u2022 embedded explorer \u2022 dreamer \u2022 creator \u2022
</textPath> </text> </svg> </div> </div> </div> <!-- \u793E\u4EA4\u94FE\u63A5 - \u79FB\u52A8\u7AEF\u7B2C5\uFF0C\u684C\u9762\u7AEF\u53F3\u4E2D\u9760\u5DE6\uFF08\u65E5\u5386\u5DE6\u8FB9\uFF09 --> <div class="order-5 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-3 [@media(min-width:924px)]:row-start-2 [@media(min-width:924px)]:place-self-start [@media(min-width:924px)]:self-center [@media(min-width:924px)]:translate-x-4 [@media(min-width:924px)]:translate-y-2" data-astro-cid-j7pv25f6> `, ' </div> <!-- \u65E5\u5386 - \u79FB\u52A8\u7AEF\u7B2C10\uFF0C\u684C\u9762\u7AEF\u53F3\u4E2D\u9760\u53F3 --> <div class="order-10 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-3 [@media(min-width:924px)]:row-start-2 [@media(min-width:924px)]:place-self-end [@media(min-width:924px)]:self-center [@media(min-width:924px)]:-translate-x-24 [@media(min-width:924px)]:translate-y-0" data-astro-cid-j7pv25f6> ', ' </div> <!-- ========== \u7B2C3\u884C ========== --> <!-- \u5E38\u7528\u6807\u7B7E - \u79FB\u52A8\u7AEF\u7B2C8\uFF0C\u684C\u9762\u7AEF\u5DE6\u4E0B\u9760\u53F3\u4E0A --> <div class="order-8 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-1 [@media(min-width:924px)]:row-start-3 [@media(min-width:924px)]:place-self-start [@media(min-width:924px)]:self-end [@media(min-width:924px)]:translate-x-32 [@media(min-width:924px)]:-translate-y-32" data-astro-cid-j7pv25f6> ', ' </div> <!-- \u97F3\u4E50\u64AD\u653E\u5668 - \u79FB\u52A8\u7AEF\u7B2C3\uFF0C\u684C\u9762\u7AEF\u4E2D\u4E0B\u9760\u4E0A\u504F\u53F3 --> <div class="order-3 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-2 [@media(min-width:924px)]:row-start-3 [@media(min-width:924px)]:place-self-start [@media(min-width:924px)]:self-center [@media(min-width:924px)]:translate-x-0 [@media(min-width:924px)]:-translate-y-8" style="position: relative; z-index: 50;" data-astro-cid-j7pv25f6> ', ' </div> <!-- \u6700\u65B0\u6587\u7AE0 - \u79FB\u52A8\u7AEF\u7B2C9\uFF0C\u684C\u9762\u7AEF\u53F3\u4E0B\u9760\u5DE6\u4E0A --> <div class="order-9 [@media(min-width:924px)]:order-none [@media(min-width:924px)]:col-start-3 [@media(min-width:924px)]:row-start-3 [@media(min-width:924px)]:place-self-start [@media(min-width:924px)]:self-start [@media(min-width:924px)]:-translate-x-8 [@media(min-width:924px)]:-translate-y-32" data-astro-cid-j7pv25f6> ', ` </div> </div> <!-- /grid --> </div> <!-- \u89C6\u53E3\u9AD8\u5EA6\u4FEE\u590D - \u89E3\u51B3\u79FB\u52A8\u7AEF\u5730\u5740\u680F\u5BFC\u81F4\u7684\u5E03\u5C40\u95EE\u9898 --> <script>
    (function() {
      // \u8BBE\u7F6E\u89C6\u53E3\u9AD8\u5EA6 CSS \u53D8\u91CF
      function setVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', vh + 'px');
      }
      
      // \u521D\u59CB\u5316\u5E76\u76D1\u542C resize
      setVH();
      window.addEventListener('resize', setVH);
      
      // \u76D1\u542C\u65B9\u5411\u53D8\u5316
      window.addEventListener('orientationchange', function() {
        setTimeout(setVH, 100);
      });
    })();
  <\/script> <!-- \u73AF\u5F62\u6587\u5B57\u4EA4\u4E92\u811A\u672C --> <script>
    (function() {
      const ring = document.getElementById('interactiveRing');
      
      if (!ring) return;
      
      // \u68C0\u6D4B\u662F\u5426\u4E3A\u89E6\u6478\u8BBE\u5907
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      
      let isInteracting = false;
      let animationId = null;
      let currentRotateX = 0;
      let currentRotateY = 0;
      let targetRotateX = 0;
      let targetRotateY = 0;
      let lastUpdateTime = 0;
      
      // \u5E73\u6ED1\u63D2\u503C\u51FD\u6570 - \u89E6\u6478\u8BBE\u5907\u4F7F\u7528\u66F4\u5FEB\u7684\u54CD\u5E94
      function lerp(start, end, factor) {
        return start + (end - start) * factor;
      }
      
      // \u66F4\u65B0\u73AF\u5F62\u6587\u5B57\u76843D\u65CB\u8F6C - \u4F18\u5316\u7248\u672C
      function updateRingTransform(timestamp) {
        // \u8282\u6D41\uFF1A\u89E6\u6478\u8BBE\u5907\u6BCF 16ms (60fps) \u66F4\u65B0\u4E00\u6B21\uFF0C\u975E\u89E6\u6478\u8BBE\u5907\u53EF\u4EE5\u66F4\u5FEB
        const minInterval = isTouchDevice ? 16 : 8;
        if (timestamp - lastUpdateTime < minInterval) {
          animationId = requestAnimationFrame(updateRingTransform);
          return;
        }
        lastUpdateTime = timestamp;
        
        // \u4F7F\u7528\u4E0D\u540C\u7684\u63D2\u503C\u56E0\u5B50\uFF1A\u89E6\u6478\u8BBE\u5907\u66F4\u5FEB\u54CD\u5E94
        const lerpFactor = isTouchDevice ? 0.15 : 0.1;
        currentRotateX = lerp(currentRotateX, targetRotateX, lerpFactor);
        currentRotateY = lerp(currentRotateY, targetRotateY, lerpFactor);
        
        // \u6279\u91CF\u8BBE\u7F6E\u6837\u5F0F\uFF0C\u51CF\u5C11\u91CD\u6392
        ring.style.cssText += \\\`--rotateX: \\\${currentRotateX.toFixed(2)}deg; --rotateY: \\\${currentRotateY.toFixed(2)}deg; --translateZ: \\\${isInteracting ? '30px' : '0px'};\\\`;
        
        animationId = requestAnimationFrame(updateRingTransform);
      }
      
      // \u5F00\u59CB\u52A8\u753B\u5FAA\u73AF
      animationId = requestAnimationFrame(updateRingTransform);
      
      // \u9F20\u6807\u79FB\u52A8\u4E8B\u4EF6
      function handleMove(clientX, clientY) {
        const rect = ring.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // \u8BA1\u7B97\u9F20\u6807\u76F8\u5BF9\u4E8E\u73AF\u5F62\u4E2D\u5FC3\u7684\u4F4D\u7F6E (-1 \u5230 1)
        const percentX = (clientX - centerX) / (rect.width / 2);
        const percentY = (clientY - centerY) / (rect.height / 2);
        
        // \u9650\u5236\u8303\u56F4
        const clampedX = Math.max(-1, Math.min(1, percentX));
        const clampedY = Math.max(-1, Math.min(1, percentY));
        
        // \u8BBE\u7F6E\u76EE\u6807\u65CB\u8F6C\u89D2\u5EA6 (\u6700\u5927 \xB115\u5EA6)
        targetRotateY = clampedX * 15;
        targetRotateX = -clampedY * 15;
      }
      
      // \u9F20\u6807\u8FDB\u5165
      ring.addEventListener('mouseenter', function() {
        isInteracting = true;
        ring.classList.add('interacting');
      });
      
      // \u9F20\u6807\u79FB\u52A8
      ring.addEventListener('mousemove', function(e) {
        handleMove(e.clientX, e.clientY);
      });
      
      // \u9F20\u6807\u79BB\u5F00
      ring.addEventListener('mouseleave', function() {
        isInteracting = false;
        ring.classList.remove('interacting');
        targetRotateX = 0;
        targetRotateY = 0;
      });
      
      // \u89E6\u6478\u4E8B\u4EF6\u652F\u6301
      ring.addEventListener('touchstart', function(e) {
        isInteracting = true;
        ring.classList.add('interacting');
        e.preventDefault();
      }, { passive: false });
      
      ring.addEventListener('touchmove', function(e) {
        if (e.touches.length > 0) {
          handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
        e.preventDefault();
      }, { passive: false });
      
      ring.addEventListener('touchend', function() {
        isInteracting = false;
        ring.classList.remove('interacting');
        targetRotateX = 0;
        targetRotateY = 0;
      });
      
      // \u8BBE\u5907\u65B9\u5411\u652F\u6301 (\u79FB\u52A8\u7AEF)
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(e) {
          if (!isInteracting && e.beta !== null && e.gamma !== null) {
            // beta: \u524D\u540E\u503E\u659C (-180 \u5230 180), gamma: \u5DE6\u53F3\u503E\u659C (-90 \u5230 90)
            targetRotateX = Math.max(-15, Math.min(15, e.beta * 0.3));
            targetRotateY = Math.max(-15, Math.min(15, e.gamma * 0.3));
          }
        });
      }
    })();
    
    // \u5BFC\u822A\u5361\u7247\u4F18\u96C5\u52A8\u6548 - \u70B9\u51FB\u4EFB\u610F\u94FE\u63A5\u65F6\u89E6\u53D1 - \u4F18\u5316\u7248\u672C
    (function() {
      const navCard = document.getElementById('navCard');
      const gridContainer = document.querySelector('.grid');
      
      if (!navCard) return;
      
      // \u68C0\u6D4B\u662F\u5426\u4E3A\u89E6\u6478\u8BBE\u5907
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      
      // \u91CD\u7F6E\u5BFC\u822A\u680F\u5230\u5361\u7247\u72B6\u6001\u7684\u51FD\u6570
      function resetNavCardToCardState() {
        // \u79FB\u9664\u56FA\u5B9A\u5B9A\u4F4D\u6837\u5F0F
        navCard.style.position = '';
        navCard.style.top = '';
        navCard.style.left = '';
        navCard.style.zIndex = '';
        
        // \u6062\u590D\u684C\u9762\u7AEF\u4F4D\u79FB\u7C7B
        navCard.classList.add('[@media(min-width:924px)]:translate-x-64', '[@media(min-width:924px)]:-translate-y-0');
        
        // \u79FB\u9664 GPU \u52A0\u901F\u548C\u5E03\u5C40\u8F6C\u6362\u7C7B
        navCard.classList.remove('gpu-accelerated', 'nav-card-layout-change');
        
        // \u6062\u590D\u5176\u4ED6\u5143\u7D20\u7684\u663E\u793A
        if (gridContainer) {
          const children = gridContainer.children;
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.id !== 'navCard') {
              child.style.willChange = '';
              child.style.transition = '';
              child.style.opacity = '';
              child.style.transform = '';
            }
          }
        }
      }
      
      // \u9875\u9762\u53EF\u89C1\u6027\u53D8\u5316\u65F6\u91CD\u7F6E\u5BFC\u822A\u680F\uFF08\u5904\u7406\u4ECE\u5176\u4ED6\u9875\u9762\u8FD4\u56DE\u7684\u60C5\u51B5\uFF09
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
          // \u9875\u9762\u91CD\u65B0\u53EF\u89C1\u65F6\uFF0C\u91CD\u7F6E\u5BFC\u822A\u680F\u72B6\u6001
          resetNavCardToCardState();
        }
      });
      
      // \u9875\u9762\u52A0\u8F7D\u65F6\u786E\u4FDD\u5BFC\u822A\u680F\u5728\u6B63\u786E\u4F4D\u7F6E
      window.addEventListener('pageshow', function(e) {
        // \u5982\u679C\u662F\u4ECE\u7F13\u5B58\u52A0\u8F7D\u7684\u9875\u9762\uFF08\u5982\u6D4F\u89C8\u5668\u8FD4\u56DE\uFF09\uFF0C\u91CD\u7F6E\u5BFC\u822A\u680F
        if (e.persisted) {
          resetNavCardToCardState();
        }
      });
      
      // \u83B7\u53D6\u6240\u6709\u4F1A\u8DF3\u8F6C\u7684\u94FE\u63A5
      const allLinks = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
      
      allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          
          // \u6392\u9664\u5916\u90E8\u94FE\u63A5\u548C\u951A\u70B9\u94FE\u63A5
          if (!href || href.startsWith('http') || href.startsWith('#')) return;
          
          e.preventDefault();
          
          // \u4F7F\u7528 requestAnimationFrame \u786E\u4FDD\u6D41\u7545\u7684\u52A8\u753B\u5F00\u59CB
          requestAnimationFrame(() => {
            // \u76F4\u63A5\u8BBE\u7F6E\u56FA\u5B9A\u5B9A\u4F4D\u5230\u5DE6\u4E0A\u89D2
            navCard.style.position = 'fixed';
            navCard.style.top = '16px';
            navCard.style.left = '16px';
            navCard.style.zIndex = '9999';
            navCard.classList.remove('[@media(min-width:924px)]:translate-x-64', '[@media(min-width:924px)]:-translate-y-0');

            // \u6DFB\u52A0 GPU \u52A0\u901F\u7C7B
            navCard.classList.add('gpu-accelerated');
            
            // \u7ACB\u5373\u5F00\u59CB\u5E03\u5C40\u8F6C\u6362\u52A8\u753B
            navCard.classList.add('nav-card-layout-change');
          });

          // \u5176\u4ED6\u5143\u7D20\u6DE1\u51FA\uFF08\u6392\u9664\u7EDF\u8BA1\u5361\u7247\uFF09- \u4F7F\u7528 requestAnimationFrame \u6279\u91CF\u5904\u7406
          if (gridContainer) {
            requestAnimationFrame(() => {
              const children = gridContainer.children;
              for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const hasStats = child.querySelector('.stat-number');
                if (!hasStats && child.id !== 'navCard') {
                  child.style.willChange = 'opacity, transform';
                  child.style.transition = 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
                  child.style.opacity = '0';
                  child.style.transform = 'scale(0.97)';
                }
              }
            });
          }
          
          // \u5EF6\u8FDF\u8DF3\u8F6C - \u79FB\u52A8\u7AEF\u4F7F\u7528\u66F4\u77ED\u7684\u5EF6\u8FDF
          const delay = isTouchDevice ? 650 : 750;
          setTimeout(() => {
            window.location.href = href;
          }, delay);
        });
      });
    })();
  <\/script> </body> </html>`])), renderHead(), renderComponent($$result, "GlassCard", $$GlassCard, { "padding": "medium", "tilt": true, "class": "w-full max-w-[92vw] [@media(min-width:924px)]:max-w-sm", "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate` <div class="flex flex-col" data-astro-cid-j7pv25f6> <span class="inline-block px-3 py-1.5 bg-gradient-to-r from-purple-100/80 to-pink-100/80 rounded-full text-xs font-medium text-purple-700 mb-3 w-fit border border-purple-200/50 font-['Quicksand']" data-astro-cid-j7pv25f6>
✨ welcome to my world
</span> <h2 class="text-3xl font-semibold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent mb-2 font-['Cormorant_Garamond'] italic" data-astro-cid-j7pv25f6>iqwqi's world</h2> <p class="text-sm text-gray-500 mb-4 font-['Quicksand'] font-light" data-astro-cid-j7pv25f6>explore · create · share</p> <div class="flex flex-wrap gap-3" data-astro-cid-j7pv25f6> <!-- 主按钮 - 优雅的渐变填充 --> <a href="/cs/" class="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-purple-500/90 to-pink-500/90 text-white rounded-2xl font-medium text-sm tracking-wide hover:shadow-xl hover:shadow-purple-300/30 transition-all duration-300 hover:-translate-y-0.5 font-['Quicksand'] backdrop-blur-sm border border-white/20" data-astro-cid-j7pv25f6> <span data-astro-cid-j7pv25f6>enter</span> <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7l5 5m0 0l-5 5m5-5H6" data-astro-cid-j7pv25f6></path> </svg> </a> <!-- 次按钮 - 极简描边风格 --> <a href="/series/" class="group inline-flex items-center px-5 py-2.5 bg-white/40 text-purple-700 rounded-2xl font-medium text-sm tracking-wide hover:bg-white/60 hover:shadow-lg transition-all duration-300 border border-purple-200/50 font-['Quicksand']" data-astro-cid-j7pv25f6> <span data-astro-cid-j7pv25f6>series</span> <svg class="w-3.5 h-3.5 ml-1.5 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-astro-cid-j7pv25f6></path> </svg> </a> </div> </div> ` }), renderComponent($$result, "GlassCard", $$GlassCard, { "padding": "small", "tilt": true, "class": "w-full max-w-[85vw] [@media(min-width:924px)]:w-auto [@media(min-width:924px)]:scale-95", "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate` <div class="grid grid-cols-2 gap-x-6 gap-y-3" data-astro-cid-j7pv25f6> <div class="text-center flex flex-col items-center" data-astro-cid-j7pv25f6> <div class="stat-number font-['Cormorant_Garamond'] font-semibold" data-astro-cid-j7pv25f6>${totalPosts}</div> <div class="text-xs text-gray-500 mt-0.5 font-['Quicksand']" data-astro-cid-j7pv25f6>posts</div> </div> <div class="text-center flex flex-col items-center" data-astro-cid-j7pv25f6> <div class="stat-number font-['Cormorant_Garamond'] font-semibold" data-astro-cid-j7pv25f6>${totalSeries}</div> <div class="text-xs text-gray-500 mt-0.5 font-['Quicksand']" data-astro-cid-j7pv25f6>series</div> </div> <div class="text-center flex flex-col items-center" data-astro-cid-j7pv25f6> <div class="stat-number font-['Cormorant_Garamond'] font-semibold" data-astro-cid-j7pv25f6>${totalTags}</div> <div class="text-xs text-gray-500 mt-0.5 font-['Quicksand']" data-astro-cid-j7pv25f6>tags</div> </div> <div class="text-center flex flex-col items-center" data-astro-cid-j7pv25f6> <div class="stat-number font-['Cormorant_Garamond'] font-semibold" data-astro-cid-j7pv25f6>${yearsActive}</div> <div class="text-xs text-gray-500 mt-0.5 font-['Quicksand']" data-astro-cid-j7pv25f6>years</div> </div> </div> ` }), renderComponent($$result, "GlassCard", $$GlassCard, { "padding": "small", "tilt": true, "class": "w-full max-w-[70vw] [@media(min-width:924px)]:w-auto [@media(min-width:924px)]:scale-90", "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "ClockWidget", $$ClockWidget, { "data-astro-cid-j7pv25f6": true })} ` }), renderComponent($$result, "GlassCard", $$GlassCard, { "padding": "small", "tilt": true, "class": "w-full max-w-[60vw] [@media(min-width:924px)]:w-64 rounded-2xl", "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate` <div class="relative overflow-hidden rounded-2xl" data-astro-cid-j7pv25f6> <img src="/images/hahaha.png" alt="Gallery Cover" class="w-full h-32 object-cover rounded-2xl hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" fetchpriority="low" data-astro-cid-j7pv25f6> <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" data-astro-cid-j7pv25f6></div> </div> ` }), renderComponent($$result, "AnimeCore", AnimeCore, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Projects/MyBlog-Astro/src/components/3d/AnimeCore.tsx", "client:component-export": "default", "data-astro-cid-j7pv25f6": true }), renderComponent($$result, "GlassCard", $$GlassCard, { "padding": "small", "tilt": true, "class": "w-auto [@media(min-width:924px)]:scale-90", "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate` <div class="flex flex-col items-center gap-3" data-astro-cid-j7pv25f6> <!-- GitHub --> <a href="https://github.com/QwQBiG" target="_blank" rel="noopener noreferrer" class="p-3 rounded-xl bg-white/40 hover:bg-white/60 border border-white/50 hover:border-purple-400/50 transition-all hover:-translate-y-1 hover:shadow-lg group" aria-label="GitHub" data-astro-cid-j7pv25f6> <svg class="w-6 h-6 text-gray-700 group-hover:text-purple-600 transition-colors" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" data-astro-cid-j7pv25f6></path> </svg> </a> <!-- Bilibili --> <a href="https://space.bilibili.com/3546921071282890?spm_id_from=333.1007.0.0" target="_blank" rel="noopener noreferrer" class="p-3 rounded-xl bg-white/40 hover:bg-white/60 border border-white/50 hover:border-pink-400/50 transition-all hover:-translate-y-1 hover:shadow-lg group" aria-label="Bilibili" data-astro-cid-j7pv25f6> <svg class="w-6 h-6 text-gray-700 group-hover:text-pink-500 transition-colors" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906l-1.174 1.12zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773H5.333zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z" data-astro-cid-j7pv25f6></path> </svg> </a> <!-- LeetCode --> <a href="https://leetcode.cn/u/iqwqi/" target="_blank" rel="noopener noreferrer" class="p-3 rounded-xl bg-white/40 hover:bg-white/60 border border-white/50 hover:border-yellow-500/50 transition-all hover:-translate-y-1 hover:shadow-lg group" aria-label="LeetCode" data-astro-cid-j7pv25f6> <svg class="w-6 h-6 text-gray-700 group-hover:text-yellow-600 transition-colors" fill="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path d="M22,14.355c0-0.742-0.564-1.346-1.26-1.346H10.676c-0.696,0-1.26,0.604-1.26,1.346s0.563,1.346,1.26,1.346H20.74C21.436,15.702,22,15.098,22,14.355z" data-astro-cid-j7pv25f6></path> <path d="M3.482,18.187l4.313,4.361C8.768,23.527,10.113,24,11.598,24c1.485,0,2.83-0.512,3.805-1.494l2.588-2.637c0.51-0.514,0.492-1.365-0.039-1.9c-0.531-0.535-1.375-0.553-1.884-0.039l-2.676,2.607c-0.462,0.467-1.102,0.662-1.809,0.662s-1.346-0.195-1.81-0.662l-4.298-4.363c-0.463-0.467-0.696-1.15-0.696-1.863c0-0.713,0.233-1.357,0.696-1.824l4.285-4.38c0.463-0.467,1.116-0.645,1.822-0.645s1.346,0.195,1.809,0.662l2.676,2.606c0.51,0.515,1.354,0.497,1.885-0.038c0.531-0.536,0.549-1.387,0.039-1.901l-2.588-2.636c-0.649-0.646-1.471-1.116-2.392-1.33l-0.034-0.007l2.447-2.503c0.512-0.514,0.494-1.366-0.037-1.901c-0.531-0.535-1.376-0.552-1.887-0.038L3.482,10.476C2.509,11.458,2,12.813,2,14.311C2,15.809,2.509,17.207,3.482,18.187z" data-astro-cid-j7pv25f6></path> </svg> </a> </div> ` }), renderComponent($$result, "GlassCard", $$GlassCard, { "padding": "small", "tilt": true, "class": "w-full max-w-[90vw] [@media(min-width:924px)]:w-auto [@media(min-width:924px)]:scale-95", "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "CalendarWidget", $$CalendarWidget, { "data-astro-cid-j7pv25f6": true })} ` }), renderComponent($$result, "GlassCard", $$GlassCard, { "padding": "small", "tilt": true, "class": "w-full max-w-[92vw] [@media(min-width:924px)]:max-w-xs [@media(min-width:924px)]:scale-90", "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate` <div class="flex flex-col" data-astro-cid-j7pv25f6> <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 font-['Cormorant_Garamond'] italic" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" data-astro-cid-j7pv25f6></path> </svg>
popular tags
</h3> <div class="flex flex-wrap gap-1.5" data-astro-cid-j7pv25f6> ${Array.from(new Set(regularPosts.flatMap((p) => p.data.tags || []))).slice(0, 8).map((tag) => renderTemplate`<a${addAttribute(`/tags/${tag}/`, "href")} class="tag" data-astro-cid-j7pv25f6> ${tag} </a>`)} </div> </div> ` }), renderComponent($$result, "GlassCard", $$GlassCard, { "padding": "small", "tilt": true, "class": "w-full max-w-[95vw] [@media(min-width:924px)]:max-w-md [@media(min-width:924px)]:scale-95", "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "MusicWidget", $$MusicWidget, { "data-astro-cid-j7pv25f6": true })} ` }), renderComponent($$result, "GlassCard", $$GlassCard, { "padding": "medium", "tilt": true, "class": "w-full max-w-[92vw] [@media(min-width:924px)]:max-w-xs [@media(min-width:924px)]:scale-95", "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate` <div class="flex flex-col h-full" data-astro-cid-j7pv25f6> <div class="flex items-center justify-between mb-4" data-astro-cid-j7pv25f6> <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2 font-['Cormorant_Garamond'] italic" data-astro-cid-j7pv25f6> <svg class="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-astro-cid-j7pv25f6> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" data-astro-cid-j7pv25f6></path> </svg>
latest post
</h3> <a href="/cs/" class="text-xs text-purple-600 hover:text-purple-700 font-['Quicksand']" data-astro-cid-j7pv25f6>all →</a> </div> ${latestPosts.slice(0, 1).map((post) => renderTemplate`<a${addAttribute(`/cs/${post.slug}/`, "href")} class="post-item block group flex-1" data-astro-cid-j7pv25f6> <div class="flex flex-col h-full" data-astro-cid-j7pv25f6> <h4 class="text-base font-semibold text-gray-800 group-hover:text-purple-600 transition-colors leading-snug mb-2" data-astro-cid-j7pv25f6> ${post.data.title} </h4> <p class="text-xs text-gray-500 line-clamp-2 mb-3 flex-1" data-astro-cid-j7pv25f6> ${post.data.description || "No description"} </p> <div class="flex items-center justify-between pt-2 border-t border-gray-200/50" data-astro-cid-j7pv25f6> <span class="text-[10px] text-gray-400" data-astro-cid-j7pv25f6> ${post.data.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} </span> <span class="text-[10px] text-purple-500 group-hover:translate-x-1 transition-transform font-['Quicksand']" data-astro-cid-j7pv25f6>
read →
</span> </div> </div> </a>`)} </div> ` }));
}, "D:/Projects/MyBlog-Astro/src/pages/index.astro", void 0);

const $$file = "D:/Projects/MyBlog-Astro/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
