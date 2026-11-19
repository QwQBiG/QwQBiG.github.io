import type { APIRoute } from 'astro';
import { createLegacyLoader } from '../../../scripts/legacy-code-entry.mjs';
import codeStyles from '../../styles/code-blocks.css?url';

// Old HTML loads these five URLs as classic scripts, in some cases from separate caches.
export function getStaticPaths() {
  return ['prism-code-blocks', 'prism-rainbow-brackets', 'prism-enhance', 'prism-code-interactions', 'prism-xml-fix']
    .map(enhancement => ({ params: { enhancement } }));
}

export const GET: APIRoute = () => {
  const entry = import.meta.env.DEV ? '/src/scripts/prism/prism-code-interactions.js' : '/js/article-code-entry.js';
  return new Response(createLegacyLoader(entry, codeStyles), { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
};
