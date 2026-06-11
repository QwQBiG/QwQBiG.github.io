/* empty css                                 */
import { c as createComponent, r as renderComponent, e as renderScript, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BR9bRUNn.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$FloatingNavCard } from '../chunks/FloatingNavCard_eNI7wgnB.mjs';
import { $ as $$Footer } from '../chunks/Footer_CA4_PYUB.mjs';
export { renderers } from '../renderers.mjs';

const $$Search = createComponent(async ($$result, $$props, $$slots) => {
  const pageTitle = "\u641C\u7D22 - QwQBiG's World";
  const pageDescription = "\u641C\u7D22\u535A\u5BA2\u6587\u7AE0";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": pageTitle, "description": pageDescription }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "FloatingNavCard", $$FloatingNavCard, {})} ${maybeRenderHead()}<main class="flex-1 py-12"> <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Page Header --> <div class="text-center mb-12"> <h1 class="font-sans font-bold text-3xl md:text-4xl text-text-primary mb-4">
🔍 搜索
</h1> <p class="font-sans text-lg text-text-secondary">
输入关键词搜索文章
</p> </div> <!-- Search Input --> <div class="search-input-wrapper"> <svg class="search-input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> <input type="text" id="search-input" class="search-input" placeholder="输入关键词..." autocomplete="off"> </div> <!-- Search Results --> <div id="search-results" class="search-results"> <div class="text-center text-text-muted py-12">
输入关键词开始搜索
</div> </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })} ${renderScript($$result, "D:/Projects/MyBlog-Astro/src/pages/search.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/Projects/MyBlog-Astro/src/pages/search.astro", void 0);

const $$file = "D:/Projects/MyBlog-Astro/src/pages/search.astro";
const $$url = "/search";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Search,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
