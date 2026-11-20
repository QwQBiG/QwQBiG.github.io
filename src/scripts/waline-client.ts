import { init, type WalineInstance } from '@waline/client';
import { keepCommentDisplayEmojiFree } from './waline-display';
import { enhanceCommentInteractions } from './waline-interactions';

export function mountWaline(element: HTMLElement, serverURL: string): (() => void) | undefined {
  const stopFormatting = keepCommentDisplayEmojiFree(element);
  let instance: WalineInstance | null = null;
  let stopInteractions: (() => void) | undefined;

  function dispose() {
    stopInteractions?.();
    stopFormatting();
    instance?.destroy();
  }

  try {
    instance = init({
      el: element,
      serverURL,
      login: 'force',
      path: element.dataset.path || window.location.pathname,
      dark: false,
      lang: 'en-US',
      emoji: false,
      search: false,
      reaction: false,
      locale: {
        nick: 'Nickname',
        nickError: 'Enter a nickname of at least 3 bytes.',
        mail: 'Email',
        placeholder: 'Write a comment…',
        sofa: 'No comments yet.',
        submit: 'Post comment',
        login: 'Sign in',
        logout: 'Sign out',
        more: 'Load more comments',
        refresh: 'Couldn’t load comments. Try again',
        uploadImage: 'Upload an image',
        cancelLike: 'Unlike',
        word: 'words',
        sticky: 'Pinned',
        unsticky: 'Unpin',
        waiting: 'Pending review',
        latest: 'Newest',
        hottest: 'Most popular',
        level0: 'Lurker',
        level1: 'New voice',
        level2: 'Commentator',
        level3: 'Regular',
        level4: 'Chatterbox',
        level5: 'Legend',
        subPostComment: 'Subscribe to comments on this post',
        subSiteComment: 'Subscribe to all comments',
        subscribeToReplies: 'Subscribe to replies to your comments',
      },
    });
    if (!instance) {
      dispose();
      return;
    }
    stopInteractions = enhanceCommentInteractions(element);
    return dispose;
  } catch (error) {
    dispose();
    throw error;
  }
}
