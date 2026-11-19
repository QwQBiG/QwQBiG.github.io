/** Retain the theme's punctuation and tag-name colors for plain XML tags. */
export function fixXMLHighlighting(code) {
  if (!code.matches('code.language-xml, code.language-markup')) return;
  for (const tag of code.querySelectorAll('.token.tag')) {
    if (tag.dataset.xmlFixed) continue;
    const match = /^(<\/?)([\w-]+)(\/?>)$/.exec(tag.textContent);
    if (!match) continue;

    const parts = match.slice(1).map((text, index) => {
      const span = document.createElement('span');
      span.className = index === 1 ? 'token tag-name' : 'token punctuation';
      span.textContent = text;
      return span;
    });
    tag.replaceChildren(...parts);
    tag.dataset.xmlFixed = 'true';
  }
}
