/* empty css                                    */
import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, d as addAttribute, F as Fragment } from '../../chunks/astro/server_BR9bRUNn.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$FloatingNavCard } from '../../chunks/FloatingNavCard_eNI7wgnB.mjs';
import { $ as $$Footer } from '../../chunks/Footer_CA4_PYUB.mjs';
import { $ as $$GlassContainer } from '../../chunks/GlassContainer_CPTGKO9x.mjs';
import { g as getCollection } from '../../chunks/_astro_content_BTp7kt0N.mjs';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://iqwqi.win");
async function getStaticPaths() {
  const poetryPosts = await getCollection("poetry", ({ data }) => !data.draft);
  return poetryPosts.map((post) => ({
    params: { slug: post.slug },
    props: { post }
  }));
}
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { post } = Astro2.props;
  const { Content } = await post.render();
  const pageTitle = `${post.data.title} - \u8BD7\u6B4C - QwQBiG's World`;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": pageTitle, "description": post.data.description, "data-astro-cid-kzd2yg4t": true }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "FloatingNavCard", $$FloatingNavCard, { "data-astro-cid-kzd2yg4t": true })} ${maybeRenderHead()}<main class="flex-1 py-12" data-astro-cid-kzd2yg4t> <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" data-astro-cid-kzd2yg4t> ${renderComponent($$result2, "GlassContainer", $$GlassContainer, { "data-astro-cid-kzd2yg4t": true }, { "default": async ($$result3) => renderTemplate` <article class="poetry-article" data-astro-cid-kzd2yg4t> <header class="text-center mb-12" data-astro-cid-kzd2yg4t> <h1 class="text-4xl font-serif text-text-primary mb-6 tracking-wider" data-astro-cid-kzd2yg4t> ${post.data.title} </h1> <div class="flex flex-wrap items-center justify-center gap-3 text-base text-text-muted" data-astro-cid-kzd2yg4t> <time${addAttribute(post.data.date.toISOString(), "datetime")} data-astro-cid-kzd2yg4t> ${post.data.date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })} </time> ${post.data.genre && renderTemplate`${renderComponent($$result3, "Fragment", Fragment, { "data-astro-cid-kzd2yg4t": true }, { "default": async ($$result4) => renderTemplate` <span data-astro-cid-kzd2yg4t>·</span> <span class="px-2 py-0.5 bg-primary/10 text-primary rounded-full" data-astro-cid-kzd2yg4t> ${post.data.genre} </span> ` })}`} </div> ${post.data.tags && post.data.tags.length > 0 && renderTemplate`<div class="flex flex-wrap justify-center gap-2 mt-4" data-astro-cid-kzd2yg4t> ${post.data.tags.map((tag) => renderTemplate`<span class="px-2 py-1 text-sm bg-bg-secondary text-text-secondary rounded-full" data-astro-cid-kzd2yg4t>
#${tag} </span>`)} </div>`} </header> <div class="poetry-content" data-astro-cid-kzd2yg4t> ${renderComponent($$result3, "Content", Content, { "data-astro-cid-kzd2yg4t": true })} </div> </article> ` })} </div> </main> ${renderComponent($$result2, "Footer", $$Footer, { "data-astro-cid-kzd2yg4t": true })} ` })} `;
}, "D:/Projects/MyBlog-Astro/src/pages/poetry/[...slug].astro", void 0);

const $$file = "D:/Projects/MyBlog-Astro/src/pages/poetry/[...slug].astro";
const $$url = "/poetry/[...slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
