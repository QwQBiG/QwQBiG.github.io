import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://iqwqi.win',
  base: '/',
  output: 'static',
  prefetch: true,
  integrations: [{
    name: 'separate-dev-build-cache',
    hooks: {
      // Build-time content sync also starts Vite, so use Astro's command here.
      'astro:config:setup': ({ command, updateConfig }) => {
        updateConfig({ vite: { cacheDir: `node_modules/.vite/${command}` } });
      },
    },
  }, mdx(), sitemap(), tailwind({
    configFile: './tailwind.config.mjs',
  }), react()],
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
