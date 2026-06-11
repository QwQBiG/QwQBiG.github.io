/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BR9bRUNn.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$FloatingNavCard } from '../chunks/FloatingNavCard_eNI7wgnB.mjs';
import { $ as $$Footer } from '../chunks/Footer_CA4_PYUB.mjs';
export { renderers } from '../renderers.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  const pageTitle = "404 - \u9875\u9762\u672A\u627E\u5230";
  const pageDescription = "\u62B1\u6B49\uFF0C\u60A8\u8BBF\u95EE\u7684\u9875\u9762\u4E0D\u5B58\u5728";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": pageTitle, "description": pageDescription }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "FloatingNavCard", $$FloatingNavCard, {})} ${maybeRenderHead()}<main class="flex-1 flex items-center justify-center py-24"> <div class="text-center px-4"> <div class="text-8xl font-bold text-primary/20 mb-4">404</div> <h1 class="font-sans font-bold text-3xl text-text-primary mb-4">
页面未找到
</h1> <p class="font-sans text-lg text-text-secondary mb-8 max-w-md mx-auto">
抱歉，您访问的页面不存在或已被移除。
</p> <div class="flex flex-wrap justify-center gap-4"> <a href="/" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path> </svg>
返回首页
</a> <a href="/archives/" class="inline-flex items-center gap-2 px-6 py-3 bg-bg-secondary text-text-primary border border-border-color rounded-full font-medium hover:border-primary/30 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path> </svg>
浏览归档
</a> </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "D:/Projects/MyBlog-Astro/src/pages/404.astro", void 0);

const $$file = "D:/Projects/MyBlog-Astro/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
