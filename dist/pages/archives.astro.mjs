/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_BR9bRUNn.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$FloatingNavCard } from '../chunks/FloatingNavCard_eNI7wgnB.mjs';
import { $ as $$Footer } from '../chunks/Footer_CA4_PYUB.mjs';
import { g as getCollection } from '../chunks/_astro_content_BTp7kt0N.mjs';
import { g as groupByYear, f as formatDate } from '../chunks/date_fZ1mQONA.mjs';
export { renderers } from '../renderers.mjs';

const $$Archives = createComponent(async ($$result, $$props, $$slots) => {
  const csPosts = await getCollection("cs", ({ data }) => !data.draft);
  const allPosts = csPosts.filter((post) => {
    if (post.slug.endsWith("/_index") || post.slug.endsWith("_index")) {
      return false;
    }
    if (post.data.categories && post.data.categories.includes("\u5408\u96C6")) {
      return false;
    }
    return true;
  });
  const sortedPosts = allPosts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );
  const postsByYear = groupByYear(sortedPosts);
  const pageTitle = "\u5F52\u6863 - QwQBiG's World";
  const pageDescription = "\u6309\u65F6\u95F4\u987A\u5E8F\u6D4F\u89C8\u6240\u6709\u6587\u7AE0";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": pageTitle, "description": pageDescription }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "FloatingNavCard", $$FloatingNavCard, {})} ${maybeRenderHead()}<main class="flex-1 py-12"> <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Page Header --> <div class="text-center mb-12"> <h1 class="font-sans font-bold text-3xl md:text-4xl text-text-primary mb-4">
📚 归档
</h1> <p class="font-sans text-lg text-text-secondary">
共 ${sortedPosts.length} 篇文章
</p> </div> <!-- Archives by Year --> <div class="space-y-12"> ${Array.from(postsByYear.entries()).map(([year, posts]) => renderTemplate`<section class="archive-year"> <h2 class="archive-year-title"> ${year} <span class="text-sm font-normal text-text-muted ml-2">(${posts.length} 篇)</span> </h2> <div class="archive-list"> ${posts.map((post) => {
    const collection = post.collection;
    const url = `/${collection}/${post.slug}/`;
    return renderTemplate`<a${addAttribute(url, "href")} class="archive-item group"> <span class="archive-date font-mono"> ${formatDate(post.data.date).slice(5)} </span> <span class="archive-title group-hover:text-primary transition-colors"> ${post.data.title} </span> ${post.data.series && post.data.series.length > 0 && renderTemplate`<span class="ml-auto text-xs text-primary bg-primary/10 px-2 py-1 rounded-full"> ${post.data.series[0]} </span>`} </a>`;
  })} </div> </section>`)} </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "D:/Projects/MyBlog-Astro/src/pages/archives.astro", void 0);

const $$file = "D:/Projects/MyBlog-Astro/src/pages/archives.astro";
const $$url = "/archives";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Archives,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
