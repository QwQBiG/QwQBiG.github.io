import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

const script = await readFile(new URL('../src/scripts/about-film.ts', import.meta.url), 'utf8');
const renderer = stripTypeScriptTypes(script.slice(script.indexOf('class MemoryThread'), script.indexOf('const layerMotion')));
const initial = { time: 0, scroll: 0, scene: 0, local: 0, velocity: 0, pointerX: .5, pointerY: .5, pulse: 0 };
type State = typeof initial;

function fixture(width: number, height: number) {
  const window = { innerWidth: width, innerHeight: height, devicePixelRatio: 2 };
  let samples = 0, clears = 0;
  const paths: number[][][] = [];
  let path: number[][] = [];
  const context = new Proxy({
    clearRect() { clears++; paths.length = 0; },
    beginPath() { path = []; },
    moveTo(x: number, y: number) { path.push([x, y]); },
    lineTo(x: number, y: number) { path.push([x, y]); },
    stroke() { if (path.length) paths.push(path); },
    createRadialGradient() { return { addColorStop() {} }; },
  }, {
    get(target, key) { return Reflect.get(target, key) ?? (() => {}); },
  });
  const math = Object.create(Math);
  math.exp = (x: number) => { samples++; return Math.exp(x); };
  const Thread = runInNewContext(renderer + '\nMemoryThread', { window, Math: math });
  const thread = Thread.create({ getContext: () => context, width: 0, height: 0 }, 1.5);
  return { thread, window, paths, samples: () => samples, clears: () => clears };
}

test('the About thread shares one wave sample per position across four visually identical strokes', () => {
  for (const [width, height] of [[390, 844], [1280, 800]]) {
    const { thread, paths, samples } = fixture(width, height);
    const state: State = { ...initial, time: 12.3, scroll: .65, pointerX: .27, pointerY: .89, scene: 3.5 };
    thread.render(state, false);
    assert.equal(samples(), 97 + 6 + 1); // Wave grid, six scene nodes and the travelling light.
    assert.equal(paths.length, 4);
    const phase = state.scroll * Math.PI * 2.4 + state.time * .035;
    paths.forEach((stroke, index) => {
      const offset = [16, 8, 0, 0][index];
      assert.equal(stroke.length, 97);
      stroke.forEach(([x, y], step) => {
        assert.equal(x, width * (step / 96));
        const normalized = x / width;
        const distance = (x - state.pointerX * width) / (width * .24);
        const first = Math.sin(normalized * Math.PI * 1.8 + phase) * height * .034;
        const second = Math.sin(normalized * Math.PI * 4.2 - phase * .38) * height * .014;
        const pull = (state.pointerY * height - height * .58) * .035 * Math.exp(-(distance * distance) * 2.4);
        assert.equal(y, height * .64 + first + second + pull + offset);
      });
    });
  }
});

test('a still reduced-motion frame repaints only when its visible inputs or canvas size change', () => {
  const { thread, window, clears } = fixture(390, 844);
  const state = { ...initial };
  thread.render(state, true);
  for (let i = 0; i < 150; i++) thread.render({ ...state, velocity: i, pulse: .01 }, true);
  assert.equal(clears(), 1);
  for (const [key, value] of [['pointerX', .4], ['pointerY', .3], ['scene', 2], ['scroll', .5], ['pulse', .7]] as const) {
    const count = clears();
    state[key] = value;
    thread.render(state, true);
    assert.equal(clears(), count + 1);
  }
  thread.resize();
  thread.render(state, true);
  assert.equal(clears(), 6);
  window.innerWidth++;
  thread.resize();
  thread.render(state, true);
  assert.equal(clears(), 7);
  thread.render({ ...state, time: 1 }, false);
  thread.render({ ...state, time: 2 }, false);
  assert.equal(clears(), 9);
});
