import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://iqwqi.win',
  base: '/',
  output: 'static',
  integrations: [mdx(), sitemap(), tailwind({
    configFile: './tailwind.config.mjs',
  })],
  markdown: {
    // 禁用 Shiki，使用 Prism
    syntaxHighlight: 'prism',
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  build: {
    format: 'directory',
  },
  vite: {
    css: {
      postcss: './postcss.config.mjs',
    },
  },
});
