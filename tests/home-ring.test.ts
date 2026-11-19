import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const page = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const script = await readFile(new URL('../src/scripts/home-interactions.js', import.meta.url), 'utf8');

function ringInteraction() {
  const values = new Map<string, string>();
  let reads = 0;
  const ring = Object.assign(new EventTarget(), {
    classList: { add() {}, remove() {} },
    style: { setProperty: (name: string, value: string) => values.set(name, value) },
    getBoundingClientRect() {
      reads++;
      return { left: 0, top: 0, width: 270, height: 270 };
    },
  });
  const frames: Array<(time: number) => void> = [];
  let time = 0;
  runInNewContext(script, {
    document: Object.assign(new EventTarget(), {
      getElementById: (id: string) => id === 'interactiveRing' ? ring : null,
      querySelector: () => null,
    }),
    window: { matchMedia: () => ({ matches: true }) },
    requestAnimationFrame: (callback: (time: number) => void) => frames.push(callback),
    IntersectionObserver: class { observe() {} },
  });
  function send(type: string, pointerType = 'touch', pointerId = 1, clientX = 270) {
    const event = Object.assign(new Event(type, { cancelable: true }), {
      pointerType, pointerId, isPrimary: pointerId === 1, clientX, clientY: 135,
    });
    assert.equal(ring.dispatchEvent(event), true, 'native gestures must remain available');
  }
  function flush() {
    while (frames.length) frames.shift()!(time += 20);
  }
  function pointer(type: string, pointerType = 'touch', pointerId = 1) {
    send(type, pointerType, pointerId);
    flush();
  }
  return { pointer, values, send, flush, reads: () => reads };
}

test('pointer samples share a frame measurement and cancellation discards the last sample', () => {
  const ring = ringInteraction();
  ring.send('pointerenter');
  for (let x = 0; x <= 270; x++) ring.send('pointermove', 'touch', 1, x);
  assert.equal(ring.reads(), 0);
  ring.flush();
  assert.equal(ring.reads(), 1);
  assert.equal(ring.values.get('--rotateY'), '15.00deg');

  ring.send('pointermove', 'touch', 1, 0);
  ring.send('pointercancel');
  ring.flush();
  assert.equal(ring.reads(), 1);
  assert.equal(ring.values.get('--rotateY'), '0.00deg');
});

test('the ring permits native scrolling and pinching, resets after touch cancellation or lift', () => {
  assert.match(page, /\.floating-ring\s*\{[^}]*touch-action:\s*pan-y pinch-zoom/);
  const { pointer, values } = ringInteraction();
  for (const finish of ['pointercancel', 'pointerup']) {
    pointer('pointerenter');
    pointer('pointermove');
    assert.equal(values.get('--translateZ'), '30px');
    assert.equal(values.get('--rotateY'), '15.00deg');
    pointer('pointerenter', 'touch', 2);
    pointer('pointerup', 'touch', 2);
    assert.equal(values.get('--translateZ'), '30px');
    pointer(finish);
    pointer('pointermove');
    assert.equal(values.get('--translateZ'), '0px');
    assert.equal(values.get('--rotateY'), '0.00deg');
  }
});

test('mouse hover still tilts after a click and releases on leave', () => {
  const { pointer, values } = ringInteraction();
  pointer('pointerenter', 'mouse');
  pointer('pointerup', 'mouse');
  pointer('pointermove', 'mouse');
  assert.equal(values.get('--rotateY'), '15.00deg');
  pointer('pointerleave', 'mouse');
  assert.equal(values.get('--translateZ'), '0px');
});
