import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fitPhotoPosition, listenForPointerDrag, photoAnchorY, photoCardStyle, photoPositionFromCenter, photoPositionBounds, photoPreviewSize, photoWallBreakpoints, photoWallSizes } from '../src/utils/photo-wall.ts';

const firstLayout = readFileSync(new URL('../src/scripts/gallery-first-layout.js', import.meta.url), 'utf8');

test('saved photos use their legacy wall offsets and damaged or unavailable entries keep their ring seats', () => {
  const properties = new Map<string, string>();
  runInNewContext(firstLayout, {
    document: {
      currentScript: { dataset: { photoIds: '["1","2","3","4","5"]' } },
      documentElement: { style: { setProperty: (key: string, value: unknown) => properties.set(key, String(value)) } },
    },
    localStorage: { getItem(key: string) {
      if (key.endsWith('-1')) return '{"x":500,"y":-800,"rotation":366,"zIndex":40}';
      if (key.endsWith('-2')) throw new Error('Storage unavailable');
      if (key.endsWith('-3')) return '{"x":"bad","y":0}';
      if (key.endsWith('-4')) return '{"x":-8,"y":5,"rotation":"invalid","zIndex":2.1}';
      return null;
    } },
  });
  function pose(id: string) {
    return ['x', 'y', 'rotation', 'z'].map(key => properties.get(`--photo-${id}-${key}`));
  }
  assert.deepEqual(pose('1'), ['500px', '-800px', '6deg', '40']);
  assert.deepEqual(pose('4'), ['-8px', '5px', '0deg', undefined]);
  for (const id of ['2','3','5']) assert.ok(pose(id).every(value => value === undefined));
});

test('unsaved frames follow deterministic, equally spaced clockwise angles starting at the top', () => {
  for (const count of [2, 5, 7]) {
    for (let i = 0; i < count; i++) {
      const style = photoCardStyle({ id: String(i + 1) }, i, count);
      const radians = i * 2 * Math.PI / count - Math.PI / 2;
      assert.ok(Math.abs(style['--ring-cos'] - Math.cos(radians)) < .000001);
      assert.ok(Math.abs(style['--ring-sin'] - Math.sin(radians)) < .000001);
    }
  }
  const single = photoCardStyle({ id: '1' }, 0, 1);
  assert.deepEqual([single['--ring-cos'], single['--ring-sin']], [0, 0]);
});

test('thumbnail sizing follows exact viewport boundaries and short phone landscape', () => {
  const css = photoWallBreakpoints();
  const cascade = [...css.matchAll(/--gallery-card-size: (\d+)px/g)].map(match => Number(match[1]));
  assert.deepEqual(cascade, [360, 240, 150, 150, 120], 'smaller breakpoints override the broader rules');
  assert.ok(css.includes('@media (width < 1024px) and (height < 480px) { :root { --gallery-card-size: 150px; } }'));
  assert.equal(photoWallSizes(0.5),
    '(width < 480px) 60px, (width < 768px) 75px, (width < 1024px) and (height < 480px) 75px, (width < 1024px) 120px, 180px');
});

test('edge drops and old positions keep rotated corners inside narrow and rotated walls', () => {
  for (const [viewportWidth, viewportHeight, baseWidth] of [[320, 568, 120], [390, 844, 120], [844, 390, 150]]) {
    const wall = { width: viewportWidth, height: viewportHeight };
    for (const [scale, ratio, rotation] of [[1, 9 / 16, -7], [0.5, 750 / 564, 8], [1, 1.4, 22]]) {
      const width = baseWidth * scale;
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

test('responsive previews retain the natural size and both original viewport caps', () => {
  const landscape = { width: 3840, height: 2400, previewWidth: 1920, previewHeight: 1200 };
  assert.equal(photoPreviewSize(landscape, true), 'min(95vw, 1920px, 137.6vh)');
  assert.equal(photoPreviewSize(landscape, false), 'min(85vw, 1920px, 147.2vh)');
  assert.equal(photoPreviewSize({ width: 403, height: 403 }, false), 'min(85vw, 403px, 92vh)');
  assert.equal(photoPreviewSize({}, true), '95vw');
});

test('grabbing a photo mid-flight follows its visible center with the original saved anchor', () => {
  for (const [wall, frame, center] of [
    [{ width: 390, height: 844 }, { width: 120, height: 88 }, { x: 210, y: 380 }],
    [{ width: 1440, height: 900 }, { width: 360, height: 210 }, { x: 610, y: 460 }],
  ]) {
    const start = photoPositionFromCenter(center, wall, frame);
    const drop = { x: start.x + 38, y: start.y - 21 };
    assert.equal(wall.width / 2 + drop.x, center.x + 38);
    assert.equal(wall.height / 2 + drop.y - photoAnchorY(frame.width) + frame.height / 2, center.y - 21);
  }
});
