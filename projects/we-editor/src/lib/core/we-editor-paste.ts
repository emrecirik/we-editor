import { Plugin } from 'prosemirror-state';

/** Word / Outlook (Office HTML) or Google Docs clipboard content. */
function isOfficeHtml(html: string): boolean {
  return /urn:schemas-microsoft-com:office|class="?Mso|mso-|docs-internal-guid/i.test(html);
}

/** Style properties pasted Office/Docs text carries everywhere; dropping them keeps the document's own look. */
const NOISE = /^(mso-|font-family|font-size|line-height|margin|text-indent|tab-stops|page-break|white-space|vertical-align: baseline)/i;
const DEFAULT_COLOR = /^(black|windowtext|#000(000)?|rgb\(0, 0, 0\))$/i;
const DEFAULT_BACKGROUND = /^(transparent|white|#fff(fff)?|rgb\(255, 255, 255\)|rgba\(0, 0, 0, 0\))$/i;

function cleanStyle(el: HTMLElement): void {
  const style = el.style;
  for (let i = style.length - 1; i >= 0; i--) {
    const name = style[i];
    const value = style.getPropertyValue(name).trim();
    const noise =
      NOISE.test(name) ||
      NOISE.test(`${name}: ${value}`) ||
      (name === 'color' && DEFAULT_COLOR.test(value)) ||
      (name.startsWith('background') && DEFAULT_BACKGROUND.test(value)) ||
      // font-weight stays: Google Docs' `<b style="font-weight:normal">` wrapper depends on it.
      (name === 'font-style' && value === 'normal') ||
      (name === 'text-decoration' && value === 'none');
    if (noise) style.removeProperty(name);
  }
  // Word writes mso-* inside the attribute where the CSSOM cannot see them; drop those too.
  const rest = (el.getAttribute('style') ?? '').split(';').filter((part) => part.trim() && !/^\s*mso-/i.test(part));
  if (rest.length) el.setAttribute('style', rest.join(';'));
  else el.removeAttribute('style');
}

interface WordListItem {
  level: number;
  ordered: boolean;
  content: Node[];
}

/** A Word list paragraph (`mso-list: l0 level2 lfo1`) as level, list type and content without the fake marker. */
function wordListItem(p: Element): WordListItem | null {
  const style = p.getAttribute('style') ?? '';
  const match = /mso-list:\s*l\d+\s+level(\d+)/i.exec(style);
  if (!match && !/MsoListParagraph/i.test(p.getAttribute('class') ?? '')) return null;
  const marker = Array.from(p.querySelectorAll('span')).find((s) => /mso-list:\s*Ignore/i.test(s.getAttribute('style') ?? ''));
  if (!match && !marker) return null;
  // shortcut: a list paragraph without Word's mso-list:Ignore marker span (picture bullets) keeps any
  // glyph typed in its text; handle it if real clipboard samples show one.
  const text = marker?.textContent?.replace(/\s+/g, '') ?? '';
  marker?.remove();
  return {
    level: match ? Number(match[1]) : 1,
    ordered: /^([0-9]+|[a-z]{1,3}|[ivxlc]+)[.)]$/i.test(text),
    content: Array.from(p.childNodes)
  };
}

/** Replaces runs of Word list paragraphs with real, nested `<ul>` / `<ol>` lists. */
function convertWordLists(body: HTMLElement): void {
  const doc = body.ownerDocument;
  const paragraphs = Array.from(body.querySelectorAll('p'));
  let stack: { level: number; list: HTMLElement }[] = [];
  let previous: Element | null = null;
  for (const p of paragraphs) {
    const item = wordListItem(p);
    if (!item) {
      stack = [];
      previous = null;
      continue;
    }
    // A list item not directly after the previous one starts a new list.
    if (previous && p.previousElementSibling !== previous) stack = [];
    while (stack.length && stack[stack.length - 1].level > item.level) stack.pop();
    let top = stack[stack.length - 1];
    if (top && top.level === item.level && (top.list.localName === 'ol') !== item.ordered) {
      stack.pop();
      top = stack[stack.length - 1];
    }
    if (!top || top.level < item.level) {
      const list = doc.createElement(item.ordered ? 'ol' : 'ul');
      const parentLi = top?.list.lastElementChild;
      if (parentLi) parentLi.appendChild(list);
      else p.before(list);
      stack.push({ level: item.level, list });
      top = stack[stack.length - 1];
    }
    const li = doc.createElement('li');
    const para = doc.createElement('p');
    para.append(...item.content);
    li.appendChild(para);
    top.list.appendChild(li);
    previous = p;
    // Keep the placeholder until the next paragraph is checked for adjacency, then drop it.
    p.replaceChildren();
    p.setAttribute('data-we-list-done', '');
  }
  body.querySelectorAll('p[data-we-list-done]').forEach((p) => p.remove());
}

/**
 * Cleans HTML pasted from Word, Outlook or Google Docs: real nested lists instead of Word's marker
 * paragraphs, and no Office font, size, spacing or default-colour noise. Other HTML is returned as is.
 * The string is parsed into an inert document and returned as a string; the editor schema still
 * decides what is kept.
 */
export function weEditorCleanOfficeHtml(html: string): string {
  if (!isOfficeHtml(html)) return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = doc.body;
  body.querySelectorAll('style, meta, link, title, xml, script').forEach((n) => n.remove());
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_COMMENT);
  const comments: Node[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach((c) => c.parentNode?.removeChild(c));
  // Office namespace elements such as <o:p> carry nothing but spacing.
  Array.from(body.getElementsByTagName('*')).forEach((el) => {
    if (el.localName.includes(':')) el.remove();
  });
  convertWordLists(body);
  body.querySelectorAll<HTMLElement>('[style]').forEach(cleanStyle);
  return body.innerHTML;
}

/** Applies `weEditorCleanOfficeHtml` to pasted HTML. */
export function weEditorPasteFromOffice(): Plugin {
  return new Plugin({ props: { transformPastedHTML: (html) => weEditorCleanOfficeHtml(html) } });
}
