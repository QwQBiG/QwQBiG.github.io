import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async (context) => {
  const csPosts = await getCollection('cs', ({ data }) => !data.draft);
  
  const allPosts = csPosts.filter(post => 
    !post.slug.endsWith('/_index') && !post.slug.endsWith('_index')
  );
  
  // Sort by date
  const sortedPosts = allPosts.sort((a, b) => 
    b.data.date.getTime() - a.data.date.getTime()
  ).slice(0, 20);
  
  return rss({
    title: "QwQBiG's World",
    description: '计算机科学学习笔记',
    site: context.site?.toString() || 'https://iqwqi.win',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/${post.collection}/${post.slug}/`,
    })),
    customData: `<language>zh-cn</language>`,
  });
};
