import { transform } from 'esbuild';

// Some mobile browsers support ES modules and dynamic imports but cannot
// parse logical assignment or class fields in the comment client.
export function mobileCommentSyntax() {
  return {
    name: 'mobile-comment-syntax',
    renderChunk: {
      order: 'post',
      async handler(code, chunk, options, { chunks }) {
        const entry = Object.values(chunks).find(item =>
          item.moduleIds.some(id => id.endsWith('/src/scripts/waline-runtime.ts')));
        if (!entry) return;
        const reachable = new Set([entry.fileName]);
        for (const file of reachable) {
          const dependency = chunks[file];
          if (!dependency) continue;
          for (const imported of [...dependency.imports, ...dependency.dynamicImports]) reachable.add(imported);
        }
        if (!reachable.has(chunk.fileName)) return;
        const result = await transform(code, {
          target: ['chrome79', 'safari13.1'], format: 'esm', minify: true,
          charset: 'utf8', legalComments: 'inline', sourcemap: Boolean(options.sourcemap),
        });
        return { code: result.code, map: result.map || null };
      },
    },
  };
}
