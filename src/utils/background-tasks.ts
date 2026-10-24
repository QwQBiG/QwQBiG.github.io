export type BackgroundPriority = 'navigation' | 'prefetch' | 'image' | 'media';
export interface BackgroundTaskContext { readonly priority: BackgroundPriority; }

export interface BackgroundTask<T> {
  key: string;
  priority: BackgroundPriority;
  run: (signal: AbortSignal, context: BackgroundTaskContext) => Promise<T>;
  signal?: AbortSignal;
}

export interface BackgroundTaskHandle<T> {
  done: Promise<T | undefined>;
  cancel(): void;
}

interface SchedulerEnvironment {
  now?: () => number;
  timer?: (callback: () => void, delay: number) => () => void;
  idle?: (callback: () => void) => () => void;
}

interface QueuedTask {
  key: string;
  priority: BackgroundPriority;
  run: (signal: AbortSignal, context: BackgroundTaskContext) => Promise<unknown>;
  controller?: AbortController;
  cancelled: boolean;
  handle: BackgroundTaskHandle<unknown>;
  finish: (value: unknown) => void;
  detach?: () => void;
}

/** Coordinate optional downloads; foreground media and image clicks bypass this queue. */
export function createBackgroundTaskScheduler(environment: SchedulerEnvironment = {}) {
  const now = environment.now ?? Date.now;
  const timer = environment.timer ?? ((callback, delay) => {
    const id = setTimeout(callback, delay);
    return () => clearTimeout(id);
  });
  const idle = environment.idle ?? ((callback) => timer(callback, 0));
  const tasks = new Map<string, QueuedTask>();
  const waiting: QueuedTask[] = [];
  const running = new Set<QueuedTask>();
  let ready = false;
  let active = true;
  let disposed = false;
  let holdUntil = 0;
  let cancelIdle: (() => void) | undefined;
  let cancelHold: (() => void) | undefined;

  function remove(task: QueuedTask) {
    if (tasks.get(task.key) === task) tasks.delete(task.key);
    const index = waiting.indexOf(task);
    if (index !== -1) waiting.splice(index, 1);
    task.detach?.();
    task.detach = undefined;
  }

  function cancel(task: QueuedTask) {
    if (task.cancelled) return;
    task.cancelled = true;
    remove(task);
    task.controller?.abort();
    task.finish(undefined);
    pump();
  }

  function start(task: QueuedTask) {
    waiting.splice(waiting.indexOf(task), 1);
    const controller = new AbortController();
    task.controller = controller;
    running.add(task);
    // Keep rejections handled, including a synchronous exception from a task.
    void Promise.resolve().then(() => {
      if (task.cancelled || controller.signal.aborted) return undefined;
      return task.run(controller.signal, { get priority() { return task.priority; } });
    }).then(value => complete(task, value), () => complete(task, undefined));
  }

  function complete(task: QueuedTask, value: unknown) {
    running.delete(task);
    task.controller = undefined;
    remove(task);
    task.finish(task.cancelled || disposed ? undefined : value);
    pump();
  }

  function backgroundBlocked() {
    return !ready || !active || holdUntil > now()
      || waiting.some(task => task.priority === 'navigation')
      || [...running].some(task => task.priority === 'navigation');
  }

  function nextBackground() {
    // Reserve an opportunity for audio rather than waiting for every image to finish.
    return waiting.find(task => task.priority === 'media')
      ?? waiting.find(task => task.priority === 'image')
      ?? waiting.find(task => task.priority === 'prefetch');
  }

  function pump() {
    cancelIdle?.();
    cancelIdle = undefined;
    if (disposed || !active) return;
    let navigationCount = [...running].filter(task => task.priority === 'navigation').length;
    for (const task of [...waiting]) {
      if (navigationCount >= 6) break;
      if (task.priority === 'navigation') { start(task); navigationCount += 1; }
    }
    if (backgroundBlocked() || [...running].filter(task => task.priority !== 'navigation').length >= 4 || !nextBackground()) return;
    cancelIdle = idle(() => {
      cancelIdle = undefined;
      if (disposed || backgroundBlocked()) return;
      let backgroundCount = [...running].filter(task => task.priority !== 'navigation').length;
      let task: QueuedTask | undefined;
      while (backgroundCount < 4 && (task = nextBackground())) {
        start(task);
        backgroundCount += 1;
      }
    });
  }

  function prioritizeNavigation(durationMs = 0) {
    if (disposed) return;
    if (durationMs > 0) {
      holdUntil = Math.max(holdUntil, now() + durationMs);
      cancelHold?.();
      cancelHold = timer(() => { cancelHold = undefined; pump(); }, Math.max(0, holdUntil - now()));
    }
    pump();
  }

  return {
    schedule<T>(options: BackgroundTask<T>): BackgroundTaskHandle<T> {
      const existing = tasks.get(options.key);
      if (existing) {
        const rank = { prefetch: 0, image: 1, media: 2, navigation: 3 };
        if (rank[options.priority] > rank[existing.priority]) {
          existing.priority = options.priority;
          if (existing.priority === 'navigation') prioritizeNavigation();
          else pump();
        }
        return existing.handle as BackgroundTaskHandle<T>;
      }
      if (disposed || options.signal?.aborted) return { done: Promise.resolve(undefined), cancel() {} };
      let finish!: (value: unknown) => void;
      const done = new Promise<unknown>(resolve => { finish = resolve; });
      const task: QueuedTask = {
        key: options.key,
        priority: options.priority,
        run: options.run,
        cancelled: false,
        finish,
        handle: { done, cancel: () => cancel(task) },
      };
      if (options.signal) {
        const abort = () => cancel(task);
        options.signal.addEventListener('abort', abort, { once: true });
        task.detach = () => options.signal?.removeEventListener('abort', abort);
      }
      tasks.set(task.key, task);
      waiting.push(task);
      if (task.priority === 'navigation') prioritizeNavigation();
      else pump();
      return task.handle as BackgroundTaskHandle<T>;
    },
    prioritizeNavigation,
    setReady(value: boolean) { ready = value; pump(); },
    setActive(value: boolean) {
      active = value;
      // Let in-flight downloads finish into cache; hiding a tab must not restart music.
      pump();
    },
    dispose() {
      disposed = true;
      cancelIdle?.();
      cancelHold?.();
      for (const task of [...tasks.values()]) cancel(task);
    },
  };
}

let browserScheduler: ReturnType<typeof createBackgroundTaskScheduler> | undefined;

function getBrowserScheduler() {
  if (browserScheduler) return browserScheduler;
  browserScheduler = createBackgroundTaskScheduler({
    idle(callback) {
      let cancelled = false;
      queueMicrotask(() => { if (!cancelled) callback(); });
      return () => { cancelled = true; };
    },
  });
  const scheduler = browserScheduler;
  scheduler.setReady(document.readyState === 'complete');
  scheduler.setActive(!document.hidden);
  window.addEventListener('load', () => scheduler.setReady(true), { once: true });
  document.addEventListener('visibilitychange', () => scheduler.setActive(!document.hidden));
  window.addEventListener('pagehide', () => scheduler.setActive(false));
  window.addEventListener('pageshow', () => scheduler.setActive(!document.hidden));
  // The small navigation bootstrap can yield bandwidth before its lazy enhancement arrives.
  window.addEventListener('site:navigation-intent', () => scheduler.prioritizeNavigation());
  return scheduler;
}

export function scheduleBackgroundTask<T>(options: BackgroundTask<T>): BackgroundTaskHandle<T> {
  return getBrowserScheduler().schedule(options);
}

export function prioritizeNavigation(durationMs = 0) {
  getBrowserScheduler().prioritizeNavigation(durationMs);
}
