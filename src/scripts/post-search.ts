interface SearchPost {
  title: string;
  description?: string;
  slug: string;
  collection: 'cs' | 'poetry';
  date: string;
  tags?: string[];
}

const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, char => entities[char]);
}

function highlight(text: string, pattern: RegExp) {
  return text.split(pattern).map((part, index) =>
    index % 2 ? `<mark class="bg-primary/20 text-primary px-1 rounded">${escapeHtml(part)}</mark>` : escapeHtml(part)
  ).join('');
}

function resultCard(post: SearchPost, pattern: RegExp) {
  return `<a href="/${escapeHtml(post.collection)}/${escapeHtml(post.slug)}/" class="search-result-item block">
    <h3 class="search-result-title">${highlight(post.title, pattern)}</h3>
    ${post.description ? `<p class="search-result-excerpt">${highlight(post.description, pattern)}</p>` : ''}
    <div class="search-result-meta">
      <span>${escapeHtml(post.date)}</span>
      ${post.tags?.length ? `<span>${escapeHtml(post.tags.slice(0, 3).join(', '))}</span>` : ''}
    </div>
  </a>`;
}

function message(text: string) {
  return `<div class="text-center text-text-muted py-12">${text}</div>`;
}

export function initializePostSearch(input: HTMLInputElement, results: HTMLElement) {
  let posts: SearchPost[] = [];
  let state: 'loading' | 'ready' | 'failed' = 'loading';
  let composing = false;
  let frame: number | undefined;

  function render() {
    const query = input.value;
    if (!query.trim()) {
      results.innerHTML = message('输入关键词开始搜索');
    } else if (state === 'loading') {
      results.innerHTML = message('正在加载文章…');
    } else if (state === 'failed') {
      results.innerHTML = message('文章列表加载失败。<button type="button" class="underline">重试</button>');
      results.querySelector('button')?.addEventListener('click', loadPosts, { once: true });
    } else {
      const lowerQuery = query.toLowerCase();
      const matches = posts.filter(post =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.description?.toLowerCase().includes(lowerQuery) ||
        post.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
      const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      results.innerHTML = matches.length
        ? matches.map(post => resultCard(post, pattern)).join('')
        : message('没有找到相关文章');
    }
  }

  function scheduleRender() {
    if (composing || frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      if (!composing) render();
    });
  }

  async function loadPosts() {
    state = 'loading';
    scheduleRender();
    try {
      const response = await fetch('/posts.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const index = await response.json();
      if (!Array.isArray(index)) throw new Error('Invalid article index');
      posts = index;
      state = 'ready';
    } catch {
      state = 'failed';
    }
    scheduleRender();
  }

  input.addEventListener('compositionstart', () => { composing = true; });
  input.addEventListener('compositionend', () => {
    composing = false;
    scheduleRender();
  });
  input.addEventListener('input', event => {
    if (!(event as InputEvent).isComposing) scheduleRender();
  });

  void loadPosts();
}
