/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BR9bRUNn.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$FloatingNavCard } from '../chunks/FloatingNavCard_eNI7wgnB.mjs';
import { $ as $$Footer } from '../chunks/Footer_CA4_PYUB.mjs';
import { $ as $$PostCard } from '../chunks/PostCard_C_HDEK-R.mjs';
import { $ as $$SeriesCard } from '../chunks/SeriesCard_KrABN47F.mjs';
import { g as getCollection } from '../chunks/_astro_content_BTp7kt0N.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const posts = await getCollection("cs", ({ data }) => !data.draft);
  const seriesEntries = posts.filter(
    (post) => post.slug.endsWith("/_index") || post.slug.endsWith("_index")
  );
  const regularPosts = posts.filter((post) => {
    if (post.slug.endsWith("/_index") || post.slug.endsWith("_index")) {
      return false;
    }
    if (post.data.categories?.includes("\u5408\u96C6")) {
      return false;
    }
    return true;
  });
  const sortedPosts = regularPosts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );
  const allSeries = seriesEntries.map((entry) => {
    const seriesName = entry.data.title;
    const seriesSlug = entry.slug.replace("/_index", "").replace("_index", "");
    const seriesPosts = regularPosts.filter(
      (post) => post.data.series?.includes(seriesName)
    );
    return {
      title: entry.data.title,
      description: entry.data.description,
      slug: seriesSlug,
      postCount: seriesPosts.length,
      pin: entry.data.pin
    };
  }).sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0));
  const standalonePosts = sortedPosts.filter(
    (post) => !post.data.series || post.data.series.length === 0
  );
  const pageTitle = "CS - \u8BA1\u7B97\u673A\u79D1\u5B66\u5B66\u4E60\u7B14\u8BB0";
  const pageDescription = "\u8BA1\u7B97\u673A\u79D1\u5B66\u76F8\u5173\u6587\u7AE0\uFF0C\u5305\u62EC\u7B97\u6CD5\u3001\u7F16\u7A0B\u8BED\u8A00\u3001\u7CFB\u7EDF\u8FD0\u7EF4\u7B49\u4E3B\u9898";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": pageTitle, "description": pageDescription }, { "default": async ($$result2) => renderTemplate`  ${renderComponent($$result2, "FloatingNavCard", $$FloatingNavCard, {})} ${maybeRenderHead()}<main class="flex-1 py-12"> <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Page Header --> <div class="text-center mb-12"> <h1 class="font-sans font-bold text-3xl md:text-4xl text-text-primary mb-4">
💻 计算机科学
</h1> <p class="font-sans text-lg text-text-secondary max-w-2xl mx-auto"> ${pageDescription} </p> </div> <!-- Series Section --> ${allSeries.length > 0 && renderTemplate`<section class="mb-16"> <h2 class="font-sans font-bold text-2xl text-text-primary mb-6 flex items-center gap-2"> <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path> </svg>
合集
</h2> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${allSeries.map((series) => renderTemplate`${renderComponent($$result2, "SeriesCard", $$SeriesCard, { "title": series.title, "description": series.description, "slug": series.slug, "postCount": series.postCount })}`)} </div> </section>`} <!-- Standalone Posts Section --> ${standalonePosts.length > 0 && renderTemplate`<section> <h2 class="font-sans font-bold text-2xl text-text-primary mb-6 flex items-center gap-2"> <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg>
独立文章
</h2> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${standalonePosts.map((post) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "post": post, "collection": "cs" })}`)} </div> </section>`} </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "D:/Projects/MyBlog-Astro/src/pages/cs/index.astro", void 0);

const $$file = "D:/Projects/MyBlog-Astro/src/pages/cs/index.astro";
const $$url = "/cs";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
