import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const component = await readFile(new URL('../src/components/widgets/ClockWidget.astro', import.meta.url), 'utf8');
const script = stripTypeScriptTypes(component.split('<script>')[1].split('</script>')[0]);

function clockPage(observe = true) {
  let now = new Date(2026, 10, 18, 23, 59, 58, 600);
  const timers = new Map<number, { callback(): void; delay: number }>();
  let seq = 0;
  let intersection: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
  let disconnected = false;
  class Observer {
    constructor(callback: NonNullable<typeof intersection>) { intersection = callback; }
    observe() {}
    disconnect() { disconnected = true; }
  }
  const win = Object.assign(new EventTarget(), {
    setTimeout(callback: () => void, delay: number) {
      timers.set(++seq, { callback, delay });
      return seq;
    },
    clearTimeout(id: number) { timers.delete(id); },
  }, observe ? { IntersectionObserver: Observer } : {});
  const doc = Object.assign(new EventTarget(), { hidden: false });
  class TextField {
    value = '';
    writes = 0;
    get textContent() { return this.value; }
    set textContent(value: string) { this.writes++; this.value = value; }
  }
  const fields = { '#clock-time': new TextField(), '#clock-seconds': new TextField(), '#clock-date': new TextField() };
  class Element {
    ticking = false;
    querySelector(id: keyof typeof fields) { return fields[id]; }
    toggleAttribute(_key: string, value: boolean) { this.ticking = value; }
  }
  let clock!: Element & { connectedCallback(): void; disconnectedCallback(): void };
  runInNewContext(script, {
    AbortController, HTMLElement: Element, IntersectionObserver: Observer, window: win, document: doc,
    Date: class extends Date { constructor() { super(now.getTime()); } },
    customElements: { get() {}, define(_name: string, Ctor: new () => typeof clock) { clock = new Ctor(); } },
  });
  clock.connectedCallback();
  return {
    fields, clock, timers, disconnected: () => disconnected,
    visible(value: boolean) { intersection?.([{ isIntersecting: value }]); },
    hidden(value: boolean) { doc.hidden = value; doc.dispatchEvent(new Event('visibilitychange')); },
    page(name: string) { win.dispatchEvent(new Event(name)); },
    advance(ms: number) { now = new Date(now.getTime() + ms); },
    fire() {
      assert.equal(timers.size, 1);
      const [key, timer] = [...timers][0];
      timers.delete(key);
      now = new Date(now.getTime() + timer.delay);
      timer.callback();
    },
  };
}

test('a visible clock updates just the fields that changed, at the next second boundary', () => {
  const page = clockPage();
  const { fields, timers } = page;
  assert.equal(fields['#clock-time'].value, '23:59');
  assert.equal(fields['#clock-date'].value, 'Wed, Nov 18');
  assert.equal(timers.size, 0);
  page.visible(true);
  assert.equal([...timers.values()][0].delay, 400);
  page.fire();
  assert.equal(fields['#clock-seconds'].value, ':59');
  assert.deepEqual(Object.values(fields).map(field => field.writes), [1, 2, 1]);
  page.fire();
  assert.equal(fields['#clock-seconds'].value, ':00');
  assert.equal(fields['#clock-time'].value, '00:00');
  assert.equal(fields['#clock-date'].value, 'Thu, Nov 19');
  assert.equal([...timers.values()][0].delay, 1000);
});

test('offscreen, background and suspended clocks stop and catch up when visible again', () => {
  const page = clockPage();
  page.visible(true);
  page.visible(false);
  assert.equal(page.timers.size, 0);
  assert.equal(page.clock.ticking, false);
  page.advance(5000);
  page.hidden(true);
  page.visible(true);
  assert.equal(page.timers.size, 0);
  page.hidden(false);
  assert.equal(page.fields['#clock-seconds'].value, ':03');
  assert.equal(page.clock.ticking, true);
  page.page('pagehide');
  page.hidden(false);
  assert.equal(page.timers.size, 0);
  page.advance(15000);
  page.page('pageshow');
  assert.equal(page.fields['#clock-seconds'].value, ':18');
  assert.equal(page.timers.size, 1);
  page.clock.disconnectedCallback();
  assert.ok(page.disconnected());
  page.page('pageshow');
  page.hidden(false);
  assert.equal(page.timers.size, 0);
});

test('browsers without intersection observation still tick in the foreground', () => {
  const page = clockPage(false);
  assert.equal(page.timers.size, 1);
  page.hidden(true);
  assert.equal(page.timers.size, 0);
  page.hidden(false);
  assert.equal(page.timers.size, 1);
});
