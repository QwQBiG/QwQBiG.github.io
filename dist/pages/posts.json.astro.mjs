import { g as getCollection } from '../chunks/_astro_content_BTp7kt0N.mjs';
import { f as formatDate } from '../chunks/date_fZ1mQONA.mjs';
export { renderers } from '../renderers.mjs';

const GET = async () => {
  const csPosts = await getCollection("cs", ({ data }) => !data.draft);
  const allPosts = csPosts.filter(
    (post) => !post.slug.endsWith("/_index") && !post.slug.endsWith("_index")
  );
  const posts = allPosts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    slug: post.slug,
    collection: post.collection,
    date: formatDate(post.data.date),
    tags: post.data.tags || []
  }));
  return new Response(JSON.stringify(posts), {
    headers: {
      "Content-Type": "application/json"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
