import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { test } from 'node:test';
import { createMusicPlayback, type MusicPlaybackState } from '../src/utils/music-playback.ts';

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

class FakeAudio extends EventTarget {
  paused = true;
  ended = false;
  error: MediaError | null = null;
  playCalls = 0;
  pauseCalls = 0;
  playResult: () => Promise<void> | undefined = () => undefined;
  play() {
    this.playCalls += 1;
    this.paused = false;
    this.ended = false;
    return this.playResult();
  }
  pause() { this.pauseCalls += 1; this.paused = true; }
  emit(event: string) { this.dispatchEvent(new Event(event)); }
}

function setup(audio = new FakeAudio(), beforePlay?: () => void) {
  const states: Readonly<MusicPlaybackState>[] = [];
  const playback = createMusicPlayback(audio as unknown as HTMLAudioElement, {
    beforePlay,
    onChange: (state) => states.push(state),
  });
  return { audio, playback, states };
}

test('play stays synchronous with the user click while its promise is pending', async () => {
  const pending = deferred();
  const order: string[] = [];
  const { audio, playback } = setup(undefined, () => order.push('before'));
  audio.playResult = () => { order.push('play'); return pending.promise; };
  playback.toggle();
  order.push('after click');
  assert.deepEqual(order, ['before', 'play', 'after click']);
  assert.deepEqual(playback.state, { playing: false, pending: true, requested: true, error: false });
  pending.resolve();
  await setImmediate();
  assert.deepEqual(playback.state, { playing: true, pending: false, requested: true, error: false });
});

test('pausing untouched or already paused media does not start native resource selection', () => {
  const { audio, playback } = setup();
  playback.pause();
  playback.pause();
  assert.equal(audio.pauseCalls, 0);
  assert.deepEqual(playback.state, { playing: false, pending: false, requested: false, error: false });
  playback.toggle();
  playback.pause();
  playback.pause();
  assert.equal(audio.pauseCalls, 1);
});

test('a second click cancels pending playback and a late promise cannot resume the UI', async () => {
  const pending = deferred();
  const { audio, playback, states } = setup();
  audio.playResult = () => pending.promise;
  playback.toggle();
  playback.toggle();
  assert.equal(audio.playCalls, 1);
  assert.equal(audio.pauseCalls, 1);
  const notifications = states.length;
  pending.resolve();
  await setImmediate();
  assert.equal(states.length, notifications);
  assert.deepEqual(playback.state, { playing: false, pending: false, requested: false, error: false });
});

test('quick pause and replay ignore old rejections and stale queued pause events', async () => {
  const first = deferred(), second = deferred();
  const { audio, playback } = setup();
  audio.playResult = () => audio.playCalls === 1 ? first.promise : second.promise;
  playback.toggle();
  playback.toggle();
  playback.toggle();
  audio.emit('pause'); // The actual media is playing the newer request, so paused=false.
  first.reject(new Error('old play aborted'));
  await setImmediate();
  assert.equal(playback.state.pending, true);
  assert.equal(playback.state.error, false);
  second.resolve();
  await setImmediate();
  assert.equal(playback.state.playing, true);
  assert.equal(audio.playCalls, 2);
});

test('playing events may arrive before the play promise without duplicate state changes', async () => {
  const pending = deferred();
  const { audio, playback, states } = setup();
  audio.playResult = () => pending.promise;
  playback.toggle();
  audio.emit('playing');
  const notifications = states.length;
  pending.resolve();
  await setImmediate();
  assert.equal(states.length, notifications);
  assert.equal(playback.state.playing, true);
});

test('rejected playback is handled and the next click can retry', async () => {
  const first = deferred(), second = deferred();
  const { audio, playback } = setup();
  audio.playResult = () => audio.playCalls === 1 ? first.promise : second.promise;
  playback.toggle();
  first.reject(new Error('network failed'));
  await setImmediate();
  audio.emit('pause');
  assert.deepEqual(playback.state, { playing: false, pending: false, requested: false, error: true });
  playback.toggle();
  assert.equal(audio.playCalls, 2);
  assert.equal(playback.state.error, false);
  second.resolve();
  await setImmediate();
  assert.equal(playback.state.playing, true);
});

test('synchronous play errors are handled and optional warming errors cannot block play', () => {
  const { audio, playback } = setup(undefined, () => { throw new Error('cache failed'); });
  audio.playResult = () => { throw new Error('media unavailable'); };
  playback.toggle();
  assert.equal(audio.playCalls, 1);
  assert.equal(playback.state.error, true);
  audio.playResult = () => undefined;
  playback.toggle();
  assert.equal(audio.playCalls, 2);
  assert.equal(playback.state.pending, true);
});

test('buffering, pause, ended and error events keep state aligned with the media', () => {
  const { audio, playback } = setup();
  playback.toggle();
  audio.emit('playing');
  assert.equal(playback.state.playing, true);
  audio.emit('waiting');
  assert.deepEqual(playback.state, { playing: false, pending: true, requested: true, error: false });
  audio.emit('playing');
  audio.paused = true;
  audio.emit('pause');
  assert.equal(playback.state.requested, false);
  playback.toggle();
  audio.ended = true;
  audio.paused = true;
  audio.emit('ended');
  assert.deepEqual(playback.state, { playing: false, pending: false, requested: false, error: false });
  playback.toggle();
  audio.error = { code: 2 } as MediaError;
  audio.emit('error');
  assert.equal(playback.state.error, true);
  assert.equal(playback.state.requested, false);
});

test('legacy play returning undefined waits for real playing events', async () => {
  const { audio, playback } = setup();
  playback.toggle();
  await setImmediate();
  assert.deepEqual(playback.state, { playing: false, pending: true, requested: true, error: false });
  audio.emit('playing');
  assert.equal(playback.state.playing, true);
  playback.pause();
  audio.emit('playing'); // Queued after pause; actual paused=true wins.
  assert.equal(playback.state.playing, false);
});

test('dispose detaches media events and silences old promises without touching playback', async () => {
  const pending = deferred();
  const { audio, playback, states } = setup();
  audio.playResult = () => pending.promise;
  playback.toggle();
  const notifications = states.length;
  playback.dispose();
  playback.dispose();
  pending.reject(new Error('removed'));
  await setImmediate();
  audio.emit('playing');
  audio.emit('waiting');
  audio.paused = true;
  audio.emit('pause');
  playback.toggle();
  playback.pause();
  assert.equal(states.length, notifications);
  assert.equal(audio.playCalls, 1);
  assert.equal(audio.pauseCalls, 0);
});
