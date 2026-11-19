import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createContext, runInContext } from 'node:vm';

test('turning the greenhouse calendar keeps the collection and visitor stamps until their data change', async () => {
  const html = await readFile(new URL('../public/garden/index.html', import.meta.url), 'utf8');

  // Run the standalone offline page's actual scripts. Only the DOM operations its controls use are needed here.
  class Element extends EventTarget {
    id = '';
    value = '';
    textContent = '';
    dataset = {};
    attributes = new Map<string, string>();
    children: Element[] = [];
    classList = { toggle() {}, add() {}, remove() {} };
    setAttribute(name: string, value: string) { this.attributes.set(name, value); }
    removeAttribute(name: string) { this.attributes.delete(name); }
    append(...elements: Element[]) { this.children.push(...elements); }
    replaceChildren(...elements: Element[]) { this.children = elements; }
    focus() {}
    click() { this.dispatchEvent(new Event('click')); }
  }
  const byId = new Map(Array.from(html.matchAll(/\bid="([\w-]+)"/g), match => [match[1], new Element()]));
  const get = (id: string) => byId.get(id)!;
  const store = new Map([
    ['daily-green-greenhouse-v1', JSON.stringify({ version: 1, dates: ['2026-11-18', '2026-11-19'] })],
    ['daily-green-visitors-v1', JSON.stringify({ version: 1, dates: ['2026-11-18'] })],
  ]);
  const context = createContext({
    document: {
      getElementById: (id: string) => byId.get(id) ?? get('saved-dates').children.find(chip => chip.id === id) ?? null,
      createElement: () => new Element(),
      querySelector: () => new Element(),
    },
    localStorage: { getItem: (key: string) => store.get(key), setItem: (key: string, value: string) => store.set(key, value) },
    URLSearchParams, clearTimeout, setTimeout, location: { search: '?date=2026-11-18' },
  });
  for (const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) runInContext(script[1], context);

  const album = get('album'), stamps = get('guest-stamps'), chips = get('saved-dates');
  const plant = album.children[0], stamp = stamps.children[0];
  const [first, second] = chips.children;
  assert.equal(get('plant-name').textContent, 'Mint');
  assert.equal(get('day-label').textContent, 'Wednesday');
  const savedStamp = stamps.children.find(node => node.attributes.has('aria-label'))!;
  assert.equal(savedStamp.attributes.get('aria-label'), 'Revisit the ladybird scout on 2026-11-18');
  savedStamp.click();
  assert.equal(get('visitor-note').attributes.get('lang'), 'zh-CN');
  assert.match(get('visitor-note').textContent, /\p{Script=Han}/u);
  assert.equal(get('guest-title').textContent, 'A note from the ladybird scout');
  assert.equal(first.attributes.get('aria-current'), 'date');
  get('next-day').click();
  assert.equal(get('plant-date').value, '2026-11-19');
  assert.equal(get('visitor-note').attributes.has('lang'), false);
  assert.equal(get('plant-name').textContent, 'Clover');
  assert.equal(get('day-label').textContent, 'Thursday');
  assert.equal(album.children[0], plant);
  assert.equal(stamps.children[0], stamp);
  assert.equal(chips.children[0], first);
  assert.equal(first.attributes.get('aria-current'), 'false');
  assert.equal(second.attributes.get('aria-current'), 'date');
  get('save-button').click();
  assert.equal(chips.children.length, 1);
  assert.notEqual(album.children[0], plant);
  assert.equal(get('save-button').attributes.get('aria-pressed'), 'false');
  get('save-button').click();
  assert.equal(chips.children[0].attributes.get('aria-current'), 'date');
  get('visitor-button').click();
  assert.notEqual(stamps.children[0], stamp);
  const discovered = stamps.children[0];
  get('visitor-button').click();
  assert.equal(stamps.children[0], discovered);
  assert.deepEqual(JSON.parse(store.get('daily-green-visitors-v1')!).dates, ['2026-11-18', '2026-11-19']);
});
