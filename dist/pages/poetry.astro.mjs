/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_BR9bRUNn.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$FloatingNavCard } from '../chunks/FloatingNavCard_eNI7wgnB.mjs';
import { $ as $$Footer } from '../chunks/Footer_CA4_PYUB.mjs';
import { g as getCollection } from '../chunks/_astro_content_BTp7kt0N.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const poetryPosts = await getCollection("poetry", ({ data }) => !data.draft);
  const sortedPosts = poetryPosts.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
  const allGenres = [...new Set(poetryPosts.map((p) => p.data.genre))];
  const allMoods = [...new Set(poetryPosts.flatMap((p) => p.data.mood))];
  const pageTitle = "\u8BD7\u6B4C - QwQBiG's World";
  const pageDescription = "\u6211\u7684\u8BD7\u6B4C\u521B\u4F5C\u7A7A\u95F4";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": pageTitle, "description": pageDescription }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "FloatingNavCard", $$FloatingNavCard, {})} ${maybeRenderHead()}<main class="flex-1 py-12"> <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Page Header --> <div class="text-center mb-12"> <h1 class="font-sans font-bold text-3xl md:text-4xl text-text-primary mb-4">
📝 诗歌
</h1> <p class="font-sans text-lg text-text-secondary">
共 ${sortedPosts.length} 首诗歌
</p> </div> <!-- Filters --> ${(allGenres.length > 0 || allMoods.length > 0) && renderTemplate`<div class="mb-8 flex flex-wrap gap-4 justify-center"> ${allGenres.length > 0 && renderTemplate`<div class="flex flex-wrap gap-2 items-center"> <span class="text-sm text-text-secondary">体裁：</span> ${allGenres.map((genre) => renderTemplate`<span class="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"> ${genre} </span>`)} </div>`} ${allMoods.length > 0 && renderTemplate`<div class="flex flex-wrap gap-2 items-center"> <span class="text-sm text-text-secondary">主题：</span> ${allMoods.map((mood) => renderTemplate`<span class="px-3 py-1 text-sm bg-secondary/10 text-secondary rounded-full"> ${mood} </span>`)} </div>`} </div>`} <!-- Poetry Grid --> ${sortedPosts.length > 0 ? renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${sortedPosts.map((post) => renderTemplate`<a${addAttribute(`/poetry/${post.slug}/`, "href")} class="group block p-6 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"> <div class="flex items-start justify-between mb-3"> <h2 class="font-sans font-bold text-xl text-text-primary group-hover:text-primary transition-colors line-clamp-2"> ${post.data.title} </h2> ${post.data.genre && renderTemplate`<span class="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"> ${post.data.genre} </span>`} </div> ${post.data.description && renderTemplate`<p class="text-text-secondary text-sm mb-4 line-clamp-2"> ${post.data.description} </p>`} <div class="flex items-center justify-between text-xs text-text-muted"> <time${addAttribute(post.data.date.toISOString(), "datetime")}> ${post.data.date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })} </time> ${post.data.mood && post.data.mood.length > 0 && renderTemplate`<div class="flex gap-1"> ${post.data.mood.slice(0, 2).map((m) => renderTemplate`<span class="px-1.5 py-0.5 bg-secondary/10 text-secondary rounded"> ${m} </span>`)} </div>`} </div> </a>`)} </div>` : renderTemplate`<div class="text-center py-16"> <p class="text-text-secondary mb-4">暂无诗歌</p> <p class="text-text-muted text-sm">
在 <code>src/content/poetry/posts/</code> 目录下创建 Markdown 文件来添加诗歌
</p> </div>`} </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "D:/Projects/MyBlog-Astro/src/pages/poetry/index.astro", void 0);

const $$file = "D:/Projects/MyBlog-Astro/src/pages/poetry/index.astro";
const $$url = "/poetry";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
