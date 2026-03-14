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

const seriesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pin: z.boolean().default(false),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    cover: z.object({
      image: z.string().optional(),
      alt: z.string().optional(),
      caption: z.string().optional(),
    }).optional(),
  }),
});

export const collections = {
  cs: postsCollection,
};
