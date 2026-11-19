import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fitPhotoPosition, listenForPointerDrag, photoAnchorY, photoPositionBounds, photoPreviewSize, photoWallCardWidth, photoWallSizes, readInitialPhotoPosition, resolvePhotoWallSize, whenPhotoSettles } from '../src/utils/photo-wall.ts';

const firstLayout = readFileSync(new URL('../src/scripts/gallery-first-layout.js', import.meta.url), 'utf8');

test('the interactive wall uses the first paint’s scatter and saved offsets even after rotation', () => {
  for (const firstSize of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    const properties = new Map<string, string>();
    let randomCalls = 0;
    runInNewContext(firstLayout, {
      document: {
        currentScript: { dataset: { photoIds: '["1","2","3","4"]', compact: 'compact' } },
        documentElement: { style: { setProperty: (key: string, value: unknown) => properties.set(key, String(value)) } },
      },
      window: { innerWidth: firstSize.width, innerHeight: firstSize.height, matchMedia: () => ({ matches: firstSize.width < 480 }) },
      localStorage: { getItem(key: string) {
        if (key.endsWith('-1')) return '{"x":500,"y":-800,"rotation":6,"zIndex":40}';
        if (key.endsWith('-2')) throw new Error('Storage unavailable');
        if (key.endsWith('-3')) return '{"x":"bad","y":0}';
        return '{"x":-8,"y":5,"rotation":"invalid","zIndex":2.1}';
      } },
      Math: Object.assign(Object.create(Math), { random: () => { randomCalls++; return 0.5; } }),
    });
    assert.equal(randomCalls, 6, 'only the two unsaved cards draw new positions');
    for (const id of ['1', '2', '3', '4']) {
      const property = (name: string) => properties.get(`--photo-${id}-${name}`)!;
      const style = {
        getPropertyValue: (name: string) => property(name.replace(/^--(?:initial-)?/, '')),
        zIndex: property('z'),
      } as CSSStyleDeclaration;
      const pose = { x: parseFloat(property('x')), y: parseFloat(property('y')), rotation: parseFloat(property('rotation')), zIndex: Number(property('z')) };
      assert.ok(Object.values(pose).every(Number.isFinite));
      if (id === '1') assert.deepEqual(pose, { x: 500, y: -800, rotation: 6, zIndex: 40 });
      if (id === '4') assert.deepEqual(pose, { x: -8, y: 5, rotation: 0, zIndex: 4 });
      for (const wall of [firstSize, { width: firstSize.height, height: firstSize.width }]) {
        assert.deepEqual(readInitialPhotoPosition(style, wall, photoWallCardWidth(wall)), pose);
      }
    }
  }
});

test('hydration can also adopt the visible CSS fallback when the first-layout script did not run', () => {
  const style = { getPropertyValue: (name: string) => name === '--rotation' ? '-7deg' : '', left: '39px', top: '152px', zIndex: '2' } as CSSStyleDeclaration;
  assert.deepEqual(readInitialPhotoPosition(style, { width: 390, height: 844 }, 120),
    { x: -96, y: -198, rotation: -7, zIndex: 2 });
});

test('thumbnail sizing follows exact viewport boundaries and short phone landscape', () => {
  for (const [width, height, expected] of [
    [320, 568, 120], [479.9, 844, 120], [480, 844, 150], [767.9, 900, 150],
    [768, 1024, 360], [844, 390, 150], [1023.9, 479.9, 150],
    [844, 480, 360], [1024, 390, 360], [1440, 900, 360],
  ]) {
    assert.equal(photoWallCardWidth({ width, height }), expected, `${width} × ${height}`);
  }
  assert.equal(photoWallSizes(0.5),
    '(width < 480px) 60px, (width < 768px) 75px, (width < 1024px) and (height < 480px) 75px, 180px');
});

test('edge drops and old positions keep rotated corners inside narrow and rotated walls', () => {
  for (const wall of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
    for (const [scale, ratio, rotation] of [[1, 9 / 16, -7], [0.5, 750 / 564, 8], [1, 1.4, 22]]) {
      const width = photoWallCardWidth(wall) * scale;
      const height = 8 + (width - 8) * ratio;
      const bounds = photoPositionBounds(wall, width, ratio, rotation);
      const angle = rotation * Math.PI / 180;
      assert.deepEqual(fitPhotoPosition({ x: 0, y: 0 }, bounds), { x: 0, y: 0 });
      for (const x of [-1000, 1000]) {
        for (const y of [-1000, 1000]) {
          const position = fitPhotoPosition({ x, y }, bounds);
          const centerX = wall.width / 2 + position.x;
          const centerY = wall.height / 2 + position.y - photoAnchorY(width) + height / 2;
          for (const dx of [-width / 2, width / 2]) {
            for (const dy of [-height / 2, height / 2]) {
              const cornerX = centerX + dx * Math.cos(angle) - dy * Math.sin(angle);
              const cornerY = centerY + dx * Math.sin(angle) + dy * Math.cos(angle);
              assert.ok(cornerX >= 11.999 && cornerX <= wall.width - 11.999);
              assert.ok(cornerY >= 11.999 && cornerY <= wall.height - 11.999);
            }
          }
        }
      }
    }
  }
});

test('a zero-height island measures the main instead of keeping desktop defaults', () => {
  assert.deepEqual(resolvePhotoWallSize(
    { width: 390, height: 0 },
    { width: 390, height: 844 },
    { width: 390, height: 844 },
  ), { width: 390, height: 844 });
});

test('a valid photo container takes priority over main and viewport dimensions', () => {
  assert.deepEqual(resolvePhotoWallSize(
    { width: 800, height: 600 },
    { width: 1280, height: 720 },
    { width: 1280, height: 720 },
  ), { width: 800, height: 600 });
});

test('a zero-height island follows the main size after a resize', () => {
  const portrait = resolvePhotoWallSize(
    { width: 390, height: 0 }, { width: 390, height: 844 }, { width: 390, height: 844 },
  );
  const landscape = resolvePhotoWallSize(
    { width: 844, height: 0 }, { width: 844, height: 390 }, { width: 844, height: 390 },
  );
  assert.deepEqual(portrait, { width: 390, height: 844 });
  assert.deepEqual(landscape, { width: 844, height: 390 });
});

test('a missing or unusable container falls back to the current viewport', () => {
  assert.deepEqual(resolvePhotoWallSize(null, null, { width: 1024, height: 768 }),
    { width: 1024, height: 768 });
  assert.deepEqual(resolvePhotoWallSize(
    { width: NaN, height: 600 }, { width: 390, height: 0 }, { width: 390, height: 844 },
  ), { width: 390, height: 844 });
});

function pointer(type: string, pointerId: number, clientX = 0, clientY = 0) {
  const event = new Event(type);
  Object.defineProperties(event, {
    pointerId: { value: pointerId },
    clientX: { value: clientX },
    clientY: { value: clientY },
  });
  return event;
}

test('a drag follows its own pointer and removes all listeners on release', () => {
  const target = new EventTarget();
  const moves: number[] = [];
  let releases = 0;
  let cancels = 0;
  listenForPointerDrag(target, 7, {
    onMove: (event) => moves.push(event.clientX),
    onEnd: () => {
      releases++;
      target.dispatchEvent(pointer('pointermove', 7, 99));
    },
    onCancel: () => cancels++,
  });
  target.dispatchEvent(pointer('pointermove', 8, 12));
  target.dispatchEvent(pointer('pointerup', 8));
  target.dispatchEvent(pointer('pointercancel', 8));
  target.dispatchEvent(pointer('pointermove', 7, 24));
  target.dispatchEvent(pointer('pointerup', 7));
  target.dispatchEvent(pointer('pointercancel', 7));
  assert.deepEqual(moves, [24]);
  assert.equal(releases, 1);
  assert.equal(cancels, 0);
});

test('pointer cancellation ends the drag without treating it as a click', () => {
  const target = new EventTarget();
  const events: string[] = [];
  listenForPointerDrag(target, 3, {
    onMove: () => events.push('move'),
    onEnd: () => events.push('release'),
    onCancel: () => events.push('cancel'),
  });
  target.dispatchEvent(pointer('pointercancel', 3));
  target.dispatchEvent(pointer('pointermove', 3));
  target.dispatchEvent(pointer('pointerup', 3));
  assert.deepEqual(events, ['cancel']);
});

test('unmount cleanup is idempotent and lets the next visit bind a fresh drag', () => {
  const target = new EventTarget();
  let oldCallbacks = 0;
  const old = listenForPointerDrag(target, 1, {
    onMove: () => oldCallbacks++,
    onEnd: () => oldCallbacks++,
    onCancel: () => oldCallbacks++,
  });
  old();
  old();
  let newCallbacks = 0;
  listenForPointerDrag(target, 1, {
    onMove: () => newCallbacks++,
    onEnd: () => newCallbacks++,
    onCancel: () => newCallbacks++,
  });
  target.dispatchEvent(pointer('pointermove', 1));
  target.dispatchEvent(pointer('pointerup', 1));
  target.dispatchEvent(pointer('pointercancel', 1));
  assert.equal(oldCallbacks, 0);
  assert.equal(newCallbacks, 2);
});

function imageFixture(complete = false, decode?: () => Promise<void>) {
  return Object.assign(new EventTarget(), { complete, decode }) as unknown as HTMLImageElement;
}

test('each loaded thumbnail can take over while another is still decoding', async () => {
  let finishDecode!: () => void;
  const slow = imageFixture(false, () => new Promise(resolve => { finishDecode = resolve; }));
  const ready: string[] = [];
  whenPhotoSettles(slow, () => { ready.push('slow'); });
  slow.dispatchEvent(new Event('load'));
  whenPhotoSettles(imageFixture(true), () => { ready.push('cached'); });
  assert.deepEqual(ready, ['cached']);
  finishDecode();
  await Promise.resolve();
  assert.deepEqual(ready, ['cached', 'slow']);
});

test('a failed source or decoder releases only its card and cleanup ignores stale callbacks', async () => {
  for (const failDecode of [false, true]) {
    const image = imageFixture(failDecode, () => Promise.reject(new Error('decode failed')));
    let completed = 0;
    const stop = whenPhotoSettles(image, () => { completed++; });
    if (!failDecode) image.dispatchEvent(new Event('error'));
    await Promise.resolve();
    image.dispatchEvent(new Event('load'));
    assert.equal(completed, 1);
    stop();
  }
  const image = imageFixture(true, () => Promise.resolve());
  let completed = false;
  const stop = whenPhotoSettles(image, () => { completed = true; });
  stop();
  await Promise.resolve();
  assert.equal(completed, false);
});

test('responsive previews retain the natural size and both original viewport caps', () => {
  const landscape = { width: 3840, height: 2400, previewWidth: 1920, previewHeight: 1200 };
  assert.equal(photoPreviewSize(landscape, true), 'min(95vw, 1920px, 137.6vh)');
  assert.equal(photoPreviewSize(landscape, false), 'min(85vw, 1920px, 147.2vh)');
  assert.equal(photoPreviewSize({ width: 403, height: 403 }, false), 'min(85vw, 403px, 92vh)');
  assert.equal(photoPreviewSize({}, true), '95vw');
});
