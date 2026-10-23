import { parseFragment } from 'parse5';
import type { DefaultTreeAdapterTypes } from 'parse5';

/** Inspect rendered content without changing its HTML or hydratable islands. */
export function getPageFeatures(content: string) {
  let hasCode = false;
  let hasMath = false;

  function visit(node: DefaultTreeAdapterTypes.Node): void {
    if (hasCode && hasMath) return;
    if ('tagName' in node) {
      // These elements contain examples or inactive markup rather than page content.
      if (['script', 'style', 'template', 'noscript'].includes(node.tagName)) return;
      if (node.namespaceURI === 'http://www.w3.org/1999/xhtml') {
        if (node.tagName === 'pre') hasCode = true;
        const classes = node.attrs.find(({ name }) => name === 'class')?.value.split(/[\t\n\f\r ]+/) || [];
        if (classes.includes('katex') || classes.includes('katex-display')) hasMath = true;
      }
    }
    if ('childNodes' in node) node.childNodes.forEach(visit);
  }

  visit(parseFragment(content));
  return { hasCode, hasMath };
}
