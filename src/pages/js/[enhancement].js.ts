import { basename } from 'node:path';
import type { APIRoute } from 'astro';

// Keep the standalone URLs usable by articles cached before these scripts were bundled.
export function getStaticPaths() {
  const scripts = import.meta.glob<string>('../../scripts/prism/*.js', {
    query: '?raw', import: 'default', eager: true,
  });
  return Object.entries(scripts).map(([file, source]) => ({
    params: { enhancement: basename(file, '.js') },
    props: { source },
  }));
}

export const GET: APIRoute = ({ props }) =>
  new Response(props.source, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
