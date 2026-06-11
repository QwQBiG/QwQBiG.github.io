/* empty css                                    */
import { b as createAstro, c as createComponent, r as renderComponent, e as renderScript, a as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../../chunks/astro/server_BR9bRUNn.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$FloatingNavCard } from '../../chunks/FloatingNavCard_eNI7wgnB.mjs';
import { $ as $$Footer } from '../../chunks/Footer_CA4_PYUB.mjs';
import { $ as $$GlassContainer } from '../../chunks/GlassContainer_CPTGKO9x.mjs';
import { r as renderEntry, g as getCollection } from '../../chunks/_astro_content_BTp7kt0N.mjs';
import { f as formatDate } from '../../chunks/date_fZ1mQONA.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://iqwqi.win");
async function getStaticPaths() {
  const posts = await getCollection("cs");
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post }
  }));
}
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { post } = Astro2.props;
  const { Content, headings } = await renderEntry(post);
  const { title, description, date, tags, series, draft, categories } = post.data;
  const allPosts = await getCollection("cs", ({ data }) => !data.draft);
  const currentSlug = post.slug;
  const isSeriesCollection = categories?.includes("\u5408\u96C6");
  let collectionPosts = [];
  if (isSeriesCollection) {
    collectionPosts = allPosts.filter(
      (p) => p.data.series?.includes(title) && !p.slug.endsWith("_index") && p.slug !== currentSlug
    ).sort((a, b) => (a.data.weight || 0) - (b.data.weight || 0) || a.data.date.getTime() - b.data.date.getTime());
  }
  let seriesPosts = [];
  if (series && series.length > 0) {
    seriesPosts = allPosts.filter(
      (p) => p.data.series?.some((s) => series.includes(s)) && p.slug !== currentSlug && !p.slug.endsWith("_index")
    ).sort((a, b) => (a.data.weight || 0) - (b.data.weight || 0) || a.data.date.getTime() - b.data.date.getTime());
  }
  const currentIndex = seriesPosts.findIndex((p) => p.slug === currentSlug);
  const prevPost = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : null;
  const pageTitle = `${title} - QwQBiG's World`;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": pageTitle, "description": description, "type": "article", "noIndex": draft }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "FloatingNavCard", $$FloatingNavCard, {})} ${maybeRenderHead()}<main class="flex-1 py-12"> <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="grid grid-cols-1 lg:grid-cols-12 gap-8"> <!-- Main Content --> <article class="lg:col-span-9"> ${renderComponent($$result2, "GlassContainer", $$GlassContainer, {}, { "default": async ($$result3) => renderTemplate`  <header class="mb-8"> ${series && series.length > 0 && !isSeriesCollection && renderTemplate`<div class="flex flex-wrap gap-2 mb-4"> ${series.map((s) => renderTemplate`<a${addAttribute(`/cs/series/${s.toLowerCase().replace(/\s+/g, "-")}/`, "href")} class="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path> </svg> ${s} </a>`)} </div>`} <h1 class="font-sans font-bold text-3xl md:text-4xl text-text-primary mb-4 leading-tight"> ${title} </h1> <div class="flex flex-wrap items-center gap-4 text-sm text-text-secondary"> <span class="flex items-center gap-1.5"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> ${formatDate(date)} </span> ${tags && tags.length > 0 && renderTemplate`<div class="flex flex-wrap gap-2"> ${tags.map((tag) => renderTemplate`<a${addAttribute(`/tags/${tag}/`, "href")} class="text-primary hover:text-primary-dark transition-colors">
#${tag} </a>`)} </div>`} </div> </header>  <div class="prose prose-lg max-w-none"> ${renderComponent($$result3, "Content", Content, {})} </div>  ${isSeriesCollection && collectionPosts.length > 0 && renderTemplate`<div class="mt-12 pt-8 border-t border-border-color"> <h2 class="text-2xl font-bold text-text-primary mb-6">合集文章</h2> <div class="space-y-4"> ${collectionPosts.map((collectionPost, index) => renderTemplate`<a${addAttribute(`/cs/${collectionPost.slug}/`, "href")} class="group flex items-center gap-4 p-4 bg-bg-secondary rounded-xl border border-border-color hover:border-primary/30 transition-all"> <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm"> ${collectionPost.data.weight > 0 ? collectionPost.data.weight : index + 1} </span> <div class="flex-1 min-w-0"> <h3 class="font-medium text-text-primary group-hover:text-primary transition-colors line-clamp-1"> ${collectionPost.data.title} </h3> ${collectionPost.data.description && renderTemplate`<p class="text-sm text-text-secondary line-clamp-1 mt-1"> ${collectionPost.data.description} </p>`} </div> <svg class="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </a>`)} </div> </div>`} ${(prevPost || nextPost) && !isSeriesCollection && renderTemplate`<nav class="mt-12 pt-8 border-t border-border-color"> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> ${prevPost ? renderTemplate`<a${addAttribute(`/cs/${prevPost.slug}/`, "href")} class="group p-4 bg-bg-secondary rounded-xl border border-border-color hover:border-primary/30 transition-all"> <span class="text-xs text-text-muted uppercase tracking-wide">上一篇</span> <div class="font-medium text-text-primary group-hover:text-primary transition-colors line-clamp-2 mt-1"> ${prevPost.data.title} </div> </a>` : renderTemplate`<div></div>`} ${nextPost ? renderTemplate`<a${addAttribute(`/cs/${nextPost.slug}/`, "href")} class="group p-4 bg-bg-secondary rounded-xl border border-border-color hover:border-primary/30 transition-all text-right md:text-left md:ml-auto"> <span class="text-xs text-text-muted uppercase tracking-wide">下一篇</span> <div class="font-medium text-text-primary group-hover:text-primary transition-colors line-clamp-2 mt-1"> ${nextPost.data.title} </div> </a>` : renderTemplate`<div></div>`} </div> </nav>`}` })} </article> <!-- Sidebar --> <aside class="lg:col-span-3"> <div class="sticky top-24 space-y-6"> <!-- TOC --> ${headings.length > 0 && renderTemplate`<div class="toc"> <div class="toc-title">目录</div> <ul> ${headings.filter((h) => h.depth <= 3).map((heading) => renderTemplate`<li> <a${addAttribute(`#${heading.slug}`, "href")}${addAttribute(`h${heading.depth}`, "class")}> ${heading.text} </a> </li>`)} </ul> </div>`} <!-- Series Navigation --> ${seriesPosts.length > 0 && !isSeriesCollection && renderTemplate`<div class="toc"> <div class="toc-title">系列文章</div> <ul> ${seriesPosts.map((seriesPost) => renderTemplate`<li> <a${addAttribute(`/cs/${seriesPost.slug}/`, "href")}${addAttribute([
    "block py-1 text-sm transition-colors",
    seriesPost.slug === currentSlug ? "text-primary font-medium" : "text-text-secondary hover:text-primary"
  ], "class:list")}> ${seriesPost.data.weight > 0 && `${seriesPost.data.weight}. `} ${seriesPost.data.title} </a> </li>`)} </ul> </div>`} </div> </aside> </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })} ${renderScript($$result, "D:/Projects/MyBlog-Astro/src/pages/cs/[...slug].astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/Projects/MyBlog-Astro/src/pages/cs/[...slug].astro", void 0);

const $$file = "D:/Projects/MyBlog-Astro/src/pages/cs/[...slug].astro";
const $$url = "/cs/[...slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
