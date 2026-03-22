import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    series: z.array(z.string()).optional(),
    weight: z.number().default(0),
    draft: z.boolean().default(false),
    hidden: z.boolean().default(false),
    pin: z.boolean().default(false),
    cover: z.object({
      image: z.string().optional(),
      alt: z.string().optional(),
      caption: z.string().optional(),
      hidden: z.boolean().default(false),
    }).optional(),
  }),
});

// 诗歌内容集合
const poetryCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    // 诗歌类型/体裁
    genre: z.enum(['古诗', '现代诗', '散文诗', '词', '辞', '赋', '歌', '行', '序', '古文', '英文诗', '其他']).default('其他'),
    // 情感/主题
    mood: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    hidden: z.boolean().default(false),
    pin: z.boolean().default(false),
  }),
});

export const collections = {
  cs: postsCollection,
  poetry: poetryCollection,
};
