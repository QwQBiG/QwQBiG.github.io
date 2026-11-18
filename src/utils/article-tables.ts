import { parseFragment } from 'parse5';
import type { DefaultTreeAdapterTypes } from 'parse5';

const scrollWrapper = '<div class="article-table-scroll" tabindex="0" role="group" aria-label="表格">';

/** Give wide tables their own scroll area without rewriting the surrounding article or its islands. */
export function wrapArticleTables(html: string): string {
  if (!/<table[\s>]/i.test(html)) return html;
  const tables: Array<{ startOffset: number; endOffset: number }> = [];

  function visit(node: DefaultTreeAdapterTypes.Node): void {
    if ('tagName' in node) {
      if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml' ||
          ['script', 'style', 'template', 'noscript'].includes(node.tagName)) return;

      const className = node.attrs.find(attr => attr.name === 'class')?.value ?? '';
      const style = node.attrs.find(attr => attr.name === 'style')?.value ?? '';
      if (/(?:^|\s)(?:article-table-scroll|overflow-(?:x-)?(?:auto|scroll))(?:\s|$)/.test(className) ||
          /(?:^|;)\s*overflow(?:-x)?\s*:\s*(?:auto|scroll)\b/i.test(style)) return;

      if (node.tagName === 'table') {
        if (node.sourceCodeLocation) tables.push(node.sourceCodeLocation);
        return;
      }
    }
    if ('childNodes' in node) node.childNodes.forEach(visit);
  }
  visit(parseFragment(html, { sourceCodeLocationInfo: true }));

  const parts: string[] = [];
  let cursor = 0;
  for (const { startOffset, endOffset } of tables) {
    parts.push(html.slice(cursor, startOffset), scrollWrapper, html.slice(startOffset, endOffset), '</div>');
    cursor = endOffset;
  }
  return parts.join('') + html.slice(cursor);
}
