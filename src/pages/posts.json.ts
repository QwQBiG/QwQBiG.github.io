import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { formatDate } from '../utils/date';

export const GET: APIRoute = async () => {
  const csPosts = await getCollection('cs', ({ data }) => !data.draft);
  
  const allPosts = csPosts.filter(post => 
    !post.slug.endsWith('/_index') && !post.slug.endsWith('_index')
  );
  
  const posts = allPosts.map(post => ({
    title: post.data.title,
    description: post.data.description,
    slug: post.slug,
    collection: post.collection,
    date: formatDate(post.data.date),
    tags: post.data.tags || [],
  }));
  
  return new Response(JSON.stringify(posts), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
