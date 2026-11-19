import { parseFragment, type DefaultTreeAdapterTypes } from 'parse5';

type Element = DefaultTreeAdapterTypes.Element;
type Node = DefaultTreeAdapterTypes.Node;

function className(element: Element) {
  return element.attrs.find(attr => attr.name === 'class')?.value ?? '';
}

// Custom markup may own its own controls or layout. Only mark static Prism tokens.
function measureTokens(element: Element, lines: { breaks: number; open: boolean }): boolean {
  for (const child of element.childNodes) {
    if ('value' in child) {
      lines.breaks += child.value.match(/\n/g)?.length ?? 0;
      if (child.value) lines.open = !child.value.endsWith('\n');
    } else {
      if (!('tagName' in child) || child.tagName !== 'span' || child.attrs.length !== 1 ||
          !className(child).split(/\s+/).includes('token') || !measureTokens(child, lines)) return false;
    }
  }
  return true;
}

export function markArticleCodeBlocks(html: string): string {
  if (!/<pre[\s>]/i.test(html)) return html;
  const insertions: { at: number; html: string }[] = [];

  function mark(pre: Element) {
    const classes = className(pre);
    if (!/(?:^|\s)language-\S+/.test(classes) || classes.includes('mermaid') ||
        pre.childNodes.length !== 1) return;
    const code = pre.childNodes[0];
    if (!('tagName' in code) || code.tagName !== 'code' || className(code).includes('mermaid') ||
        code.attrs.some(attr => !['class', 'is:raw'].includes(attr.name)) ||
        pre.attrs.some(attr => !['class', 'data-language'].includes(attr.name))) return;

    const loc = code.sourceCodeLocation;
    if (!loc?.startTag || !loc.endTag) return;
    const lines = { breaks: 0, open: false };
    if (!measureTokens(code, lines)) return;
    // A final newline terminates the preceding visible row, but contributes
    // an extra empty segment to the existing fold-button threshold.
    const visibleLines = lines.breaks + Number(lines.open);
    const spacer = visibleLines ? ` data-code-spacer="${'&#10;'.repeat(visibleLines)}"` : '';
    insertions.push(
      { at: loc.startTag.startOffset, html: `<div class="code-content"${spacer}>` },
      { at: loc.startTag.endOffset - 1, html: ` data-code-lines="${lines.breaks + 1}"` },
      { at: loc.endTag.endOffset, html: '</div>' },
    );
  }

  function visit(node: Node) {
    if ('tagName' in node) {
      if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml' || node.tagName.includes('-') ||
          ['script', 'style', 'template', 'noscript'].includes(node.tagName)) return;
      if (node.tagName === 'pre') {
        mark(node);
        return;
      }
    }
    if ('childNodes' in node) node.childNodes.forEach(visit);
  }
  visit(parseFragment(html, { sourceCodeLocationInfo: true }));
  if (!insertions.length) return html;
  // Insert at source offsets to keep the original Prism markup and entities byte for byte.
  insertions.sort((a, b) => a.at - b.at);
  const pieces: string[] = [];
  let cursor = 0;
  for (const insertion of insertions) {
    pieces.push(html.slice(cursor, insertion.at), insertion.html);
    cursor = insertion.at;
  }
  return pieces.join('') + html.slice(cursor);
}
