/* empty css                                    */
import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_BR9bRUNn.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$FloatingNavCard } from '../../chunks/FloatingNavCard_eNI7wgnB.mjs';
import { $ as $$Footer } from '../../chunks/Footer_CA4_PYUB.mjs';
import { $ as $$PostCard } from '../../chunks/PostCard_C_HDEK-R.mjs';
import { g as getCollection } from '../../chunks/_astro_content_BTp7kt0N.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://iqwqi.win");
async function getStaticPaths() {
  const csPosts = await getCollection("cs");
  const allTags = /* @__PURE__ */ new Set();
  csPosts.forEach((post) => {
    post.data.tags?.forEach((tag) => allTags.add(tag));
  });
  return Array.from(allTags).map((tag) => ({
    params: { tag },
    props: { tag }
  }));
}
const $$tag = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$tag;
  const { tag } = Astro2.props;
  const csPosts = await getCollection(
    "cs",
    ({ data }) => !data.draft && data.tags?.includes(tag)
  );
  const allPosts = csPosts.filter(
    (post) => !post.slug.endsWith("/_index") && !post.slug.endsWith("_index")
  );
  const sortedPosts = allPosts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );
  const pageTitle = `\u6807\u7B7E: ${tag} - QwQBiG's World`;
  const pageDescription = `\u5305\u542B\u6807\u7B7E "${tag}" \u7684\u6240\u6709\u6587\u7AE0`;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": pageTitle, "description": pageDescription }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "FloatingNavCard", $$FloatingNavCard, {})} ${maybeRenderHead()}<main class="flex-1 py-12"> <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Page Header --> <div class="text-center mb-12"> <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path> </svg>
标签
</div> <h1 class="font-sans font-bold text-3xl md:text-4xl text-text-primary mb-4">
#${tag} </h1> <p class="font-sans text-lg text-text-secondary">
共 ${sortedPosts.length} 篇文章
</p> </div> <!-- Posts Grid --> ${sortedPosts.length > 0 ? renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${sortedPosts.map((post) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "post": post, "collection": post.collection })}`)} </div>` : renderTemplate`<div class="text-center py-16"> <p class="text-text-secondary">暂无文章</p> </div>`} <!-- Back to Tags --> <div class="text-center mt-12"> <a href="/tags/" class="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium"> <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path> </svg>
返回标签列表
</a> </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "D:/Projects/MyBlog-Astro/src/pages/tags/[tag].astro", void 0);

const $$file = "D:/Projects/MyBlog-Astro/src/pages/tags/[tag].astro";
const $$url = "/tags/[tag]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$tag,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
