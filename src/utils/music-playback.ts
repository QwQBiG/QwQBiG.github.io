export interface MusicPlaybackState {
  playing: boolean;
  pending: boolean;
  requested: boolean;
  error: boolean;
}

/** Keep playback in the click's call stack and ignore superseded play promises. */
export function createMusicPlayback(audio: HTMLAudioElement, options: {
  beforePlay?: () => void;
  onChange: (state: Readonly<MusicPlaybackState>) => void;
}) {
  const state: MusicPlaybackState = {
    playing: !audio.paused && !audio.ended,
    pending: false,
    requested: !audio.paused && !audio.ended,
    error: Boolean(audio.error),
  };
  let revision = 0;
  let disposed = false;

  const update = (next: MusicPlaybackState) => {
    if (disposed || (Object.keys(state) as Array<keyof MusicPlaybackState>)
      .every((key) => state[key] === next[key])) return;
    Object.assign(state, next);
    options.onChange({ ...state });
  };

  const pause = () => {
    if (disposed) return;
    revision += 1;
    update({ playing: false, pending: false, requested: false, error: false });
    // pause() on an untouched NETWORK_EMPTY element starts resource selection.
    // Leave already-paused media alone so navigation cannot start an audio request.
    if (!audio.paused) audio.pause();
  };

  const fail = (token: number) => {
    if (disposed || token !== revision) return;
    revision += 1;
    update({ playing: false, pending: false, requested: false, error: true });
    // A rejected play attempt must leave the next click free to retry.
    if (!audio.paused) audio.pause();
  };

  const playing = () => {
    if (disposed || audio.paused) return;
    update({ playing: true, pending: false, requested: true, error: false });
  };
  const waiting = () => {
    if (disposed || audio.paused) return;
    update({ playing: false, pending: true, requested: true, error: false });
  };
  const paused = () => {
    // pause events can be queued until after a newer play request has started.
    if (disposed || !audio.paused) return;
    revision += 1;
    update({ playing: false, pending: false, requested: false, error: state.error });
  };
  const ended = () => {
    if (disposed || !audio.ended) return;
    revision += 1;
    update({ playing: false, pending: false, requested: false, error: false });
  };
  const errored = () => {
    if (!disposed && audio.error) fail(revision);
  };

  const listeners = {
    play: waiting,
    playing,
    waiting,
    pause: paused,
    ended,
    error: errored,
  };
  for (const [event, listener] of Object.entries(listeners)) {
    audio.addEventListener(event, listener);
  }

  return {
    get state(): Readonly<MusicPlaybackState> { return { ...state }; },
    toggle() {
      if (disposed) return;
      if (state.requested || !audio.paused) {
        pause();
        return;
      }
      const token = ++revision;
      update({ playing: false, pending: true, requested: true, error: false });
      // Warming is optional. A cache error must not consume the user's click.
      try { options.beforePlay?.(); } catch {}
      try {
        const result = audio.play();
        if (result && typeof result.then === 'function') {
          void result.then(() => {
            if (disposed || token !== revision) return;
            if (audio.paused) {
              update({ playing: false, pending: false, requested: false, error: false });
            } else {
              playing();
            }
          }, () => fail(token));
        }
      } catch {
        fail(token);
      }
    },
    pause,
    dispose() {
      if (disposed) return;
      disposed = true;
      revision += 1;
      for (const [event, listener] of Object.entries(listeners)) {
        audio.removeEventListener(event, listener);
      }
    },
  };
}
