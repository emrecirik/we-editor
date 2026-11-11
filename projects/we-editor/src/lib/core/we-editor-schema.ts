import { DOMOutputSpec, Mark, MarkSpec, Node as PmNode, NodeSpec, Schema } from 'prosemirror-model';

/** Paragraph/heading alignment. `null` means "inherit" (no inline style is written). */
export type WeEditorAlign = 'left' | 'center' | 'right' | 'justify';

/** One indent level, in pixels, written as `margin-left` on paragraphs and headings. */
export const WE_EDITOR_INDENT_PX = 40;
export const WE_EDITOR_MAX_INDENT = 8;

const ALIGNS: readonly string[] = ['left', 'center', 'right', 'justify'];

// The schema IS the HTML allowlist: anything that no parse rule below matches is dropped when HTML
// is read in, and only these nodes, marks and attributes are ever written out.

/**
 * Returns the URL when it is safe to put in an `href`, otherwise `null`. Allowed: http(s), mailto,
 * tel and scheme-less (relative, `#anchor`) URLs. Everything else — `javascript:`, `data:`,
 * `vbscript:` … including obfuscated forms with embedded whitespace/control characters — is rejected.
 */
export function weEditorSafeUrl(url: string | null | undefined): string | null {
  if (url == null) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  // Browsers ignore ASCII whitespace and control characters inside the scheme ("java\tscript:").
  // eslint-disable-next-line no-control-regex
  const probe = trimmed.replace(/[\u0000- \u007f-\u009f]/g, '').toLowerCase();
  const scheme = /^([a-z][a-z0-9+.-]*):/.exec(probe);
  // No scheme before the first ':' (or none at all) means a relative URL.
  if (!scheme) return trimmed;
  return ['http', 'https', 'mailto', 'tel'].includes(scheme[1]) ? trimmed : null;
}

const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*(,\s*[\d.]+%?\s*)?\)|[a-z]{3,20})$/i;
const FONT_SIZE_RE = /^\d{1,3}(\.\d{1,2})?(px|pt|em|rem|%)$/;
const FONT_FAMILY_RE = /^[\w\s,'"-]{1,120}$/;

/** Validates a CSS colour value the editor is willing to write into a `style` attribute. */
export function weEditorSafeColor(value: string | null | undefined): string | null {
  const v = value?.trim();
  return v && COLOR_RE.test(v) && !/^(inherit|initial|unset|revert|currentcolor|transparent)$/i.test(v) ? v : null;
}

export function weEditorSafeFontSize(value: string | null | undefined): string | null {
  const v = value?.trim();
  return v && FONT_SIZE_RE.test(v) ? v : null;
}

export function weEditorSafeFontFamily(value: string | null | undefined): string | null {
  const v = value?.trim();
  return v && FONT_FAMILY_RE.test(v) && !/^(inherit|initial|unset|revert)$/i.test(v) ? v : null;
}

function blockAttrsFromDom(dom: HTMLElement): { align: string | null; indent: number } {
  const align = dom.style.textAlign || dom.getAttribute('align') || '';
  const margin = parseFloat(dom.style.marginLeft || '0');
  const indent = Number.isFinite(margin) ? Math.round(margin / WE_EDITOR_INDENT_PX) : 0;
  return {
    align: ALIGNS.includes(align) ? align : null,
    indent: Math.max(0, Math.min(WE_EDITOR_MAX_INDENT, indent))
  };
}

function blockStyle(node: PmNode): Record<string, string> {
  const parts: string[] = [];
  if (node.attrs['align']) parts.push(`text-align: ${node.attrs['align']}`);
  if (node.attrs['indent'] > 0) parts.push(`margin-left: ${node.attrs['indent'] * WE_EDITOR_INDENT_PX}px`);
  return parts.length ? { style: parts.join('; ') } : {};
}

const blockAttrs = { align: { default: null }, indent: { default: 0 } };

const nodes: Record<string, NodeSpec> = {
  doc: { content: 'block+' },

  paragraph: {
    content: 'inline*',
    group: 'block',
    attrs: blockAttrs,
    parseDOM: [{ tag: 'p', getAttrs: (dom) => blockAttrsFromDom(dom as HTMLElement) }],
    toDOM: (node): DOMOutputSpec => ['p', blockStyle(node), 0]
  },

  heading: {
    content: 'inline*',
    group: 'block',
    defining: true,
    attrs: { level: { default: 1 }, ...blockAttrs },
    parseDOM: [1, 2, 3, 4, 5, 6].map((level) => ({
      tag: `h${level}`,
      getAttrs: (dom: HTMLElement) => ({ level, ...blockAttrsFromDom(dom) })
    })),
    toDOM: (node): DOMOutputSpec => [`h${node.attrs['level']}`, blockStyle(node), 0]
  },

  blockquote: {
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM: (): DOMOutputSpec => ['blockquote', 0]
  },

  code_block: {
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
    toDOM: (): DOMOutputSpec => ['pre', ['code', 0]]
  },

  horizontal_rule: {
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM: (): DOMOutputSpec => ['hr']
  },

  bullet_list: {
    content: 'list_item+',
    group: 'block',
    parseDOM: [{ tag: 'ul' }],
    toDOM: (): DOMOutputSpec => ['ul', 0]
  },

  ordered_list: {
    content: 'list_item+',
    group: 'block',
    attrs: { order: { default: 1 } },
    parseDOM: [
      {
        tag: 'ol',
        getAttrs: (dom) => {
          const start = parseInt((dom as HTMLElement).getAttribute('start') ?? '1', 10);
          return { order: Number.isFinite(start) ? start : 1 };
        }
      }
    ],
    toDOM: (node): DOMOutputSpec => ['ol', node.attrs['order'] === 1 ? {} : { start: String(node.attrs['order']) }, 0]
  },

  list_item: {
    content: 'paragraph block*',
    defining: true,
    parseDOM: [{ tag: 'li' }],
    toDOM: (): DOMOutputSpec => ['li', 0]
  },

  task_list: {
    content: 'task_item+',
    group: 'block',
    parseDOM: [{ tag: 'ul[data-type="taskList"]', priority: 60 }],
    toDOM: (): DOMOutputSpec => ['ul', { 'data-type': 'taskList' }, 0]
  },

  task_item: {
    content: 'paragraph block*',
    defining: true,
    attrs: { checked: { default: false } },
    parseDOM: [
      {
        tag: 'li[data-type="taskItem"]',
        priority: 60,
        getAttrs: (dom) => ({ checked: (dom as HTMLElement).getAttribute('data-checked') === 'true' }),
        // Our own output wraps the content in a <div> next to the checkbox; foreign task lists may not.
        contentElement: (dom: Node) => (dom as HTMLElement).querySelector(':scope > div') ?? (dom as HTMLElement)
      }
    ],
    toDOM: (node): DOMOutputSpec => [
      'li',
      { 'data-type': 'taskItem', 'data-checked': String(node.attrs['checked']) },
      ['label', { contenteditable: 'false' }, ['input', node.attrs['checked'] ? { type: 'checkbox', checked: 'checked' } : { type: 'checkbox' }]],
      ['div', 0]
    ]
  },

  text: { group: 'inline' },

  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM: (): DOMOutputSpec => ['br']
  }
};

const marks: Record<string, MarkSpec> = {
  link: {
    attrs: { href: {}, title: { default: null }, target: { default: null } },
    inclusive: false,
    parseDOM: [
      {
        tag: 'a[href]',
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          const href = weEditorSafeUrl(el.getAttribute('href'));
          if (!href) return false;
          return { href, title: el.getAttribute('title'), target: el.getAttribute('target') === '_blank' ? '_blank' : null };
        }
      }
    ],
    toDOM: (mark: Mark): DOMOutputSpec => {
      const attrs: Record<string, string> = { href: weEditorSafeUrl(mark.attrs['href']) ?? '#' };
      if (mark.attrs['title']) attrs['title'] = mark.attrs['title'];
      if (mark.attrs['target'] === '_blank') {
        attrs['target'] = '_blank';
        attrs['rel'] = 'noopener noreferrer';
      }
      return ['a', attrs, 0];
    }
  },

  bold: {
    parseDOM: [
      { tag: 'strong' },
      // Google Docs wraps everything in <b style="font-weight: normal">.
      { tag: 'b', getAttrs: (dom) => (dom as HTMLElement).style.fontWeight !== 'normal' && null },
      { style: 'font-weight', getAttrs: (value) => /^(bold(er)?|[6-9]00)$/.test(value as string) && null }
    ],
    toDOM: (): DOMOutputSpec => ['strong', 0]
  },

  italic: {
    parseDOM: [{ tag: 'em' }, { tag: 'i' }, { style: 'font-style=italic' }],
    toDOM: (): DOMOutputSpec => ['em', 0]
  },

  underline: {
    parseDOM: [{ tag: 'u' }, { style: 'text-decoration', getAttrs: (v) => (v as string).includes('underline') && null }],
    toDOM: (): DOMOutputSpec => ['u', 0]
  },

  strike: {
    parseDOM: [
      { tag: 's' },
      { tag: 'del' },
      { tag: 'strike' },
      { style: 'text-decoration', getAttrs: (v) => (v as string).includes('line-through') && null }
    ],
    toDOM: (): DOMOutputSpec => ['s', 0]
  },

  subscript: {
    excludes: 'superscript',
    parseDOM: [{ tag: 'sub' }, { style: 'vertical-align=sub' }],
    toDOM: (): DOMOutputSpec => ['sub', 0]
  },

  superscript: {
    excludes: 'subscript',
    parseDOM: [{ tag: 'sup' }, { style: 'vertical-align=super' }],
    toDOM: (): DOMOutputSpec => ['sup', 0]
  },

  code: {
    parseDOM: [{ tag: 'code' }],
    toDOM: (): DOMOutputSpec => ['code', 0]
  },

  // Font family, size, colour and highlight are separate marks (one inline style each) so setting
  // one never has to merge with the others.
  font_family: {
    attrs: { value: {} },
    parseDOM: [{ style: 'font-family', getAttrs: (v) => (weEditorSafeFontFamily(v as string) ? { value: (v as string).trim() } : false) }],
    toDOM: (mark: Mark): DOMOutputSpec => ['span', { style: `font-family: ${mark.attrs['value']}` }, 0]
  },

  font_size: {
    attrs: { value: {} },
    parseDOM: [{ style: 'font-size', getAttrs: (v) => (weEditorSafeFontSize(v as string) ? { value: (v as string).trim() } : false) }],
    toDOM: (mark: Mark): DOMOutputSpec => ['span', { style: `font-size: ${mark.attrs['value']}` }, 0]
  },

  text_color: {
    attrs: { value: {} },
    parseDOM: [{ style: 'color', getAttrs: (v) => (weEditorSafeColor(v as string) ? { value: (v as string).trim() } : false) }],
    toDOM: (mark: Mark): DOMOutputSpec => ['span', { style: `color: ${mark.attrs['value']}` }, 0]
  },

  highlight: {
    attrs: { value: {} },
    parseDOM: [
      {
        tag: 'mark',
        getAttrs: (dom) => ({ value: weEditorSafeColor((dom as HTMLElement).style.backgroundColor) ?? 'yellow' })
      },
      { style: 'background-color', getAttrs: (v) => (weEditorSafeColor(v as string) ? { value: (v as string).trim() } : false) }
    ],
    toDOM: (mark: Mark): DOMOutputSpec => ['mark', { style: `background-color: ${mark.attrs['value']}` }, 0]
  }
};

/** The F0 document schema. Plugins in later phases extend it (tables, images, placeholders…). */
export const weEditorSchema = new Schema({ nodes, marks });
