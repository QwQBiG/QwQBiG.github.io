import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const script = await readFile(new URL('../public/js/vanilla-tilt.js', import.meta.url), 'utf8');

function mountCard(touch = false) {
  const glare = { style: { opacity: '' } };
  class Card extends EventTarget {
    style = { transform: '', transition: '' };
    querySelector() { return glare; }
    querySelectorAll() { return []; }
    getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 100 }; }
  }
  const card = new Card();
  const frames = new Map<number, () => void>();
  const timers = new Map<number, () => void>();
  let nextId = 0;
  const add = (queue: Map<number, () => void>, callback: () => void) => {
    const id = nextId++;
    queue.set(id, callback);
    return id;
  };
  const flush = (queue: Map<number, () => void>) => {
    for (const [id, run] of queue) {
      queue.delete(id);
      run();
    }
  };
  runInNewContext(script, {
    HTMLElement: Card,
    document: Object.assign(new EventTarget(), { querySelectorAll: () => [card] }),
    window: { matchMedia: () => ({ matches: touch }) },
    requestAnimationFrame: (fn: () => void) => add(frames, fn),
    cancelAnimationFrame: (id: number) => frames.delete(id),
    setTimeout: (fn: () => void) => add(timers, fn),
    clearTimeout: (id: number) => timers.delete(id),
  });
  const mouse = (name: string, x = 50, y = 50) =>
    card.dispatchEvent(Object.assign(new Event(name), { clientX: x, clientY: y }));
  return { style: card.style, glare, mouse, frames, timers, flush };
}

test('a card follows the last mouse position per frame and stays level after a fast exit', () => {
  const { style, glare, mouse, frames, flush } = mountCard();
  const resting = style.transform;
  mouse('mouseenter');
  mouse('mousemove', 0, 100);
  mouse('mousemove', 85, 20);
  assert.equal(frames.size, 1);
  flush(frames);
  assert.match(style.transform, /rotateX\(6deg\)\s+rotateY\(7deg\)/);
  mouse('mousemove', 10, 10);
  mouse('mouseleave');
  flush(frames);
  assert.equal(style.transform, resting);
  assert.equal(glare.style.opacity, '0');
  assert.match(style.transition, /600ms/);
});

test('re-entering cancels the previous reset and touch cards do not track hover', () => {
  const { style, mouse, timers, flush } = mountCard();
  mouse('mouseenter');
  mouse('mouseleave');
  mouse('mouseenter');
  assert.equal(timers.size, 0);
  assert.equal(style.transition, '');
  mouse('mouseleave');
  assert.equal(timers.size, 1);
  flush(timers);
  assert.equal(style.transition, '');

  const touch = mountCard(true);
  const resting = touch.style.transform;
  touch.mouse('mouseenter');
  touch.mouse('mousemove', 95, 95);
  touch.mouse('mouseleave');
  assert.equal(touch.frames.size + touch.timers.size, 0);
  assert.equal(touch.style.transform, resting);
});

test('the homepage starts tilt only when a hover-capable pointer is available', async () => {
  const page = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
  const script = [...page.matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)]
    .map(match => match[1]).find(source => source.includes('function loadHomeTilt'))!;
  for (const startsWithMouse of [false, true]) {
    const pointer = Object.assign(new EventTarget(), { matches: startsWithMouse });
    const loaded: string[] = [];
    runInNewContext(script, {
      window: { matchMedia: () => pointer },
      document: { createElement: () => ({}), head: { append: (node: { src: string }) => loaded.push(node.src) } },
    });
    assert.equal(loaded.length, startsWithMouse ? 1 : 0);
    pointer.matches = true;
    pointer.dispatchEvent(new Event('change'));
    pointer.dispatchEvent(new Event('change'));
    assert.deepEqual(loaded, ['/js/vanilla-tilt.js']);
  }
});
