import { getComment as readComments, type GetCommentOptions } from '@waline/api';

export * from '@waline/api';

export const rootPageSize = 8;

type PageRead = { page: number; totalPages: number | null };
type ListView = { rootIds: () => Set<string>; receive: (read: PageRead) => void };
const views = new Map<string, ListView>();

export function observeCommentPages(path: string, signal: AbortSignal, view: ListView) {
  views.set(path, view);
  signal.addEventListener('abort', () => {
    if (views.get(path) === view) views.delete(path);
  }, { once: true });
}

// Waline cancels list reads on navigation and sorting. It shows a retry button
// on other failures, but a stalled connection can otherwise spin indefinitely.
export async function getComment(options: GetCommentOptions) {
  const { signal, path, page } = options;
  const report = (totalPages: number | null) => {
    if (!signal?.aborted) views.get(path)?.receive({ page, totalPages });
  };
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  else signal?.addEventListener('abort', cancel, { once: true });

  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    cancel();
  }, 12000);
  try {
    // The server pages by offset, while Waline prepends posts and removes
    // moderated roots locally. Revisit a shifted boundary after deletions,
    // and never append a root that's already displayed after an insertion.
    const known = page > 1 ? views.get(path)?.rootIds() : undefined;
    const start = known ? Math.min(page, Math.floor(known.size / options.pageSize) + 1) : page;
    const read = (number: number) => readComments({ ...options, page: number, signal: controller.signal });
    let result = await read(start);
    if (known) {
      const roots = result.data.slice();
      for (let number = start + 1; number <= Math.min(page, result.totalPages); number++) {
        result = await read(number);
        roots.push(...result.data);
      }
      result = { ...result, page, data: roots.filter(root => {
        const id = String(root.objectId);
        if (known.has(id)) return false;
        known.add(id);
        return true;
      }) };
    }
    report(result.totalPages);
    return result;
  } catch (error) {
    report(null);
    // Some browsers always reject an aborted fetch with AbortError. Reserve
    // that name for Waline's own cancellations so a timeout offers a retry.
    if (timedOut && !signal?.aborted) throw new Error('The comment list request timed out.');
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}
