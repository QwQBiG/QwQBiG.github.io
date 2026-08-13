import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

type FilmState = {
  time: number;
  scroll: number;
  scene: number;
  local: number;
  velocity: number;
  pointerX: number;
  pointerY: number;
  pulse: number;
};

const vertexShader = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const fragmentShader = `
precision highp float;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uTime;
uniform float uScroll;
uniform float uScene;
uniform float uLocal;
uniform float uVelocity;
uniform float uPulse;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x), f.y);
}

vec3 sceneBase(float scene) {
  vec3 roseStudio = vec3(0.73, 0.49, 0.64);
  vec3 plumDark = vec3(0.105, 0.078, 0.145);
  vec3 pearlLilac = vec3(0.66, 0.65, 0.79);
  vec3 inkStudio = vec3(0.075, 0.078, 0.155);
  vec3 violetNight = vec3(0.105, 0.075, 0.175);
  vec3 blueDawn = vec3(0.54, 0.68, 0.84);
  vec3 color = roseStudio;
  color = mix(color, plumDark, smoothstep(0.58, 0.98, scene));
  color = mix(color, pearlLilac, smoothstep(1.58, 1.98, scene));
  color = mix(color, inkStudio, smoothstep(2.58, 2.98, scene));
  color = mix(color, violetNight, smoothstep(3.58, 3.98, scene));
  color = mix(color, blueDawn, smoothstep(4.58, 4.98, scene));
  return color;
}

vec3 sceneAccent(float scene) {
  vec3 rose = vec3(1.0, .52, .69);
  vec3 lilac = vec3(.72, .66, 1.0);
  vec3 ice = vec3(.67, .84, 1.0);
  vec3 accent = rose;
  accent = mix(accent, lilac, smoothstep(1.55, 2.2, scene));
  accent = mix(accent, rose, smoothstep(3.3, 4.0, scene));
  accent = mix(accent, ice, smoothstep(4.5, 5.0, scene));
  return accent;
}

float softEllipse(vec2 uv, vec2 center, vec2 radius) {
  vec2 q = (uv - center) / radius;
  return exp(-dot(q, q) * 2.15);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float drift = sin(uTime * .045) * .012;
  float camera = (uLocal - .5) * .018 + clamp(uVelocity * .00008, -.012, .012);
  vec2 stageUv = uv + vec2(camera, -camera * .38);

  vec3 base = sceneBase(uScene);
  vec3 accent = sceneAccent(uScene);
  float dark = smoothstep(.58, .98, uScene)
    - smoothstep(1.58, 1.98, uScene)
    + smoothstep(2.58, 2.98, uScene)
    - smoothstep(4.58, 4.98, uScene);
  dark = clamp(dark, 0.0, 1.0);

  float key = softEllipse(stageUv, vec2(.69 + drift, .31), vec2(.46, .6));
  float fill = softEllipse(stageUv, vec2(.18 - drift * .6, .72), vec2(.4, .52));
  float backlight = softEllipse(stageUv, vec2(.53, 1.08), vec2(.72, .54));
  float projector = exp(-abs((stageUv.x * aspect - stageUv.y * .18) - (.71 * aspect)) * 5.8);
  projector *= smoothstep(.02, .22, stageUv.y) * smoothstep(.98, .64, stageUv.y);
  float horizon = exp(-abs(stageUv.y - (.48 + sin(uScroll * 3.0) * .008)) * 54.0);

  float paperCloud = noise(stageUv * vec2(4.2, 3.4) + vec2(uTime * .004, 0.0));
  float paperFiber = noise(stageUv * vec2(34.0, 3.2));
  float scan = .5 + .5 * sin(gl_FragCoord.y * .32);

  vec3 color = base;
  color *= .76 + key * .19 + fill * .08;
  color += accent * (key * .105 + backlight * .055);
  color += mix(vec3(.055, .035, .065), vec3(.02, .03, .06), dark) * projector;
  color += accent * horizon * .035;
  color *= .965 + paperCloud * .045 + paperFiber * .012;
  color += (scan - .5) * .006;

  vec2 pointerDelta = (uv - uPointer) * vec2(aspect, 1.0);
  float pointerRadius = length(pointerDelta);
  float pointerLight = exp(-pointerRadius * 9.0);
  float pointerRing = exp(-abs(pointerRadius - (.075 + uPulse * .055)) * 52.0) * uPulse;
  color += accent * pointerLight * .035;
  color += accent * pointerRing * .13;

  float grain = hash21(gl_FragCoord.xy + fract(uTime * 7.0)) - .5;
  float vignette = smoothstep(1.02, .18, length((uv - .5) * vec2(.82, 1.0)));
  color += grain * .009;
  color *= .9 + vignette * .12;
  gl_FragColor = vec4(color, 1.0);
}`;

class LivingPaint {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private position: number;
  private uniforms: Record<string, WebGLUniformLocation | null>;
  private dpr = 1;

  static create(canvas: HTMLCanvasElement): LivingPaint | null {
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    if (!gl) return null;

    try {
      return new LivingPaint(canvas, gl);
    } catch (error) {
      console.warn('[about-film] WebGL paint unavailable:', error);
      return null;
    }
  }

  private constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
    this.canvas = canvas;
    this.gl = gl;
    this.program = this.createProgram(vertexShader, fragmentShader);
    this.position = gl.getAttribLocation(this.program, 'aPosition');
    this.uniforms = Object.fromEntries(
      ['uResolution', 'uPointer', 'uTime', 'uScroll', 'uScene', 'uLocal', 'uVelocity', 'uPulse']
        .map((name) => [name, gl.getUniformLocation(this.program, name)]),
    );

    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('Unable to create WebGL buffer');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(this.program);
    gl.enableVertexAttribArray(this.position);
    gl.vertexAttribPointer(this.position, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.DEPTH_TEST);
    this.resize();
  }

  private compile(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('Unable to create shader');
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const message = this.gl.getShaderInfoLog(shader) || 'Shader compilation failed';
      this.gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  private createProgram(vertex: string, fragment: string): WebGLProgram {
    const program = this.gl.createProgram();
    if (!program) throw new Error('Unable to create WebGL program');
    const vertexObject = this.compile(this.gl.VERTEX_SHADER, vertex);
    const fragmentObject = this.compile(this.gl.FRAGMENT_SHADER, fragment);
    this.gl.attachShader(program, vertexObject);
    this.gl.attachShader(program, fragmentObject);
    this.gl.linkProgram(program);
    this.gl.deleteShader(vertexObject);
    this.gl.deleteShader(fragmentObject);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error(this.gl.getProgramInfoLog(program) || 'Program linking failed');
    }
    return program;
  }

  resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.15 : 1.5);
    const width = Math.max(1, Math.round(window.innerWidth * this.dpr));
    const height = Math.max(1, Math.round(window.innerHeight * this.dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
    }
  }

  render(state: FilmState): void {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.uniform2f(this.uniforms.uResolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniforms.uPointer, state.pointerX, 1 - state.pointerY);
    gl.uniform1f(this.uniforms.uTime, state.time);
    gl.uniform1f(this.uniforms.uScroll, state.scroll);
    gl.uniform1f(this.uniforms.uScene, state.scene);
    gl.uniform1f(this.uniforms.uLocal, state.local);
    gl.uniform1f(this.uniforms.uVelocity, state.velocity);
    gl.uniform1f(this.uniforms.uPulse, state.pulse);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  destroy(): void {
    this.gl.deleteProgram(this.program);
  }
}

class MemoryThread {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private dpr = 1;

  static create(canvas: HTMLCanvasElement | null): MemoryThread | null {
    if (!canvas) return null;
    const context = canvas.getContext('2d');
    if (!context) return null;
    return new MemoryThread(canvas, context);
  }

  private constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = context;
    this.resize();
  }

  resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.max(1, Math.round(window.innerWidth * this.dpr));
    this.canvas.height = Math.max(1, Math.round(window.innerHeight * this.dpr));
    this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  render(state: FilmState): void {
    const context = this.context;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pointerX = state.pointerX * width;
    const pointerY = state.pointerY * height;
    const phase = state.scroll * Math.PI * 2.4 + state.time * 0.035;
    const darkScene = state.scene > .72 && state.scene < 1.82
      || state.scene > 2.72 && state.scene < 4.82;

    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = darkScene ? 'screen' : 'multiply';

    const sampleY = (x: number, offset: number) => {
      const normalized = x / Math.max(width, 1);
      const primary = Math.sin(normalized * Math.PI * 1.8 + phase) * height * .034;
      const secondary = Math.sin(normalized * Math.PI * 4.2 - phase * .38) * height * .014;
      const pointerDistance = (x - pointerX) / Math.max(width * .24, 1);
      const pointerInfluence = Math.exp(-(pointerDistance * pointerDistance) * 2.4);
      const pointerPull = (pointerY - height * .58) * .035 * pointerInfluence;
      return height * .64 + primary + secondary + pointerPull + offset;
    };

    const strands = [
      { width: 2.4, alpha: .16, offset: 9 },
      { width: .85, alpha: .54, offset: 0 },
    ];

    strands.forEach((strand, index) => {
      context.beginPath();
      for (let step = 0; step <= 96; step += 1) {
        const x = width * (step / 96);
        const y = sampleY(x, strand.offset);
        if (step === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.strokeStyle = darkScene
        ? `rgba(255, 184, 213, ${strand.alpha})`
        : `rgba(187, 55, 111, ${strand.alpha})`;
      context.lineWidth = strand.width;
      context.lineCap = 'round';
      context.stroke();

      if (index === 0) return;
      for (let node = 0; node < 6; node += 1) {
        const x = width * (.1 + node * .16);
        const y = sampleY(x, 0);
        const distance = Math.abs(state.scene - node);
        const active = Math.max(0, 1 - distance);
        context.beginPath();
        context.arc(x, y, 2.2 + active * 3.8, 0, Math.PI * 2);
        context.fillStyle = darkScene
          ? `rgba(255, 222, 235, ${.3 + active * .58})`
          : `rgba(224, 66, 126, ${.3 + active * .58})`;
        context.fill();
        if (active > .1) {
          context.beginPath();
          context.arc(x, y, 9 + active * 7, 0, Math.PI * 2);
          context.strokeStyle = darkScene
            ? `rgba(255, 163, 201, ${active * .28})`
            : `rgba(216, 54, 113, ${active * .22})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }
    });

    const pulse = Math.max(.08, state.pulse);
    context.beginPath();
    context.arc(pointerX, pointerY, 10 + pulse * 32, 0, Math.PI * 2);
    context.strokeStyle = darkScene
      ? `rgba(255, 213, 230, ${.08 + pulse * .2})`
      : `rgba(225, 62, 123, ${.06 + pulse * .18})`;
    context.lineWidth = 1;
    context.stroke();
    context.globalCompositeOperation = 'source-over';
  }
}

const layerMotion = [
  { from: { yPercent: -2, xPercent: -2, z: -720, scale: 1.5, rotate: 0.8 }, to: { yPercent: 3, xPercent: 2, z: -520, scale: 1.32, rotate: -0.6 } },
  { from: { yPercent: 13, xPercent: -13, z: -350, scale: 1.28, rotate: -1.2 }, to: { yPercent: -14, xPercent: 11, z: -190, scale: 1.1, rotate: 1.0 } },
  { from: { yPercent: 8, xPercent: 18, z: -120, scale: 1.12, rotate: 0.7 }, to: { yPercent: -9, xPercent: -17, z: 20, scale: 1.0, rotate: -0.7 } },
  { from: { yPercent: 17, xPercent: 0, z: 20, scale: 0.94, rotate: 0 }, to: { yPercent: -11, xPercent: 0, z: 95, scale: 1.025, rotate: 0 } },
  { from: { yPercent: 21, xPercent: -16, z: 260, scale: 0.82, rotate: -1.1 }, to: { yPercent: -22, xPercent: 14, z: 430, scale: 0.68, rotate: 1.05 } },
];

let disposeCurrent: (() => void) | undefined;

function setupAboutFilm(): (() => void) | undefined {
  const root = document.querySelector<HTMLElement>('[data-about-film]');
  if (!root) return undefined;

  const canvas = root.querySelector<HTMLCanvasElement>('[data-living-paint]');
  const threadCanvas = root.querySelector<HTMLCanvasElement>('[data-memory-thread]');
  const cursor = root.querySelector<HTMLElement>('[data-film-cursor]');
  const progressBar = root.querySelector<HTMLElement>('[data-film-progress]');
  const indexLabel = root.querySelector<HTMLElement>('[data-film-index]');
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-film-scene]'));
  const interactiveObjects = Array.from(root.querySelectorAll<HTMLElement>('[data-interactive-object]'));
  const processObjects = Array.from(root.querySelectorAll<HTMLElement>('[data-process-object]'));
  const processTriggers = Array.from(root.querySelectorAll<HTMLElement>('[data-object-trigger]'));
  const materialTriggers = Array.from(root.querySelectorAll<HTMLElement>('[data-material-trigger]'));
  const doorTriggers = Array.from(root.querySelectorAll<HTMLElement>('[data-door-trigger]'));
  const syntaxLoom = root.querySelector<HTMLElement>('.syntax-loom');
  const fieldJournal = root.querySelector<HTMLElement>('.field-journal');
  const writingDesk = root.querySelector<HTMLElement>('.writing-desk');
  const doorPortal = root.querySelector<HTMLElement>('.door-portal');
  if (!canvas || scenes.length === 0) return undefined;

  gsap.registerPlugin(ScrollTrigger);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const paint = LivingPaint.create(canvas);
  const thread = MemoryThread.create(threadCanvas);
  const state: FilmState = {
    time: 0,
    scroll: 0,
    scene: 0,
    local: 0,
    velocity: 0,
    pointerX: 0.5,
    pointerY: 0.5,
    pulse: 0,
  };
  const target = { ...state };
  let visible = !document.hidden;
  let activationTimer = 0;
  let writingTimer = 0;
  const interactionCleanups: Array<() => void> = [];

  const lenis = !reduced && !coarse
    ? new Lenis({ lerp: 0.082, smoothWheel: true, wheelMultiplier: 0.88 })
    : null;

  if (lenis) {
    lenis.on('scroll', (event) => {
      target.velocity = event.velocity;
      ScrollTrigger.update();
    });
  }

  const activateProcess = (index: number) => {
    processObjects.forEach((object, objectIndex) => object.classList.toggle('is-active', objectIndex === index));
    processTriggers.forEach((trigger, triggerIndex) => trigger.classList.toggle('is-active', triggerIndex === index));
  };

  processTriggers.forEach((trigger, index) => {
    const activate = () => activateProcess(index);
    trigger.addEventListener('pointerenter', activate);
    trigger.addEventListener('focus', activate);
    interactionCleanups.push(() => {
      trigger.removeEventListener('pointerenter', activate);
      trigger.removeEventListener('focus', activate);
    });
  });

  const activateMaterial = (index: number) => {
    syntaxLoom?.style.setProperty('--material-index', String(index));
    materialTriggers.forEach((trigger, triggerIndex) => trigger.classList.toggle('is-active', triggerIndex === index));
  };

  materialTriggers.forEach((trigger, index) => {
    const activate = () => activateMaterial(index);
    trigger.addEventListener('pointerenter', activate);
    trigger.addEventListener('focus', activate);
    interactionCleanups.push(() => {
      trigger.removeEventListener('pointerenter', activate);
      trigger.removeEventListener('focus', activate);
    });
  });

  const toggleJournal = () => {
    if (!fieldJournal) return;
    const isOpen = fieldJournal.classList.toggle('is-open');
    fieldJournal.setAttribute('aria-pressed', String(isOpen));
  };

  const replayWriting = () => {
    if (!writingDesk) return;
    writingDesk.classList.remove('is-writing');
    void writingDesk.offsetWidth;
    writingDesk.classList.add('is-writing');
    window.clearTimeout(writingTimer);
    writingTimer = window.setTimeout(() => writingDesk.classList.remove('is-writing'), 3400);
  };

  const handleJournalKey = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleJournal();
  };

  fieldJournal?.addEventListener('keydown', handleJournalKey);
  interactionCleanups.push(() => fieldJournal?.removeEventListener('keydown', handleJournalKey));

  const closeDoor = () => {
    if (!doorPortal) return;
    doorPortal.classList.remove('is-open');
    delete doorPortal.dataset.doorIndex;
  };

  doorTriggers.forEach((trigger, index) => {
    const openDoor = () => {
      if (!doorPortal) return;
      doorPortal.dataset.doorIndex = String(index);
      doorPortal.classList.add('is-open');
    };
    trigger.addEventListener('pointerenter', openDoor);
    trigger.addEventListener('pointerleave', closeDoor);
    trigger.addEventListener('focus', openDoor);
    trigger.addEventListener('blur', closeDoor);
    interactionCleanups.push(() => {
      trigger.removeEventListener('pointerenter', openDoor);
      trigger.removeEventListener('pointerleave', closeDoor);
      trigger.removeEventListener('focus', openDoor);
      trigger.removeEventListener('blur', closeDoor);
    });
  });

  const context = gsap.context(() => {
    ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: ({ progress }) => {
        target.scroll = progress;
        if (progressBar) progressBar.style.transform = `scaleY(${progress})`;
        root.style.setProperty('--light-x', `${-42 + progress * 84}%`);
        root.style.setProperty('--scan-y', `${14 + progress * 72}%`);
      },
    });

    scenes.forEach((scene, sceneIndex) => {
      const layers = Array.from(scene.querySelectorAll<HTMLElement>('[data-depth]'));
      const reveals = Array.from(scene.querySelectorAll<HTMLElement>('[data-reveal]'));
      const sceneObjects = Array.from(scene.querySelectorAll<HTMLElement>('[data-interactive-object]'));
      const lightSeam = scene.querySelector<HTMLElement>('.light-seam');
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene,
          start: 'top top',
          end: 'bottom bottom',
          scrub: reduced ? false : 1.05,
          invalidateOnRefresh: true,
          onEnter: () => { if (indexLabel) indexLabel.textContent = `0${sceneIndex + 1} — 06`; },
          onEnterBack: () => { if (indexLabel) indexLabel.textContent = `0${sceneIndex + 1} — 06`; },
          onUpdate: ({ progress }) => {
            const transition = gsap.utils.clamp(0, 1, (progress - 0.60) / 0.40);
            target.scene = Math.min(5, sceneIndex + transition);
            target.local = progress;
            scene.style.setProperty('--scene-local', progress.toFixed(4));
            scene.style.setProperty('--rule', `${0.12 + progress * 0.88}`);

            if (sceneIndex === 2 && processObjects.length > 0) {
              activateProcess(Math.min(processObjects.length - 1, Math.floor(progress * processObjects.length)));
            }

            if (sceneIndex === 3 && materialTriggers.length > 0) {
              activateMaterial(Math.min(materialTriggers.length - 1, Math.floor(progress * materialTriggers.length)));
            }
          },
        },
      });

      layers.forEach((layer, depthIndex) => {
        const motion = layerMotion[depthIndex];
        if (!motion) return;
        timeline.fromTo(layer, motion.from, { ...motion.to, duration: 1 }, 0);
      });

      sceneObjects.forEach((object, objectIndex) => {
        const direction = objectIndex % 2 === 0 ? 1 : -1;
        timeline.fromTo(
          object,
          {
            '--object-scroll-x': `${-38 * direction}px`,
            '--object-scroll-y': `${52 + objectIndex * 9}px`,
            '--object-scroll-r': `${-4.5 * direction}deg`,
          },
          {
            '--object-scroll-x': `${44 * direction}px`,
            '--object-scroll-y': `${-64 - objectIndex * 8}px`,
            '--object-scroll-r': `${5.5 * direction}deg`,
            duration: 1,
          },
          0,
        );
      });

      if (lightSeam) {
        timeline
          .fromTo(
            lightSeam,
            { autoAlpha: 0, scaleY: 0, filter: 'brightness(1)' },
            { autoAlpha: .94, scaleY: 1, filter: 'brightness(1.65)', duration: .055, ease: 'power4.out' },
            .055,
          )
          .to(
            lightSeam,
            { autoAlpha: .22, filter: 'brightness(.82)', duration: .13, ease: 'power2.out' },
            .11,
          );
      }

      if (sceneIndex > 0) {
        reveals.forEach((element, revealIndex) => {
          timeline.fromTo(
            element,
            { autoAlpha: 0.12, y: 38 + revealIndex * 5 },
            { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power3.out' },
            0.035 + revealIndex * 0.035,
          );
        });
      } else {
        gsap.from(reveals, {
          autoAlpha: 0,
          y: 32,
          duration: 1.15,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.18,
        });
      }

      timeline.to(layers[3], { autoAlpha: 0.12, duration: 0.18 }, 0.82);
    });
  }, root);

  const resetObjectMotion = (object: HTMLElement) => {
    object.style.setProperty('--object-rx', '0deg');
    object.style.setProperty('--object-ry', '0deg');
    object.style.setProperty('--object-x', '0px');
    object.style.setProperty('--object-y', '0px');
    object.style.setProperty('--artifact-x', '0px');
    object.style.setProperty('--artifact-y', '0px');
    object.style.setProperty('--artifact-r', '0deg');
    object.style.setProperty('--artifact-tool-x', '0px');
    object.style.setProperty('--artifact-tool-y', '0px');
    object.style.setProperty('--artifact-spread', '0deg');
    if (object.classList.contains('syntax-loom')) {
      object.style.setProperty('--loom-x', '0px');
      object.style.setProperty('--loom-y', '0px');
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    target.pointerX = event.clientX / Math.max(window.innerWidth, 1);
    target.pointerY = event.clientY / Math.max(window.innerHeight, 1);
    const normalizedX = target.pointerX - .5;
    const normalizedY = target.pointerY - .5;
    root.style.setProperty('--pointer-x', normalizedX.toFixed(4));
    root.style.setProperty('--pointer-y', normalizedY.toFixed(4));

    interactiveObjects.forEach((object) => {
      const bounds = object.getBoundingClientRect();
      const isInside = event.clientX >= bounds.left
        && event.clientX <= bounds.right
        && event.clientY >= bounds.top
        && event.clientY <= bounds.bottom;
      if (!isInside || bounds.bottom < -80 || bounds.top > window.innerHeight + 80) {
        resetObjectMotion(object);
        return;
      }

      const interaction = object.dataset.interaction || 'generic';
      const profile = interaction === 'journal'
        ? { rx: 1.8, ry: 2.8, x: 3.5, y: 2.5 }
        : interaction === 'writing'
          ? { rx: 1.2, ry: 1.8, x: 2.8, y: 1.8 }
          : interaction === 'prism'
            ? { rx: .55, ry: .8, x: 1.2, y: .8 }
            : interaction === 'door'
              ? { rx: .25, ry: .4, x: .5, y: .4 }
              : interaction === 'scanner' || interaction === 'compass' || interaction === 'archive'
                ? { rx: .65, ry: .95, x: 1.4, y: 1 }
                : { rx: 1.2, ry: 1.7, x: 2.4, y: 1.6 };
      const localX = gsap.utils.clamp(-.5, .5, (event.clientX - (bounds.left + bounds.width * .5)) / Math.max(bounds.width, 1));
      const localY = gsap.utils.clamp(-.5, .5, (event.clientY - (bounds.top + bounds.height * .5)) / Math.max(bounds.height, 1));
      object.style.setProperty('--object-rx', `${-localY * profile.rx}deg`);
      object.style.setProperty('--object-ry', `${localX * profile.ry}deg`);
      object.style.setProperty('--object-x', `${localX * profile.x}px`);
      object.style.setProperty('--object-y', `${localY * profile.y}px`);

      if (interaction === 'scanner') {
        object.style.setProperty('--artifact-x', `${localX * 46}px`);
        object.style.setProperty('--artifact-y', `${localY * 34}px`);
        object.style.setProperty('--artifact-r', `${localX * 7}deg`);
      } else if (interaction === 'compass') {
        object.style.setProperty('--artifact-tool-x', `${localX * 12}px`);
        object.style.setProperty('--artifact-tool-y', `${localY * 9}px`);
        object.style.setProperty('--artifact-spread', `${Math.max(0, (.5 - localY) * 4.5)}deg`);
      }

      if (object.classList.contains('syntax-loom')) {
        object.style.setProperty('--loom-x', `${localX * 42}px`);
        object.style.setProperty('--loom-y', `${localY * 24}px`);
      }
    });

    if (cursor) {
      cursor.style.opacity = '1';
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate3d(-50%, -50%, 0)`;
    }
  };

  const handlePointerLeave = () => {
    if (cursor) cursor.style.opacity = '0';
    interactiveObjects.forEach(resetObjectMotion);
  };

  const handlePointerDown = (event: PointerEvent) => {
    target.pulse = 1;
    const pointerTarget = event.target instanceof Element ? event.target : null;
    const directObject = pointerTarget?.closest<HTMLElement>('[data-interactive-object]');
    if (directObject?.dataset.interaction === 'journal') {
      toggleJournal();
    } else if (directObject?.dataset.interaction === 'writing') {
      replayWriting();
    } else if (directObject && directObject.dataset.interaction !== 'door') {
      directObject.classList.add('is-activated');
      window.clearTimeout(activationTimer);
      activationTimer = window.setTimeout(() => directObject.classList.remove('is-activated'), 1800);
    }
    if (!cursor) return;
    cursor.style.setProperty('--cursor-pulse', '1');
    cursor.style.setProperty('--cursor-pulse-opacity', '.72');
    window.setTimeout(() => {
      cursor.style.setProperty('--cursor-pulse', '.6');
      cursor.style.setProperty('--cursor-pulse-opacity', '0');
    }, 180);
  };

  const handleResize = () => {
    paint?.resize();
    thread?.resize();
    ScrollTrigger.refresh();
  };

  const handleVisibility = () => {
    visible = !document.hidden;
  };

  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', handlePointerLeave);
  window.addEventListener('pointerdown', handlePointerDown, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });
  document.addEventListener('visibilitychange', handleVisibility);

  const tick = (time: number) => {
    if (lenis) lenis.raf(time * 1000);
    if (!visible) return;
    target.pulse *= 0.92;
    target.velocity *= 0.88;
    const smoothing = reduced ? 1 : 0.075;
    state.scroll += (target.scroll - state.scroll) * smoothing;
    state.scene += (target.scene - state.scene) * smoothing;
    state.local += (target.local - state.local) * smoothing;
    state.velocity += (target.velocity - state.velocity) * 0.16;
    state.pointerX += (target.pointerX - state.pointerX) * 0.09;
    state.pointerY += (target.pointerY - state.pointerY) * 0.09;
    state.pulse += (target.pulse - state.pulse) * 0.14;
    state.time = reduced ? 0 : time;
    paint?.render(state);
    thread?.render(state);
  };

  gsap.ticker.add(tick);
  paint?.render(state);
  thread?.render(state);
  requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    gsap.ticker.remove(tick);
    context.revert();
    lenis?.destroy();
    paint?.destroy();
    window.clearTimeout(activationTimer);
    window.clearTimeout(writingTimer);
    interactionCleanups.forEach((cleanup) => cleanup());
    window.removeEventListener('pointermove', handlePointerMove);
    document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
    window.removeEventListener('pointerdown', handlePointerDown);
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}

function bootAboutFilm(): void {
  disposeCurrent?.();
  disposeCurrent = setupAboutFilm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootAboutFilm, { once: true });
} else {
  bootAboutFilm();
}

document.addEventListener('astro:page-load', bootAboutFilm);
document.addEventListener('astro:before-swap', () => {
  disposeCurrent?.();
  disposeCurrent = undefined;
});
