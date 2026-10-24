import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { test } from 'node:test';
import { createBackgroundTaskScheduler } from '../src/utils/background-tasks.ts';

function setup() {
  let now = 0;
  const timers = new Set<{ callback: () => void; at: number }>();
  const idle = new Set<() => void>();
  const scheduler = createBackgroundTaskScheduler({
    now: () => now,
    timer(callback, delay) {
      const task = { callback, at: now + delay };
      timers.add(task);
      return () => { timers.delete(task); };
    },
    idle(callback) { idle.add(callback); return () => { idle.delete(callback); }; },
  });
  return {
    scheduler,
    async flush() {
      for (const callback of [...idle]) { idle.delete(callback); callback(); }
      await setImmediate();
    },
    async advance(ms: number) {
      now += ms;
      for (const task of [...timers]) if (task.at <= now) { timers.delete(task); task.callback(); }
      await setImmediate();
    },
  };
}

test('background waits for page load, then music and images can start together', async () => {
  const env = setup(), order: string[] = [];
  env.scheduler.schedule({ key: 'music', priority: 'media', run: async () => { order.push('music'); } });
  env.scheduler.schedule({ key: 'image', priority: 'image', run: async () => { order.push('image'); } });
  await env.flush();
  assert.deepEqual(order, []);
  env.scheduler.setReady(true);
  assert.deepEqual(order, []);
  await env.flush();
  assert.deepEqual(order, ['music', 'image']);
});

test('navigation starts immediately without discarding an in-flight music download', async () => {
  const env = setup(), signals: AbortSignal[] = [];
  env.scheduler.setReady(true);
  let finishMusic!: (value: string) => void;
  const music = env.scheduler.schedule({ key: 'music', priority: 'media', run: signal => {
    signals.push(signal);
    return new Promise<string>(resolve => { finishMusic = resolve; });
  } });
  await env.flush();
  let finished = false;
  void music.done.then(() => { finished = true; });
  const nav = env.scheduler.schedule({ key: 'page', priority: 'navigation', run: async () => 'page ready' });
  assert.equal(signals[0].aborted, false);
  assert.equal(await nav.done, 'page ready');
  assert.equal(finished, false);
  env.scheduler.prioritizeNavigation();
  await env.flush();
  assert.equal(signals.length, 1);
  finishMusic('cached');
  assert.equal(await music.done, 'cached');
});

test('navigation concurrency is bounded and can start before page load', async () => {
  const env = setup(), started: string[] = [], release: Array<() => void> = [];
  for (const key of ['one', 'two', 'three', 'four', 'five', 'six', 'seven']) env.scheduler.schedule({ key, priority: 'navigation', run: () => {
    started.push(key); return new Promise<void>(resolve => release.push(resolve));
  } });
  await setImmediate();
  assert.deepEqual(started, ['one', 'two', 'three', 'four', 'five', 'six']);
  release[0]();
  await setImmediate();
  assert.deepEqual(started, ['one', 'two', 'three', 'four', 'five', 'six', 'seven']);
  env.scheduler.dispose();
});

test('navigation, music and small images can progress together without restarting them', async () => {
  const env = setup();
  env.scheduler.setReady(true);
  let imageSignal!: AbortSignal, finishImage!: () => void, nextStarted = false;
  env.scheduler.schedule({ key: 'image', priority: 'image', run: signal => {
    imageSignal = signal; return new Promise<void>(resolve => { finishImage = resolve; });
  } });
  env.scheduler.schedule({ key: 'music', priority: 'media', run: async () => { nextStarted = true; } });
  await env.flush();
  const nav = env.scheduler.schedule({ key: 'page', priority: 'navigation', run: async () => true });
  assert.equal(await nav.done, true);
  assert.equal(imageSignal.aborted, false);
  await env.advance(2000);
  await env.flush();
  assert.equal(nextStarted, true);
  finishImage();
  await setImmediate();
  await env.flush();
  assert.equal(nextStarted, true);
});

test('deduplicated keys share a job, cancellation settles, and a replacement may use the same key', async () => {
  const env = setup();
  const first = env.scheduler.schedule({ key: 'same', priority: 'media', run: async () => 1 });
  const duplicate = env.scheduler.schedule({ key: 'same', priority: 'media', run: async () => 2 });
  assert.equal(first, duplicate);
  first.cancel();
  assert.equal(await first.done, undefined);
  const second = env.scheduler.schedule({ key: 'same', priority: 'media', run: async () => 3 });
  env.scheduler.setReady(true);
  await env.flush();
  assert.equal(await second.done, 3);
});

test('hiding a page keeps in-flight cache downloads while deferring new background work', async () => {
  const env = setup();
  env.scheduler.setReady(true);
  let starts = 0;
  let signal!: AbortSignal, finish!: () => void, queuedStarted = false;
  const job = env.scheduler.schedule({ key: 'music', priority: 'media', run: currentSignal => {
    signal = currentSignal;
    starts += 1;
    return new Promise<void>(resolve => { finish = resolve; });
  } });
  await env.flush();
  env.scheduler.setActive(false);
  env.scheduler.schedule({ key: 'later', priority: 'prefetch', run: async () => { queuedStarted = true; } });
  await setImmediate();
  await env.flush();
  assert.equal(starts, 1);
  assert.equal(signal.aborted, false);
  assert.equal(queuedStarted, false);
  finish();
  await job.done;
  env.scheduler.setActive(true);
  await env.flush();
  assert.equal(starts, 1);
  assert.equal(queuedStarted, true);
});

test('a clicked destination promotes its queued prediction without a duplicate request', async () => {
  const env = setup();
  env.scheduler.setReady(true);
  for (let i = 0; i < 4; i++) env.scheduler.schedule({ key: `busy-${i}`, priority: 'prefetch', run: () => new Promise<void>(() => {}) });
  let calls = 0, startedPriority = '';
  const predicted = env.scheduler.schedule({ key: 'target', priority: 'prefetch', run: async (_signal, context) => {
    calls += 1;
    startedPriority = context.priority;
    return 'ready';
  } });
  await env.flush();
  assert.equal(calls, 0);
  const clicked = env.scheduler.schedule({ key: 'target', priority: 'navigation', run: async () => { calls += 100; return 'duplicate'; } });
  assert.equal(clicked, predicted);
  assert.equal(await clicked.done, 'ready');
  assert.equal(calls, 1);
  assert.equal(startedPriority, 'navigation');
  env.scheduler.dispose();
});

test('explicit cancellation still aborts a running download and cannot remove its replacement', async () => {
  const env = setup();
  env.scheduler.setReady(true);
  let signal!: AbortSignal;
  const original = env.scheduler.schedule({ key: 'audio', priority: 'media', run: currentSignal => {
    signal = currentSignal;
    return new Promise<void>(resolve => currentSignal.addEventListener('abort', () => resolve(), { once: true }));
  } });
  await env.flush();
  original.cancel();
  assert.equal(signal.aborted, true);
  assert.equal(await original.done, undefined);
  const replacement = env.scheduler.schedule({ key: 'audio', priority: 'media', run: async () => 'ready' });
  await env.flush();
  assert.equal(await replacement.done, 'ready');
});

test('aborted lifetime, rejected tasks and synchronous errors leave the queue usable', async () => {
  const env = setup(), lifetime = new AbortController();
  let starts = 0;
  const cancelled = env.scheduler.schedule({ key: 'gone', priority: 'media', signal: lifetime.signal, run: async () => { starts += 1; } });
  lifetime.abort();
  assert.equal(await cancelled.done, undefined);
  const rejected = env.scheduler.schedule({ key: 'reject', priority: 'image', run: async () => { throw new Error('offline'); } });
  const thrown = env.scheduler.schedule({ key: 'throw', priority: 'media', run: () => { throw new Error('sync'); } });
  env.scheduler.setReady(true);
  await env.flush();
  assert.equal(await rejected.done, undefined);
  await env.flush();
  assert.equal(await thrown.done, undefined);
  assert.equal(starts, 0);
});

test('repeated intent extends the background hold, and dispose cancels queued work', async () => {
  const env = setup();
  env.scheduler.setReady(true);
  let started = false;
  const job = env.scheduler.schedule({ key: 'music', priority: 'media', run: async () => { started = true; } });
  env.scheduler.prioritizeNavigation(2000);
  await env.advance(1500);
  env.scheduler.prioritizeNavigation(2000);
  await env.advance(500);
  await env.flush();
  assert.equal(started, false);
  env.scheduler.dispose();
  assert.equal(await job.done, undefined);
  await env.advance(10000);
  await env.flush();
  assert.equal(started, false);
});
