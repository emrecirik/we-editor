/** Elements that start their own line in formatted HTML; everything else stays inline. */
const BLOCK = new Set([
  'address', 'article', 'aside', 'blockquote', 'details', 'dd', 'div', 'dl', 'dt', 'figcaption', 'figure',
  'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'iframe', 'li', 'main', 'nav', 'ol', 'p',
  'pre', 'section', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
]);

const VOID = new Set(['area', 'br', 'col', 'embed', 'hr', 'img', 'input', 'source', 'track', 'wbr']);

/** The start tag of `el` as the browser serializes it (attributes escaped by the platform). */
function startTag(el: Element): string {
  const shell = el.cloneNode(false) as Element;
  const html = shell.outerHTML;
  return VOID.has(el.localName) ? html : html.slice(0, html.length - `</${el.localName}>`.length);
}

function hasBlockChild(el: Element): boolean {
  return Array.from(el.children).some((c) => BLOCK.has(c.localName));
}

const NBSP = String.fromCharCode(160);
const escapeText = (text: string): string =>
  text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!).split(NBSP).join('&nbsp;');

/** Formats a list of sibling nodes: blocks on their own lines, runs of inline nodes joined on one line. */
function formatChildren(nodes: NodeListOf<ChildNode>, depth: number, indent: string, out: string[]): void {
  const pad = indent.repeat(depth);
  let run = '';
  const flush = (): void => {
    if (run.trim()) out.push(pad + run.trim());
    run = '';
  };
  for (const node of Array.from(nodes)) {
    if (node.nodeType === Node.TEXT_NODE) run += escapeText((node as Text).data).replace(/\s+/g, ' ');
    else if (node.nodeType === Node.ELEMENT_NODE && !BLOCK.has((node as Element).localName)) run += (node as Element).outerHTML;
    else if (node.nodeType === Node.ELEMENT_NODE) {
      flush();
      formatBlock(node as Element, depth, indent, out);
    }
  }
  flush();
}

function formatBlock(el: Element, depth: number, indent: string, out: string[]): void {
  const pad = indent.repeat(depth);
  if (el.localName === 'pre' || !hasBlockChild(el)) {
    // Inline-only content (and <pre>, where whitespace matters) is kept exactly as serialized.
    out.push(pad + el.outerHTML);
    return;
  }
  out.push(pad + startTag(el));
  formatChildren(el.childNodes, depth + 1, indent, out);
  if (!VOID.has(el.localName)) out.push(pad + `</${el.localName}>`);
}

/**
 * Pretty-prints HTML for reading and editing: one block element per line, nested blocks indented,
 * inline content and `<pre>` untouched. The input is parsed into an inert document (nothing runs or
 * loads) and the result is text — it is meant for a code view, never for `innerHTML`.
 */
export function weEditorFormatHtml(html: string, indent = '  '): string {
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  const out: string[] = [];
  formatChildren(body.childNodes, 0, indent, out);
  return out.join('\n');
}
