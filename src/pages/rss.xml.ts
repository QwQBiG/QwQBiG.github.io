import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { loadContent } from '../utils/load-content';
import { getPostUrl } from '../utils/content';

export const GET: APIRoute = async (context) => {
  const { posts } = await loadContent();
  const sortedPosts = posts.slice(0, 20);
  
  return rss({
    title: "QwQBiG's World",
    description: '计算机学习笔记、诗词与随笔',
    site: context.site?.toString() || 'https://iqwqi.win',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: getPostUrl(post),
    })),
    customData: `<language>zh-cn</language>`,
  });
};
