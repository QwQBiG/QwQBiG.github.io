import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const component = await readFile(new URL('../src/components/widgets/CalendarWidget.astro', import.meta.url), 'utf8');
const script = stripTypeScriptTypes(component.split('<script>')[1].split('</script>')[0]);

function calendarPage(start: Date) {
  let now = start;
  const doc = Object.assign(new EventTarget(), { hidden: false });
  const timers = new Map<number, { callback(): void; delay: number }>();
  let timerId = 0;
  const win = Object.assign(new EventTarget(), {
    setTimeout(callback: () => void, delay: number) { timers.set(++timerId, { callback, delay }); return timerId; },
    clearTimeout(id: number) { timers.delete(id); },
  });
  const button = () => Object.assign(new EventTarget(), { disabled: false, style: {} });
  const previous = button(), next = button(), title = { textContent: '' };
  const grid = { innerHTML: '' };
  const fields = { '#calendar-month-year': title, '#calendar-days': grid, '#prev-month': previous, '#next-month': next };
  class Element {
    querySelector(id: keyof typeof fields) { return fields[id]; }
  }
  let widget!: Element & { connectedCallback(): void; disconnectedCallback(): void };
  runInNewContext(script, {
    AbortController, HTMLElement: Element, window: win, document: doc,
    Date: new Proxy(Date, { construct: (date, args) => Reflect.construct(date, args.length ? args : [now]) }),
    customElements: { get() {}, define(_name: string, Type: new () => typeof widget) { widget = new Type(); } },
  });
  widget.connectedCallback();
  return {
    title, grid, timers, previous, next, widget,
    highlight: () => grid.innerHTML.match(/class="calendar-day today">(\d+)</)?.[1],
    hide(hidden: boolean) { doc.hidden = hidden; doc.dispatchEvent(new Event('visibilitychange')); },
    page(name: string) { win.dispatchEvent(new Event(name)); },
    advance(ms: number) { now = new Date(now.getTime() + ms); },
    midnight() {
      assert.equal(timers.size, 1);
      const [id, timer] = [...timers][0];
      timers.delete(id);
      now = new Date(now.getTime() + timer.delay);
      timer.callback();
    },
  };
}

test('arrows always move one month, including from the 31st and through leap February', () => {
  for (const [year, end] of [[2024, 29], [2026, 28]]) {
    const page = calendarPage(new Date(year, 0, 31, 12));
    assert.equal(page.previous.disabled, true);
    page.next.dispatchEvent(new Event('click'));
    assert.equal(page.title.textContent, 'Feb ' + year);
    const days = [...page.grid.innerHTML.matchAll(/class="calendar-day(?: weekend)?">(\d+)</g)].map(m => Number(m[1]));
    assert.deepEqual(days, Array.from({ length: end }, (_, i) => i + 1));
    assert.equal(page.highlight(), undefined);
    page.next.dispatchEvent(new Event('click'));
    page.previous.dispatchEvent(new Event('click'));
    assert.equal(page.title.textContent, 'Feb ' + year);
    page.previous.dispatchEvent(new Event('click'));
    assert.equal(page.highlight(), '31');
    assert.equal(page.previous.disabled, true);
  }
});

test('midnight follows the current month and year and renews its one local-midnight timer', () => {
  const page = calendarPage(new Date(2026, 11, 31, 23, 59, 58, 500));
  assert.equal(page.next.disabled, true);
  assert.equal([...page.timers.values()][0].delay, 1500);
  page.midnight();
  assert.equal(page.title.textContent, 'Jan 2027');
  assert.equal(page.highlight(), '1');
  assert.equal(page.previous.disabled, true);
  assert.equal(page.next.disabled, false);
  assert.equal(page.timers.size, 1);
});

test('a background or cached page catches up once and preserves a manually selected month', () => {
  const page = calendarPage(new Date(2024, 0, 31, 23, 59, 59));
  for (let i = 0; i < 3; i++) page.next.dispatchEvent(new Event('click'));
  assert.equal(page.title.textContent, 'Apr 2024');
  page.hide(true);
  page.page('pagehide');
  page.advance(2000);
  page.hide(false);
  assert.equal(page.timers.size, 0);
  page.page('pageshow');
  assert.equal(page.timers.size, 1);
  assert.equal(page.title.textContent, 'Apr 2024');
  assert.equal(page.highlight(), undefined);
  page.previous.dispatchEvent(new Event('click'));
  page.previous.dispatchEvent(new Event('click'));
  assert.equal(page.title.textContent, 'Feb 2024');
  assert.equal(page.highlight(), '1');
  page.widget.disconnectedCallback();
  page.page('pageshow');
  assert.equal(page.timers.size, 0);
});
