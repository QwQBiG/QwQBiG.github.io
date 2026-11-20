import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { legacyCodeEntry } from './scripts/legacy-code-entry.mjs';
import { mobileCommentSyntax } from './scripts/waline-compat.mjs';

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
  }, legacyCodeEntry(), mdx(), sitemap(), tailwind({
    configFile: './tailwind.config.mjs',
    applyBaseStyles: false,
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
    resolve: {
      // Bound list reads in both Vite dev and production. The adapter forwards
      // all other operations to the original package.
      alias: [{
        find: /^@waline\/api$/,
        replacement: '@waline/api',
        customResolver(source, importer, options) {
          if (importer?.includes('/@waline/client/')) {
            return fileURLToPath(new URL('./src/scripts/waline-api.ts', import.meta.url));
          }
          return this.resolve(source, importer, { ...options, skipSelf: true });
        },
      }],
    },
    build: {
      rollupOptions: {
        output: {
          plugins: [mobileCommentSyntax()],
          // Every page starts Astro's prefetcher. Its bootstrap, implementation and
          // shared adapter headers fit in one cacheable module across all routes.
          manualChunks(id) {
            if (id === 'astro:scripts/page.js') return 'page-navigation';
          },
        },
      },
      // Let the browser fetch only the font subsets used on the current page.
      assetsInlineLimit(filePath) {
        if (filePath.includes('/@fontsource/jetbrains-mono/') && /\.woff2?$/.test(filePath)) return false;
      },
    },
    css: {
      postcss: './postcss.config.mjs',
    },
  },
});
