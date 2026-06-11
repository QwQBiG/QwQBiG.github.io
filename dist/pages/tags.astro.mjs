/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_BR9bRUNn.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$FloatingNavCard } from '../chunks/FloatingNavCard_eNI7wgnB.mjs';
import { $ as $$Footer } from '../chunks/Footer_CA4_PYUB.mjs';
import { g as getCollection } from '../chunks/_astro_content_BTp7kt0N.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const csPosts = await getCollection("cs", ({ data }) => !data.draft);
  const allPosts = csPosts.filter(
    (post) => !post.slug.endsWith("/_index") && !post.slug.endsWith("_index")
  );
  const tagCounts = /* @__PURE__ */ new Map();
  allPosts.forEach((post) => {
    post.data.tags?.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  const sortedTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]);
  const pageTitle = "\u6807\u7B7E - QwQBiG's World";
  const pageDescription = "\u6309\u6807\u7B7E\u6D4F\u89C8\u6587\u7AE0";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": pageTitle, "description": pageDescription }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "FloatingNavCard", $$FloatingNavCard, {})} ${maybeRenderHead()}<main class="flex-1 py-12"> <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Page Header --> <div class="text-center mb-12"> <h1 class="font-sans font-bold text-3xl md:text-4xl text-text-primary mb-4">
🏷️ 标签
</h1> <p class="font-sans text-lg text-text-secondary">
共 ${sortedTags.length} 个标签
</p> </div> <!-- Tag Cloud --> <div class="tag-cloud"> ${sortedTags.map(([tag, count]) => renderTemplate`<a${addAttribute(`/tags/${tag}/`, "href")} class="tag-cloud-item"${addAttribute(`font-size: ${Math.max(0.875, Math.min(1.5, 0.875 + count * 0.05))}rem;`, "style")}> ${tag} <span class="tag-cloud-count">${count}</span> </a>`)} </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "D:/Projects/MyBlog-Astro/src/pages/tags/index.astro", void 0);

const $$file = "D:/Projects/MyBlog-Astro/src/pages/tags/index.astro";
const $$url = "/tags";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
