/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BR9bRUNn.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$FloatingNavCard } from '../chunks/FloatingNavCard_eNI7wgnB.mjs';
import { $ as $$Footer } from '../chunks/Footer_CA4_PYUB.mjs';
import { $ as $$SeriesCard } from '../chunks/SeriesCard_KrABN47F.mjs';
import { g as getCollection } from '../chunks/_astro_content_BTp7kt0N.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const csPosts = await getCollection("cs", ({ data }) => !data.draft);
  const seriesEntries = csPosts.filter((post) => {
    const slashCount = (post.slug.match(/\//g) || []).length;
    return slashCount === 1 && post.id.includes("index.md");
  });
  const regularPosts = csPosts.filter((post) => {
    const slashCount = (post.slug.match(/\//g) || []).length;
    return slashCount >= 2;
  });
  const allSeries = seriesEntries.map((entry) => {
    const seriesName = entry.data.title;
    const seriesSlug = entry.slug;
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
  const pageTitle = "\u5408\u96C6 - QwQBiG's World";
  const pageDescription = "\u6309\u5408\u96C6\u6D4F\u89C8\u6587\u7AE0";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": pageTitle, "description": pageDescription }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "FloatingNavCard", $$FloatingNavCard, {})} ${maybeRenderHead()}<main class="flex-1 py-12"> <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Page Header --> <div class="text-center mb-12"> <h1 class="font-sans font-bold text-3xl md:text-4xl text-text-primary mb-4">
📚 合集
</h1> <p class="font-sans text-lg text-text-secondary">
共 ${allSeries.length} 个合集
</p> </div> <!-- Series Grid --> ${allSeries.length > 0 ? renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${allSeries.map((series) => renderTemplate`${renderComponent($$result2, "SeriesCard", $$SeriesCard, { "title": series.title, "description": series.description, "slug": series.slug, "postCount": series.postCount })}`)} </div>` : renderTemplate`<div class="text-center py-16"> <p class="text-text-secondary">暂无合集</p> </div>`} </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "D:/Projects/MyBlog-Astro/src/pages/series/index.astro", void 0);

const $$file = "D:/Projects/MyBlog-Astro/src/pages/series/index.astro";
const $$url = "/series";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
