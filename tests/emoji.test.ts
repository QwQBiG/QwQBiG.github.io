import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeEmojiEscapes, findEmoji, replaceEmoji } from '../src/utils/emoji.ts';
import { scanRendered, scanSource } from '../scripts/check-emoji.mjs';

const cp = (...values: number[]) => String.fromCodePoint(...values);

test('matches emoji presentation, variation, flags, keycaps and joined sequences', () => {
  for (const value of [
    cp(0x1f600), cp(0x2764), cp(0x26a0), cp(0x2764, 0xfe0f), cp(0x1f1e8, 0x1f1f3), cp(0x31, 0xfe0f, 0x20e3),
    cp(0x1f469, 0x1f3fd, 0x200d, 0x1f4bb), cp(0x2764, 0xfe0f, 0x200d, 0x1f525),
    cp(0x1f3f4, 0xe0067, 0xe0062, 0xe0065, 0xe006e, 0xe0067, 0xe007f),
  ]) {
    assert.deepEqual(findEmoji(value), [{ value, index: 0 }]);
    assert.equal(replaceEmoji(`a${value}b`), 'a[表情]b');
  }
});

test('retains ordinary symbols and explicit text presentation', () => {
  const text = `123 # * © ™ → ↗ ∞ ✓ ${cp(0x2764, 0xfe0e)} ${cp(0x2600, 0xfe0e)}`;
  assert.deepEqual(findEmoji(text), []);
  assert.equal(replaceEmoji(text), text);
});

test('replaces a consecutive emoji run once and preserves surrounding text', () => {
  assert.equal(replaceEmoji(`很好${cp(0x1f600, 0x1f44d)}继续`), '很好[表情]继续');
});

test('decodes numeric entities and JavaScript code points and surrogate pairs', () => {
  const face = cp(0x1f600);
  for (const encoded of ['&#128512;', '&#x1F600;', '\\u{1F600}', '\\uD83D\\uDE00']) {
    assert.equal(decodeEmojiEscapes(encoded), face);
  }
  assert.equal(decodeEmojiEscapes('\\\\u{1F600}'), '\\\\u{1F600}');
});

test('source scanner catches visible literals and escaped strings, excluding regular expressions', () => {
  assert.equal(scanSource(`const label = "\\u{1F600}";`, 'ui.ts').length, 1);
  assert.equal(scanSource(`const label = "\\uD83D\\uDE00";`, 'ui.js').length, 1);
  assert.equal(scanSource(`const supported = /[\\u{1F300}-\\u{1FAFF}]/u;`, 'vendor.js').length, 0);
  assert.equal(scanSource(`const supported = /${cp(0x1f600)}/u;`, 'ui.ts').length, 0);
  assert.equal(scanSource('const supported = String.raw`\\u{1F3F4}[\\u{E0020}-\\u{E007F}]`;', 'ui.ts').length, 0);
  assert.equal(scanSource('<span>&#x1F600;</span>', 'component.astro').length, 1);
  assert.equal(scanSource('CSS content: "\\1f600"', 'icons.css').length, 1);
  assert.equal(scanSource('`\\u{1F600}` is a code point escape.', 'article.md').length, 0);
});

test('rendered scanner checks visible text and attributes but ignores bundled code and data', () => {
  const face = cp(0x1f600);
  assert.equal(scanRendered(`<p>${face}</p>`, 'index.html').length, 1);
  assert.equal(scanRendered('<img alt="&#x1F600;">', 'index.html').length, 1);
  assert.equal(scanRendered(`<script>const locale = '${face}'</script><style>.x{content:'${face}'}</style><div data-library="${face}">© → 123</div>`, 'index.html').length, 0);
  assert.equal(scanRendered('{"title":"\\ud83d\\ude00"}', 'posts.json').length, 1);
  assert.equal(scanRendered('<rss><channel><description>&#x1F600;</description></channel></rss>', 'rss.xml').length, 1);
  assert.equal(scanRendered(`<rss><channel><description><![CDATA[${face}]]></description></channel></rss>`, 'rss.xml').length, 1);
  assert.equal(scanRendered('<code>\\u{1F600}</code>', 'index.html').length, 0);
});
