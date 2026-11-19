export function createLegacyLoader(entry, codeStyles) {
  return `(() => {
    const body = document.body;
    if (!body || body.dataset.pageCode === 'false' || !body.querySelector('pre[class*="language-"] code')) return;
    body.dataset.pageCode = 'true';
    const href = new URL(${JSON.stringify(codeStyles)}, document.baseURI).href;
    if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === href)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.append(link);
    }
    void import(${JSON.stringify(entry)});
  })();`;
}

// Point cached classic-script URLs at the same ES module used by current pages.
// Native module caching then keeps initialization single, including across Astro navigation.
export function legacyCodeEntry() {
  return {
    name: 'legacy-code-entry',
    hooks: {
      'astro:build:setup': ({ target, updateConfig }) => {
        if (target !== 'client') return;
        updateConfig({
          plugins: [{
            name: 'legacy-code-entry',
            generateBundle(_options, bundle) {
              const entry = Object.values(bundle).find(chunk => chunk.type === 'chunk' &&
                chunk.facadeModuleId?.split('?')[0].endsWith('/components/content/CodeBlockScripts.astro'));
              if (!entry) this.error('Cannot locate the article code entry for cached pages.');
              this.emitFile({
                type: 'asset',
                fileName: 'js/article-code-entry.js',
                source: `import ${JSON.stringify('../' + entry.fileName)};\n`,
              });
            },
          }],
        });
      },
    },
  };
}
