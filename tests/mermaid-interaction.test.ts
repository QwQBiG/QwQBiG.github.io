import assert from 'node:assert/strict';
import { getEventListeners } from 'node:events';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

class Control extends EventTarget {
  style = { transform: '', cursor: 'grab', transition: 'transform 0.2s ease', touchAction: '' };
  title = '';
  captured?: number;
  ownerDocument: EventTarget;
  constructor(doc: EventTarget) { super(); this.ownerDocument = doc; }
  closest() { return null; }
  querySelector() { return null; }
  classList = { toggle() {} };
  setPointerCapture(id: number) { this.captured = id; }
  hasPointerCapture(id: number) { return this.captured === id; }
  releasePointerCapture() { this.captured = undefined; }
}

const win = new EventTarget();
const component = readFileSync(new URL('../src/components/content/MermaidDiagrams.astro', import.meta.url), 'utf8');
const source = component.slice(component.indexOf('  type FullscreenWrapper'), component.indexOf('  const renderDiagrams ='));
const initMermaidInteraction = runInNewContext(stripTypeScriptTypes(source) + '\ninitMermaidInteraction', {
  window: win, Element: Control, AbortController,
});
function diagram(doc = new EventTarget()) {
  const [wrapper, container, content, smaller, larger, reset, fullscreen] =
    Array.from({ length: 7 }, () => new Control(doc));
  const lifetime = new AbortController();
  initMermaidInteraction(wrapper, container, content, smaller, larger, reset, fullscreen, lifetime.signal);
  return { wrapper, container, content, smaller, larger, reset, fullscreen, lifetime };
}
function pointer(type: string, x = 0, y = 0, id = 1, pointerType = 'mouse') {
  return Object.assign(new Event(type, { cancelable: true }), {
    clientX: x, clientY: y, pointerId: id, isPrimary: true, button: 0, pointerType,
  });
}
const click = (button: Control) => button.dispatchEvent(new Event('click'));
const globalListeners = (target: EventTarget) =>
  ['mousemove', 'mouseup', 'pointermove', 'pointerup', 'pointercancel', 'fullscreenchange', 'webkitfullscreenchange']
    .reduce((total, name) => total + getEventListeners(target, name).length, 0);

test('eight idle diagrams leave ordinary document movement and releases alone', () => {
  const doc = new EventTarget();
  const diagrams = Array.from({ length: 8 }, () => diagram(doc));
  assert.equal(globalListeners(doc) + globalListeners(win), 0);
  for (let i = 0; i < 60; i++) doc.dispatchEvent(pointer('mousemove', i));
  doc.dispatchEvent(pointer('mouseup'));
  for (const view of diagrams) {
    assert.equal(view.content.style.transform, '');
    view.lifetime.abort();
  }
});

test('a phone scrolls normally until zoomed; a captured pan moves in screen pixels', () => {
  const { container, content, larger, reset, lifetime } = diagram();
  assert.equal(container.dispatchEvent(pointer('pointerdown', 10, 20, 1, 'touch')), true);
  assert.equal(container.captured, undefined);
  click(larger);
  assert.equal(container.style.touchAction, 'pinch-zoom');
  assert.equal(container.dispatchEvent(pointer('pointerdown', 10, 20, 1, 'touch')), true, 'browser pinch remains available');
  assert.equal(container.captured, 1);
  container.dispatchEvent(pointer('pointermove', 90, 150, 2, 'touch'));
  assert.equal(content.style.transform, 'translate(0px, 0px) scale(1.2)');
  container.dispatchEvent(pointer('pointermove', 50, 100, 1, 'touch'));
  assert.equal(content.style.transition, 'none');
  assert.equal(content.style.transform, 'translate(40px, 80px) scale(1.2)');
  container.dispatchEvent(pointer('pointerup', 55, 105, 1, 'touch'));
  assert.equal(content.style.transform, 'translate(45px, 85px) scale(1.2)');
  assert.equal(content.style.transition, 'transform 0.2s ease');
  assert.equal(container.captured, undefined);
  click(reset);
  assert.equal(container.style.touchAction, 'auto');
  assert.equal(content.style.transform, 'translate(0px, 0px) scale(1)');
  lifetime.abort();
});

test('fit follows the container dimensions, preserves a manual zoom, and resets to the current size', () => {
  let resize!: () => void;
  let disconnected = false;
  const init = runInNewContext(stripTypeScriptTypes(source) + '\ninitMermaidInteraction', {
    window: win, Element: Control, AbortController,
    requestAnimationFrame: (fn: () => void) => fn(),
    ResizeObserver: class {
      constructor(fn: () => void) { resize = fn; }
      observe() {} disconnect() { disconnected = true; }
    },
  });
  const doc = new EventTarget();
  const [wrapper, container, content, out, plus, reset, full] =
    Array.from({ length: 7 }, () => new Control(doc));
  const sized = Object.assign(container, { clientWidth: 200, clientHeight: 240 });
  Object.assign(content, { querySelector: () => ({
    isConnected: true, getBBox: () => ({ x: 0, y: 0, width: 400, height: 200 }),
  }) });
  const life = new AbortController();
  init(wrapper, sized, content, out, plus, reset, full, life.signal);
  assert.equal(content.style.transform, 'translate(0px, 0px) scale(0.5)');
  sized.clientWidth = 300;
  resize();
  assert.equal(content.style.transform, 'translate(0px, 0px) scale(0.75)');
  click(plus);
  const zoomed = content.style.transform;
  sized.clientWidth = 220;
  resize();
  assert.equal(content.style.transform, zoomed);
  click(reset);
  assert.equal(content.style.transform, 'translate(0px, 0px) scale(0.55)');
  assert.equal(container.style.touchAction, 'auto');
  sized.clientHeight = 80;
  resize();
  assert.equal(content.style.transform, 'translate(0px, 0px) scale(0.4)');
  life.abort();
  assert.ok(disconnected);
});

test('release, cancellation, window blur or a page change dispose an active pan', () => {
  for (const end of ['lostpointercapture', 'pointercancel', 'pointerup', 'blur', 'pagehide', 'swap']) {
    for (const canCapture of [true, false]) {
      const { container, content, lifetime } = diagram();
      if (!canCapture) container.setPointerCapture = () => { throw new Error('Capture unavailable'); };
      container.dispatchEvent(pointer('pointerdown'));
      const target = canCapture ? container : win;
      target.dispatchEvent(pointer('pointermove', 12, 24));
      if (end === 'swap') lifetime.abort();
      else if (end === 'blur' || end === 'pagehide') win.dispatchEvent(new Event(end));
      else (end === 'lostpointercapture' ? container : target).dispatchEvent(pointer(end, 12, 24));
      assert.equal(content.style.transition, 'transform 0.2s ease');
      assert.equal(globalListeners(container) + globalListeners(win), 0);
      target.dispatchEvent(pointer('pointermove', 100, 100));
      assert.equal(content.style.transform, 'translate(12px, 24px) scale(1)');
      lifetime.abort();
    }
  }
});

test('native, WebKit, unavailable and denied fullscreen allow an ordinary exit', async () => {
  for (const api of ['native', 'webkit', 'css', 'denied', 'css-escape']) {
    const doc = new EventTarget();
    const { container, wrapper, fullscreen, lifetime } = diagram(doc);
    const property = api === 'webkit' ? 'webkitFullscreenElement' : 'fullscreenElement';
    const change = api === 'webkit' ? 'webkitfullscreenchange' : 'fullscreenchange';
    if (api === 'denied') {
      Object.assign(wrapper, { requestFullscreen: async () => { throw new Error('Fullscreen denied'); } });
    } else if (api === 'native' || api === 'webkit') {
      Object.assign(wrapper, { [api === 'webkit' ? 'webkitRequestFullscreen' : 'requestFullscreen']: () => {
        Object.assign(doc, { [property]: wrapper }); doc.dispatchEvent(new Event(change));
      } });
    }
    click(fullscreen);
    await Promise.resolve();
    assert.equal(fullscreen.title, 'Exit full screen');
    assert.equal(container.style.touchAction, 'pinch-zoom');
    if (api === 'css' || api === 'denied') click(fullscreen);
    else if (api === 'css-escape') doc.dispatchEvent(Object.assign(new Event('keydown'), { key: 'Escape' }));
    else {
      Object.assign(doc, { [property]: null }); doc.dispatchEvent(new Event(change));
    }
    assert.equal(container.style.touchAction, 'auto');
    assert.equal(fullscreen.title, 'Enter full screen');
    assert.equal(globalListeners(doc), 0);
    lifetime.abort();
  }
});
