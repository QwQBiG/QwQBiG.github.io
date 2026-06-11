import rss from '@astrojs/rss';
import { g as getCollection } from '../chunks/_astro_content_BTp7kt0N.mjs';
export { renderers } from '../renderers.mjs';

const GET = async (context) => {
  const csPosts = await getCollection("cs", ({ data }) => !data.draft);
  const allPosts = csPosts.filter(
    (post) => !post.slug.endsWith("/_index") && !post.slug.endsWith("_index")
  );
  const sortedPosts = allPosts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  ).slice(0, 20);
  return rss({
    title: "QwQBiG's World",
    description: "计算机科学学习笔记",
    site: context.site?.toString() || "https://iqwqi.win",
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/${post.collection}/${post.slug}/`
    })),
    customData: `<language>zh-cn</language>`
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
