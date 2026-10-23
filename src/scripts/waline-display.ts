import { replaceEmoji } from '../utils/emoji';

const editableOrScript = 'script, style, textarea, input, select, [contenteditable]:not([contenteditable="false"])';
const textAttributes = ['title', 'alt', 'aria-label', 'aria-description'];

// Keep the server's comment data intact and touch only the rendered text, so Vue owns its DOM.
export function keepCommentDisplayEmojiFree(container: HTMLElement): () => void {
  const formatText = (node: Text) => {
    if (node.parentElement?.closest(editableOrScript)) return;
    const display = replaceEmoji(node.data);
    if (display !== node.data) node.data = display;
  };

  const formatAttributes = (element: Element) => {
    if (element.closest(editableOrScript)) return;
    for (const attribute of textAttributes) {
      const original = element.getAttribute(attribute);
      if (!original) continue;
      const display = replaceEmoji(original);
      if (display !== original) element.setAttribute(attribute, display);
    }
  };

  const formatSubtree = (node: Node) => {
    if (node.nodeType === 3) {
      formatText(node as Text);
      return;
    }
    if (node.nodeType === 1) {
      const element = node as Element;
      if (element.closest(editableOrScript)) return;
      formatAttributes(element);
    }
    const walker = container.ownerDocument.createTreeWalker(node, 1 | 4, {
      acceptNode(candidate) {
        return candidate.nodeType === 1 && (candidate as Element).matches(editableOrScript) ? 2 : 1;
      },
    });
    while (walker.nextNode()) {
      if (walker.currentNode.nodeType === 3) formatText(walker.currentNode as Text);
      else formatAttributes(walker.currentNode as Element);
    }
  };

  formatSubtree(container);
  const observer = new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === 'characterData') formatText(change.target as Text);
      else if (change.type === 'attributes') formatAttributes(change.target as Element);
      else change.addedNodes.forEach(formatSubtree);
    }
  });
  observer.observe(container, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: textAttributes });
  return () => observer.disconnect();
}
