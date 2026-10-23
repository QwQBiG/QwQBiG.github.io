import type { APIRoute } from 'astro';
import { formatDate } from '../utils/date';
import { loadContent } from '../utils/load-content';
import { getPostTags } from '../utils/content';

export const GET: APIRoute = async () => {
  const { posts: allPosts } = await loadContent();
  
  const posts = allPosts.map(post => ({
    title: post.data.title,
    description: post.data.description,
    slug: post.slug,
    collection: post.collection,
    date: formatDate(post.data.date),
    tags: getPostTags(post),
  }));
  
  return new Response(JSON.stringify(posts), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
