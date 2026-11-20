import { getComment as readComments, type GetCommentOptions } from '@waline/api';

export * from '@waline/api';

// Waline cancels list reads on navigation and sorting. It shows a retry button
// on other failures, but a stalled connection can otherwise spin indefinitely.
export async function getComment(options: GetCommentOptions) {
  const { signal } = options;
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
    return await readComments({ ...options, signal: controller.signal });
  } catch (error) {
    // Some browsers always reject an aborted fetch with AbortError. Reserve
    // that name for Waline's own cancellations so a timeout offers a retry.
    if (timedOut && !signal?.aborted) throw new Error('The comment list request timed out.');
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}
