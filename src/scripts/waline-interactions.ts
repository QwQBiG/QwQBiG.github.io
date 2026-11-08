import { replaceEmoji } from '../utils/emoji';

interface EditorPopover extends HTMLElement {
  showPopover(): void;
  hidePopover(): void;
}

/** Enhance the mounted Waline DOM without replacing its editor or comment data. */
export function enhanceCommentInteractions(container: HTMLElement): () => void {
  const lifetime = new AbortController();
  const options = { signal: lifetime.signal };
  const document = container.ownerDocument;
  const window = document.defaultView!;
  const mobile = window.matchMedia('(max-width: 640px)');
  const canPopover = typeof container.showPopover === 'function';
  const expanded = new Set<string>();
  const folds = new Map<HTMLElement, HTMLButtonElement>();
  const editorButtons = new Map<HTMLElement, HTMLButtonElement>();
  let frame = 0;
  let sequence = 0;
  let disposed = false;
  let avatarDialog: HTMLDialogElement | undefined;
  let avatarOrigin: HTMLElement | undefined;
  let sheet: {
    editor: EditorPopover;
    origin: HTMLElement;
    attributes: Map<string, string | null>;
    inert: HTMLElement[];
    overflow: string;
  } | undefined;

  const text = (value: string) => replaceEmoji(value).trim();
  const createButton = (className: string, label: string) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    return button;
  };

  function scheduleRefresh() {
    if (!frame && !disposed) frame = window.requestAnimationFrame(refresh);
  }

  function prepareAvatar(image: HTMLImageElement, author: string) {
    if (image.dataset.commentAvatar === 'ready') return;
    image.dataset.commentAvatar = 'ready';
    image.setAttribute('role', 'button');
    image.tabIndex = 0;
    image.setAttribute('aria-label', `预览${author || '评论者'}的头像`);
    image.title = '预览头像';
    const wrapper = image.parentElement;
    if (wrapper?.classList.contains('wl-user')) {
      wrapper.removeAttribute('aria-hidden');
      wrapper.querySelectorAll('svg').forEach(icon => icon.setAttribute('aria-hidden', 'true'));
    }
  }

  function previewAvatar(image: HTMLImageElement, origin: HTMLElement) {
    if (!image.currentSrc && !image.src) return;
    if (!avatarDialog) {
      avatarDialog = document.createElement('dialog');
      avatarDialog.className = 'comment-avatar-dialog';
      avatarDialog.setAttribute('aria-label', '头像预览');
      const header = document.createElement('div');
      header.className = 'comment-dialog-header';
      const title = document.createElement('strong');
      title.textContent = '头像预览';
      const close = createButton('comment-dialog-close', '关闭');
      close.addEventListener('click', () => avatarDialog?.close(), options);
      header.append(title, close);
      const preview = document.createElement('img');
      preview.alt = '评论者头像';
      avatarDialog.append(header, preview);
      avatarDialog.addEventListener('close', () => {
        avatarDialog?.querySelector('img')?.removeAttribute('src');
        if (avatarOrigin?.isConnected && !disposed) avatarOrigin.focus({ preventScroll: true });
      }, options);
      avatarDialog.addEventListener('click', event => {
        if (event.target !== avatarDialog) return;
        const bounds = avatarDialog!.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) avatarDialog?.close();
      }, options);
      document.body.append(avatarDialog);
    }
    avatarOrigin = origin;
    avatarDialog.querySelector('img')!.src = image.currentSrc || image.src;
    if (!avatarDialog.open) avatarDialog.showModal();
  }

  function updateViewport() {
    if (!sheet) return;
    const viewport = window.visualViewport;
    const height = viewport?.height ?? window.innerHeight;
    const bottom = viewport ? Math.max(0, window.innerHeight - viewport.offsetTop - height) : 0;
    sheet.editor.style.setProperty('--comment-viewport-height', `${height}px`);
    sheet.editor.style.setProperty('--comment-keyboard-inset', `${bottom}px`);
  }

  function closeEditor(restoreFocus = true) {
    if (!sheet) return;
    const previous = sheet;
    sheet = undefined;
    try { previous.editor.hidePopover(); } catch { /* The editor may have unmounted. */ }
    previous.editor.classList.remove('comment-editor-sheet');
    previous.editor.style.removeProperty('--comment-viewport-height');
    previous.editor.style.removeProperty('--comment-keyboard-inset');
    for (const [name, value] of previous.attributes) {
      if (value === null) previous.editor.removeAttribute(name);
      else previous.editor.setAttribute(name, value);
    }
    for (const element of previous.inert) element.inert = false;
    document.body.style.overflow = previous.overflow;
    if (restoreFocus && !disposed) {
      const origin = previous.origin instanceof HTMLTextAreaElement
        ? editorButtons.get(previous.editor) : previous.origin;
      if (origin?.isConnected) origin.focus({ preventScroll: true });
    }
  }

  function openEditor(editor: HTMLElement, origin: HTMLElement) {
    if (!mobile.matches || !canPopover || sheet?.editor === editor) return;
    closeEditor(false);
    const attributes = new Map(['popover', 'role', 'aria-modal', 'aria-label'].map(name => [name, editor.getAttribute(name)]));
    const inert: HTMLElement[] = [];
    let branch = editor;
    for (let parent = branch.parentElement; parent && parent !== document.documentElement; parent = branch.parentElement) {
      for (const sibling of parent.children) {
        if (sibling instanceof HTMLElement && sibling !== branch && sibling !== avatarDialog && !sibling.inert) {
          sibling.inert = true;
          inert.push(sibling);
        }
      }
      branch = parent;
    }
    sheet = { editor: editor as EditorPopover, origin, attributes, inert, overflow: document.body.style.overflow };
    editor.setAttribute('popover', 'manual');
    editor.setAttribute('role', 'dialog');
    editor.setAttribute('aria-modal', 'true');
    const label = editor.closest('.wl-edit-wrapper') ? '编辑评论' : editor.closest('.wl-reply-wrapper') ? '回复评论' : '写评论';
    editor.setAttribute('aria-label', label);
    editor.querySelector('.comment-sheet-header strong')!.textContent = label;
    editor.classList.add('comment-editor-sheet');
    document.body.style.overflow = 'hidden';
    try {
      sheet.editor.showPopover();
      updateViewport();
      editor.querySelector<HTMLTextAreaElement>('textarea')?.focus({ preventScroll: true });
    } catch { closeEditor(false); }
  }

  function prepareEditor(editor: HTMLElement) {
    if (!canPopover || editorButtons.has(editor)) return;
    const launch = createButton('comment-open-editor', '展开编辑');
    launch.dataset.commentOpenEditor = '';
    const header = document.createElement('div');
    header.className = 'comment-sheet-header';
    const title = document.createElement('strong');
    title.textContent = '写评论';
    const done = createButton('comment-sheet-done', '完成');
    done.dataset.commentCloseEditor = '';
    header.append(title, done);
    editor.prepend(header, launch);
    editor.dataset.commentEditor = '';
    editorButtons.set(editor, launch);
  }

  function refresh() {
    frame = 0;
    if (disposed) return;
    if (sheet && !sheet.editor.isConnected) closeEditor(false);
    for (const [body, button] of folds) {
      if (!body.isConnected) { button.remove(); folds.delete(body); }
    }
    for (const [editor, button] of editorButtons) {
      if (!editor.isConnected) { button.remove(); editorButtons.delete(editor); }
    }
    for (const item of container.querySelectorAll<HTMLElement>('.wl-card-item')) {
      const head = item.querySelector<HTMLElement>(':scope > .wl-card > .wl-head');
      const avatar = item.querySelector<HTMLImageElement>(':scope > .wl-user > .wl-user-avatar');
      if (avatar) prepareAvatar(avatar, text(head?.querySelector('.wl-nick')?.textContent ?? ''));
      const identity = item.querySelector(':scope > .wl-user > .administrator-icon') ? '管理员'
        : item.querySelector(':scope > .wl-user > .verified-icon') ? '注册用户' : '';
      if (identity && head && !head.querySelector('[data-comment-identity]')) {
        const badge = document.createElement('span');
        badge.className = 'comment-identity';
        badge.dataset.commentIdentity = '';
        badge.textContent = identity;
        head.querySelector('.wl-nick')?.after(badge);
      }
    }
    for (const info of container.querySelectorAll<HTMLElement>('.wl-login-info')) {
      if (!info.querySelector('.wl-avatar img') || info.querySelector('[data-comment-current-avatar]')) continue;
      const preview = createButton('comment-current-avatar', '预览头像');
      preview.dataset.commentCurrentAvatar = '';
      info.append(preview);
    }
    for (const body of container.querySelectorAll<HTMLElement>('.wl-card > .wl-content')) {
      if (folds.has(body) || body.scrollHeight <= 240) continue;
      const id = body.closest('.wl-card-item')?.id || `comment-${sequence++}`;
      if (!body.id) body.id = `comment-body-${sequence++}`;
      const button = createButton('comment-fold-button', expanded.has(id) ? '收起全文' : '展开全文');
      button.dataset.commentFold = id;
      button.setAttribute('aria-controls', body.id);
      button.setAttribute('aria-expanded', String(expanded.has(id)));
      body.classList.toggle('comment-content-folded', !expanded.has(id));
      body.after(button);
      folds.set(body, button);
    }
    container.querySelectorAll<HTMLElement>('.wl-comment').forEach(prepareEditor);
  }

  container.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const avatar = target.closest<HTMLImageElement>('.wl-user-avatar[data-comment-avatar]');
    if (avatar) { event.preventDefault(); previewAvatar(avatar, avatar); return; }
    const ownAvatar = target.closest<HTMLElement>('[data-comment-current-avatar]');
    if (ownAvatar) {
      const image = ownAvatar.closest('.wl-login-info')?.querySelector<HTMLImageElement>('.wl-avatar img');
      if (image) previewAvatar(image, ownAvatar);
      return;
    }
    const fold = target.closest<HTMLButtonElement>('[data-comment-fold]');
    if (fold) {
      const body = document.getElementById(fold.getAttribute('aria-controls')!);
      if (!body) return;
      const id = fold.dataset.commentFold!;
      if (expanded.has(id)) expanded.delete(id); else expanded.add(id);
      const open = expanded.has(id);
      body.classList.toggle('comment-content-folded', !open);
      fold.setAttribute('aria-expanded', String(open));
      fold.textContent = open ? '收起全文' : '展开全文';
      return;
    }
    const launch = target.closest<HTMLElement>('[data-comment-open-editor]');
    if (launch) { openEditor(launch.closest<HTMLElement>('.wl-comment')!, launch); return; }
    if (target.closest('[data-comment-close-editor]')) { closeEditor(); return; }
    if (mobile.matches && target.closest('.wl-reply, .wl-edit')) {
      window.requestAnimationFrame(() => {
        const editor = container.querySelector<HTMLElement>('.wl-reply-wrapper .wl-comment, .wl-edit-wrapper .wl-comment');
        if (editor) { refresh(); openEditor(editor, target.closest<HTMLElement>('button')!); }
      });
    }
  }, options);

  container.addEventListener('focusin', event => {
    if (event.target instanceof HTMLTextAreaElement && !sheet) {
      const editor = event.target.closest<HTMLElement>('.wl-comment');
      if (editor) openEditor(editor, event.target);
    }
  }, options);
  container.addEventListener('keydown', event => {
    const avatar = event.target instanceof HTMLImageElement ? event.target : null;
    if (avatar?.dataset.commentAvatar && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      previewAvatar(avatar, avatar);
    }
  }, options);
  document.addEventListener('keydown', event => {
    if (!sheet || avatarDialog?.open) return;
    if (event.key === 'Escape') { event.preventDefault(); closeEditor(); return; }
    if (event.key !== 'Tab') return;
    const controls = [...sheet.editor.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])')]
      .filter(control => control.getClientRects().length > 0);
    const first = controls[0], last = controls.at(-1);
    if (!first) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }, { ...options, capture: true });
  document.addEventListener('pointerdown', event => {
    if (!sheet || avatarDialog?.open) return;
    const bounds = sheet.editor.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeEditor();
  }, { ...options, capture: true, passive: true });
  mobile.addEventListener('change', () => { if (!mobile.matches) closeEditor(false); }, options);
  window.visualViewport?.addEventListener('resize', updateViewport, options);
  window.visualViewport?.addEventListener('scroll', updateViewport, options);
  window.addEventListener('resize', scheduleRefresh, options);
  void document.fonts?.ready.then(scheduleRefresh);
  container.addEventListener('load', scheduleRefresh, { ...options, capture: true });
  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(container, { subtree: true, childList: true, characterData: true });
  refresh();

  return () => {
    disposed = true;
    closeEditor(false);
    lifetime.abort();
    observer.disconnect();
    window.cancelAnimationFrame(frame);
    avatarDialog?.remove();
    for (const [body, button] of folds) { body.classList.remove('comment-content-folded'); button.remove(); }
    for (const [editor, button] of editorButtons) {
      button.remove();
      editor.querySelector('.comment-sheet-header')?.remove();
      delete editor.dataset.commentEditor;
    }
    container.querySelectorAll('[data-comment-identity], [data-comment-current-avatar]').forEach(element => element.remove());
  };
}
