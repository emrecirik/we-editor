import { chainCommands, exitCode, lift, setBlockType, toggleMark, wrapIn } from 'prosemirror-commands';
import { Mark, MarkType, Node as PmNode, NodeType } from 'prosemirror-model';
import { liftListItem, sinkListItem, wrapInList } from 'prosemirror-schema-list';
import { SearchQuery, getSearchState, setSearchState } from 'prosemirror-search';
import { isInTable, selectionCell, setCellAttr } from 'prosemirror-tables';
import { Command, EditorState, NodeSelection, TextSelection } from 'prosemirror-state';

import {
  WE_EDITOR_MAX_INDENT,
  WE_EDITOR_MAX_IMAGE_WIDTH,
  WeEditorAlign,
  WeEditorImageAlign,
  WE_EDITOR_CELL_ALIGNS,
  WeEditorCellAlign,
  weEditorCleanCaption,
  weEditorSafeColor,
  weEditorEmbedUrl,
  weEditorSafeImageSrc,
  weEditorSafeFontFamily,
  weEditorSafeFontSize,
  weEditorSafeLineHeight,
  weEditorSafeUrl,
  weEditorSchema
} from './we-editor-schema';

const s = weEditorSchema;

/** Value-carrying marks set from the toolbar's pickers. */
export type WeEditorStyleMark = 'font_family' | 'font_size' | 'text_color' | 'highlight';

const STYLE_VALIDATORS: Record<WeEditorStyleMark, (v: string) => string | null> = {
  font_family: weEditorSafeFontFamily,
  font_size: weEditorSafeFontSize,
  text_color: weEditorSafeColor,
  highlight: weEditorSafeColor
};

/** True when `type` is active at the cursor (stored marks) or anywhere in the selection. */
export function weEditorMarkActive(state: EditorState, type: MarkType): boolean {
  const { from, $from, to, empty } = state.selection;
  if (empty) return !!type.isInSet(state.storedMarks ?? $from.marks());
  return state.doc.rangeHasMark(from, to, type);
}

/** The mark of `type` at the cursor/selection start, if any. */
export function weEditorMarkAt(state: EditorState, type: MarkType): Mark | undefined {
  const { $from, empty } = state.selection;
  const marks = empty ? state.storedMarks ?? $from.marks() : ($from.nodeAfter?.marks ?? $from.marks());
  return type.isInSet(marks) ?? undefined;
}

export function weEditorToggleMark(type: MarkType): Command {
  return toggleMark(type);
}

/**
 * Sets a value mark (font, size, colour, highlight) on the selection, or removes it when `value`
 * is null/empty. An invalid value is refused (the command returns false) rather than written.
 */
export function weEditorSetStyle(markName: WeEditorStyleMark, value: string | null): Command {
  return (state, dispatch) => {
    const type = s.marks[markName];
    const safe = value ? STYLE_VALIDATORS[markName](value) : null;
    if (value && !safe) return false;
    const { from, to, empty } = state.selection;
    if (dispatch) {
      const tr = state.tr;
      if (empty) {
        if (safe) tr.addStoredMark(type.create({ value: safe }));
        else tr.removeStoredMark(type);
      } else if (safe) {
        tr.addMark(from, to, type.create({ value: safe }));
      } else {
        tr.removeMark(from, to, type);
      }
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

/** Inserts plain text at the selection (replacing it), keeping the marks in effect there. */
export function weEditorInsertText(text: string): Command {
  return (state, dispatch) => {
    if (!text) return false;
    dispatch?.(state.tr.insertText(text).scrollIntoView());
    return true;
  };
}

/** Removes every mark from the selection and resets block alignment/indent. */
export const weEditorClearFormatting: Command = (state, dispatch) => {
  const { from, to, empty } = state.selection;
  if (dispatch) {
    const tr = state.tr;
    if (empty) tr.setStoredMarks([]);
    else tr.removeMark(from, to);
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type === s.nodes['paragraph'] || node.type === s.nodes['heading']) {
        if (node.attrs['align'] || node.attrs['indent']) tr.setNodeMarkup(pos, undefined, { ...node.attrs, align: null, indent: 0 });
      }
    });
    dispatch(tr);
  }
  return true;
};

/** `0` = paragraph, `1`-`6` = heading level. */
export function weEditorSetBlock(level: number): Command {
  return level === 0 ? setBlockType(s.nodes['paragraph']) : setBlockType(s.nodes['heading'], { level });
}

/** 0 for a paragraph, 1-6 for a heading, -1 for anything else or a mixed selection. */
export function weEditorBlockLevel(state: EditorState): number {
  const { $from, $to } = state.selection;
  if (!$from.sameParent($to)) return -1;
  const parent = $from.parent;
  if (parent.type === s.nodes['paragraph']) return 0;
  if (parent.type === s.nodes['heading']) return parent.attrs['level'];
  return -1;
}

function textBlocksInSelection(state: EditorState): { node: PmNode; pos: number }[] {
  const found: { node: PmNode; pos: number }[] = [];
  const { from, to } = state.selection;
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type === s.nodes['paragraph'] || node.type === s.nodes['heading']) {
      found.push({ node, pos });
      return false;
    }
    return true;
  });
  return found;
}

export function weEditorSetAlign(align: WeEditorAlign | null): Command {
  return (state, dispatch) => {
    const blocks = textBlocksInSelection(state);
    if (!blocks.length) return false;
    if (dispatch) {
      const tr = state.tr;
      // 'left' is the default direction; store it as null so the output carries no redundant style.
      for (const { node, pos } of blocks) tr.setNodeMarkup(pos, undefined, { ...node.attrs, align: align === 'left' ? null : align });
      dispatch(tr);
    }
    return true;
  };
}

export function weEditorAlignAt(state: EditorState): WeEditorAlign {
  return (textBlocksInSelection(state)[0]?.node.attrs['align'] as WeEditorAlign | null) ?? 'left';
}

/** Sets (or with `null` clears) the line height of the paragraphs and headings in the selection. */
export function weEditorSetLineHeight(value: string | null): Command {
  return (state, dispatch) => {
    const safe = value ? weEditorSafeLineHeight(value) : null;
    if (value && !safe) return false;
    const blocks = textBlocksInSelection(state);
    if (!blocks.length) return false;
    if (dispatch) {
      const tr = state.tr;
      for (const { node, pos } of blocks) tr.setNodeMarkup(pos, undefined, { ...node.attrs, lineHeight: safe });
      dispatch(tr);
    }
    return true;
  };
}

export function weEditorLineHeightAt(state: EditorState): string | null {
  return (textBlocksInSelection(state)[0]?.node.attrs['lineHeight'] as string | null) ?? null;
}

export type WeEditorTextCase = 'upper' | 'lower' | 'title' | 'sentence';

const WORD_CHAR = /[\p{L}\p{N}'’]/u;

/**
 * Changes the letter case of the selected text, keeping its marks. `locale` (default: the browser's)
 * decides language rules such as Turkish dotted/dotless i.
 */
export function weEditorChangeCase(mode: WeEditorTextCase, locale?: string): Command {
  return (state, dispatch) => {
    const { from, to, empty } = state.selection;
    if (empty) return false;
    const segments: { from: number; to: number; text: string; marks: readonly Mark[] }[] = [];
    // Context before the selection, so a selection starting mid-word or mid-sentence is handled right.
    const { $from } = state.selection;
    const before = $from.parent.textBetween(0, $from.parentOffset, ' ', ' ');
    let lastParent: PmNode | null = $from.parent;
    // The character before the current one, across text nodes; a new block counts as a sentence start.
    let prev = before.slice(-1);
    let atSentenceStart = before.trim() === '' || /[.!?]\s*$/.test(before);
    state.doc.nodesBetween(from, to, (node, pos, parent) => {
      if (!node.isText) return true;
      if (parent !== lastParent) {
        lastParent = parent;
        prev = '';
        atSentenceStart = true;
      }
      const start = Math.max(from, pos);
      const end = Math.min(to, pos + node.nodeSize);
      const original = node.text!.slice(start - pos, end - pos);
      let out = '';
      for (const ch of original) {
        const upper = ch.toLocaleUpperCase(locale);
        const lower = ch.toLocaleLowerCase(locale);
        if (mode === 'upper') out += upper;
        else if (mode === 'lower') out += lower;
        else if (mode === 'title') out += WORD_CHAR.test(prev) ? lower : upper;
        else {
          out += atSentenceStart && WORD_CHAR.test(ch) ? upper : lower;
          if (WORD_CHAR.test(ch)) atSentenceStart = false;
          else if (/[.!?]/.test(ch)) atSentenceStart = true;
        }
        prev = ch;
      }
      if (out !== original) segments.push({ from: start, to: end, text: out, marks: node.marks });
      return false;
    });
    if (!segments.length) return false;
    if (dispatch) {
      const tr = state.tr;
      // Back to front, so earlier positions stay valid when a length changes (ß → SS).
      for (const seg of segments.reverse()) tr.replaceWith(seg.from, seg.to, s.text(seg.text, seg.marks));
      tr.setSelection(TextSelection.create(tr.doc, tr.mapping.map(from, -1), tr.mapping.map(to)));
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

/** Format painter: replaces the formatting marks of the selection with `marks` (links are left alone). */
export function weEditorPaintMarks(marks: readonly Mark[]): Command {
  return (state, dispatch) => {
    const { from, to, empty } = state.selection;
    if (empty) return false;
    if (dispatch) {
      const tr = state.tr;
      for (const type of Object.values(s.marks)) if (type !== s.marks['link']) tr.removeMark(from, to, type);
      for (const mark of marks) if (mark.type !== s.marks['link']) tr.addMark(from, to, mark);
      dispatch(tr);
    }
    return true;
  };
}

function changeBlockIndent(delta: number): Command {
  return (state, dispatch) => {
    const blocks = textBlocksInSelection(state).filter(({ node }) => {
      const next = node.attrs['indent'] + delta;
      return next >= 0 && next <= WE_EDITOR_MAX_INDENT;
    });
    if (!blocks.length) return false;
    if (dispatch) {
      const tr = state.tr;
      for (const { node, pos } of blocks) tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: node.attrs['indent'] + delta });
      dispatch(tr);
    }
    return true;
  };
}

/** Inside a list: nest the item one level. Elsewhere: indent the paragraph/heading. */
export const weEditorIndent: Command = chainCommands(
  sinkListItem(s.nodes['list_item']),
  sinkListItem(s.nodes['task_item']),
  (state, dispatch) => (inList(state) ? false : changeBlockIndent(1)(state, dispatch))
);

/** Inside a list: lift the item one level. Elsewhere: outdent the paragraph/heading. */
export const weEditorOutdent: Command = chainCommands(
  liftListItem(s.nodes['list_item']),
  liftListItem(s.nodes['task_item']),
  changeBlockIndent(-1)
);

function inList(state: EditorState): boolean {
  return listAt(state) !== null;
}

/** The innermost list node around the selection, with its depth. */
function listAt(state: EditorState): { node: PmNode; depth: number } | null {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type === s.nodes['bullet_list'] || node.type === s.nodes['ordered_list'] || node.type === s.nodes['task_list']) {
      return { node, depth: d };
    }
  }
  return null;
}

export type WeEditorListKind = 'bullet_list' | 'ordered_list' | 'task_list';

export function weEditorListAt(state: EditorState): WeEditorListKind | null {
  return (listAt(state)?.node.type.name as WeEditorListKind | undefined) ?? null;
}

/**
 * Toggles a list: lifts the items out when the cursor is already in a list of this kind, converts a
 * bullet list to numbered (and back) in place, and otherwise wraps the selection in a new list.
 */
export function weEditorToggleList(kind: WeEditorListKind): Command {
  const listType: NodeType = s.nodes[kind];
  const itemType: NodeType = kind === 'task_list' ? s.nodes['task_item'] : s.nodes['list_item'];
  return (state, dispatch, view) => {
    const current = listAt(state);
    if (!current) return wrapInList(listType)(state, dispatch);
    if (current.node.type === listType) return liftListItem(itemType)(state, dispatch);
    const currentItem = current.node.type === s.nodes['task_list'] ? s.nodes['task_item'] : s.nodes['list_item'];
    if (currentItem === itemType) {
      if (dispatch) dispatch(state.tr.setNodeMarkup(state.selection.$from.before(current.depth), listType));
      return true;
    }
    // Different item types (task ↔ plain): lift out, then wrap again in the new kind.
    if (!liftListItem(currentItem)(state)) return false;
    if (dispatch && view) {
      liftListItem(currentItem)(state, dispatch);
      return wrapInList(listType)(view.state, view.dispatch) || true;
    }
    return true;
  };
}

export function weEditorToggleWrap(type: NodeType): Command {
  return (state, dispatch) => {
    const { $from } = state.selection;
    for (let d = $from.depth; d > 0; d--) if ($from.node(d).type === type) return lift(state, dispatch);
    return wrapIn(type)(state, dispatch);
  };
}

export const weEditorToggleCodeBlock: Command = (state, dispatch) =>
  state.selection.$from.parent.type === s.nodes['code_block']
    ? setBlockType(s.nodes['paragraph'])(state, dispatch)
    : setBlockType(s.nodes['code_block'])(state, dispatch);

export const weEditorInsertHorizontalRule: Command = (state, dispatch) => {
  if (dispatch) dispatch(state.tr.replaceSelectionWith(s.nodes['horizontal_rule'].create()).scrollIntoView());
  return true;
};

export const weEditorInsertHardBreak: Command = chainCommands(exitCode, (state, dispatch) => {
  if (dispatch) dispatch(state.tr.replaceSelectionWith(s.nodes['hard_break'].create()).scrollIntoView());
  return true;
});

/** The document range covered by the link mark around the cursor. */
function linkRange(state: EditorState): { from: number; to: number } | null {
  const { $from } = state.selection;
  const type = s.marks['link'];
  const mark = type.isInSet($from.marks()) ?? (($from.nodeAfter && type.isInSet($from.nodeAfter.marks)) || null);
  if (!mark) return null;
  const pos = $from.pos;
  const start = $from.start();
  let runFrom = -1;
  let runTo = -1;
  let result: { from: number; to: number } | null = null;
  $from.parent.forEach((child, offset) => {
    const childFrom = start + offset;
    if (!mark.isInSet(child.marks)) {
      runFrom = -1;
      return;
    }
    if (runFrom === -1 || childFrom !== runTo) runFrom = childFrom;
    runTo = childFrom + child.nodeSize;
    if (runFrom <= pos && runTo >= pos) result = { from: runFrom, to: runTo };
  });
  return result;
}

/**
 * Links the selection to `href`. With an empty selection inside a link, the whole link is updated;
 * with an empty selection elsewhere, the URL itself is inserted as linked text. Unsafe URLs
 * (`javascript:` …) are refused.
 */
export function weEditorSetLink(href: string, target: '_blank' | null = null): Command {
  return (state, dispatch) => {
    const safe = weEditorSafeUrl(href);
    if (!safe) return false;
    const mark = s.marks['link'].create({ href: safe, target });
    const { from, to, empty } = state.selection;
    if (dispatch) {
      const tr = state.tr;
      if (!empty) tr.addMark(from, to, mark);
      else {
        const range = linkRange(state);
        if (range) tr.removeMark(range.from, range.to, s.marks['link']).addMark(range.from, range.to, mark);
        else {
          tr.insert(from, s.text(safe, [mark]));
          tr.setSelection(TextSelection.create(tr.doc, from + safe.length));
        }
      }
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

export const weEditorRemoveLink: Command = (state, dispatch) => {
  const type = s.marks['link'];
  const { from, to, empty } = state.selection;
  const range = empty ? linkRange(state) : state.doc.rangeHasMark(from, to, type) ? { from, to } : null;
  if (!range) return false;
  if (dispatch) dispatch(state.tr.removeMark(range.from, range.to, type));
  return true;
};

export function weEditorLinkAt(state: EditorState): string | null {
  return (weEditorMarkAt(state, s.marks['link'])?.attrs['href'] as string | undefined) ?? null;
}

/** Attributes of an image node, as the image bar edits them. */
export interface WeEditorImageAttrs {
  src: string;
  alt?: string | null;
  title?: string | null;
  width?: number | null;
  align?: WeEditorImageAlign | null;
  /** `true`: a `<figure>` with an editable `<figcaption>`. */
  caption?: boolean;
  /** Link target of the image (must pass `weEditorSafeUrl`); empty or `null` removes the link. */
  href?: string | null;
}

function imageAttrs(attrs: WeEditorImageAttrs): Record<string, unknown> | null {
  const src = weEditorSafeImageSrc(attrs.src);
  if (!src) return null;
  const width = attrs.width && attrs.width > 0 ? Math.min(Math.round(attrs.width), WE_EDITOR_MAX_IMAGE_WIDTH) : null;
  const align = attrs.align === 'left' || attrs.align === 'center' || attrs.align === 'right' ? attrs.align : null;
  return { src, alt: attrs.alt?.trim() || null, title: attrs.title?.trim() || null, width, align };
}

/** The selected image or captioned figure (node selection, or the cursor in its caption). */
function imageTarget(state: EditorState): { node: PmNode; pos: number } | null {
  const sel = state.selection;
  if (sel instanceof NodeSelection && (sel.node.type === s.nodes['image'] || sel.node.type === s.nodes['figure'])) {
    return { node: sel.node, pos: sel.from };
  }
  const { $from } = sel;
  return $from.parent.type === s.nodes['figure'] ? { node: $from.parent, pos: $from.before() } : null;
}

/** The selected image, or the figure around the cursor (`caption: true`), with its link; else `null`. */
export function weEditorImageAt(state: EditorState): WeEditorImageAttrs | null {
  const target = imageTarget(state);
  if (!target) return null;
  const { node } = target;
  const figure = node.type === s.nodes['figure'];
  const href = figure ? node.attrs['href'] : (node.marks.find((m) => m.type === s.marks['link'])?.attrs['href'] ?? null);
  return { ...(node.attrs as WeEditorImageAttrs), caption: figure, href };
}

/**
 * Inserts an image at the selection, or updates the selected image / figure. `caption: true` makes it
 * a `<figure>` with an editable caption (the cursor moves into it); `caption: false` turns a figure back
 * into an inline image and keeps any caption text as the next paragraph. `href` links the image.
 * Refuses an unsafe `src` (see `weEditorSafeImageSrc`) or `href` (see `weEditorSafeUrl`).
 */
export function weEditorSetImage(attrs: WeEditorImageAttrs): Command {
  return (state, dispatch) => {
    const clean = imageAttrs(attrs);
    if (!clean) return false;
    const href = attrs.href?.trim() ? weEditorSafeUrl(attrs.href) : null;
    if (attrs.href?.trim() && !href) return false;
    const image = s.nodes['image'];
    const figure = s.nodes['figure'];
    const link = href ? [s.marks['link'].create({ href })] : [];
    const target = imageTarget(state);
    if (!target && !state.selection.$from.parent.type.contentMatch.matchType(image)) return false;
    if (dispatch) {
      const tr = state.tr;
      const wasFigure = target?.node.type === figure;
      if (target && wasFigure === !!attrs.caption) {
        // Same kind: update in place.
        const { pos } = target;
        if (wasFigure) {
          tr.setNodeMarkup(pos, undefined, { ...clean, href });
        } else {
          const marks = target.node.marks.filter((m) => m.type !== s.marks['link']).concat(link);
          tr.setNodeMarkup(pos, undefined, clean, marks);
          tr.setSelection(NodeSelection.create(tr.doc, pos));
        }
      } else if (target && wasFigure) {
        // Figure → inline image; the caption survives as a paragraph.
        const { node, pos } = target;
        const blocks = [s.nodes['paragraph'].create(null, image.create(clean, null, link))];
        if (node.content.size) blocks.push(s.nodes['paragraph'].create(null, node.content));
        tr.replaceWith(pos, pos + node.nodeSize, blocks);
        tr.setSelection(NodeSelection.create(tr.doc, pos + 1));
      } else {
        // New image or figure, or inline image → figure (the paragraph is split around it).
        if (target) tr.setSelection(NodeSelection.create(tr.doc, target.pos));
        const at = tr.selection.from;
        tr.replaceSelectionWith(attrs.caption ? figure.create({ ...clean, href }) : image.create(clean, null, link));
        if (attrs.caption) {
          // Put the cursor in the new caption, wherever splitting the paragraph placed the figure.
          const near = tr.mapping.map(at, -1);
          tr.doc.nodesBetween(Math.max(0, near - 2), Math.min(tr.doc.content.size, near + 3), (node, pos) => {
            if (node.type === figure && tr.selection.$from.parent.type !== figure) tr.setSelection(TextSelection.create(tr.doc, pos + 1));
            return !node.isTextblock;
          });
        }
      }
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

/** Sets (or with `null` clears) the background colour of the selected cells, or the cell at the cursor. */
export function weEditorSetCellBackground(color: string | null): Command {
  const safe = color ? weEditorSafeColor(color) : null;
  return (state, dispatch) => (color && !safe ? false : setCellAttr('background', safe)(state, dispatch));
}

/** Sets (or with `null` clears) the vertical alignment of the selected cells, or the cell at the cursor. */
export function weEditorSetCellAlign(align: WeEditorCellAlign | null): Command {
  return (state, dispatch) => (align && !WE_EDITOR_CELL_ALIGNS.includes(align) ? false : setCellAttr('verticalAlign', align)(state, dispatch));
}

/** Background and vertical alignment of the cell at the cursor; `null` outside tables. */
export function weEditorCellAt(state: EditorState): { background: string | null; verticalAlign: WeEditorCellAlign | null } | null {
  if (!isInTable(state)) return null;
  const cell = selectionCell(state).nodeAfter;
  return cell ? { background: cell.attrs['background'] ?? null, verticalAlign: cell.attrs['verticalAlign'] ?? null } : null;
}

function tableAround(state: EditorState): { node: PmNode; pos: number } | null {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type === s.nodes['table']) return { node, pos: $from.before(d) };
  }
  return null;
}

/** The caption of the table at the cursor (`null` when it has none, `undefined` outside tables). */
export function weEditorTableCaptionAt(state: EditorState): string | null | undefined {
  const table = tableAround(state);
  return table ? (table.node.attrs['caption'] as string | null) : undefined;
}

/** Sets the plain-text caption of the table at the cursor; empty text removes it. */
export function weEditorSetTableCaption(text: string | null): Command {
  return (state, dispatch) => {
    const table = tableAround(state);
    if (!table) return false;
    dispatch?.(state.tr.setNodeMarkup(table.pos, undefined, { ...table.node.attrs, caption: weEditorCleanCaption(text) }));
    return true;
  };
}

/** Largest table the insert command builds. */
export const WE_EDITOR_MAX_TABLE_SIZE = 50;

/** Inserts a `rows` × `cols` table (first row as header cells when `header`) and puts the cursor in it. */
export function weEditorInsertTable(rows: number, cols: number, header = true): Command {
  return (state, dispatch) => {
    const r = Math.floor(rows);
    const c = Math.floor(cols);
    if (!(r >= 1 && c >= 1 && r <= WE_EDITOR_MAX_TABLE_SIZE && c <= WE_EDITOR_MAX_TABLE_SIZE)) return false;
    const { $from } = state.selection;
    for (let d = $from.depth; d > 0; d--) if ($from.node(d).type.spec.code) return false;
    if (dispatch) {
      const cell = (type: string) => s.nodes[type].createAndFill()!;
      const table = s.nodes['table'].create(
        null,
        Array.from({ length: r }, (_, i) =>
          s.nodes['table_row'].create(null, Array.from({ length: c }, () => cell(header && i === 0 ? 'table_header' : 'table_cell')))
        )
      );
      const tr = state.tr.replaceSelectionWith(table);
      // Cursor into the first cell: find the inserted node by identity (ProseMirror keeps the instance).
      let at = -1;
      tr.doc.descendants((node, pos) => {
        if (node === table) at = pos;
        return at < 0;
      });
      if (at >= 0) tr.setSelection(TextSelection.near(tr.doc.resolve(at + 4)));
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

/** Find & replace options, as the find bar edits them. */
export interface WeEditorSearch {
  search: string;
  replace?: string;
  caseSensitive?: boolean;
  wholeWord?: boolean;
}

/** Sets (or, with an empty `search`, clears) the highlighted search query. Never changes the document. */
export function weEditorSetSearch(options: WeEditorSearch): Command {
  return (state, dispatch) => {
    if (dispatch) dispatch(setSearchState(state.tr, new SearchQuery({ ...options, literal: true })));
    return true;
  };
}

/** Largest number of matches counted for the "n of m" label. */
export const WE_EDITOR_MAX_SEARCH_COUNT = 1000;

/** Number of matches of the active query and the 1-based index of the selected one (0 = none selected). */
export function weEditorSearchCount(state: EditorState): { current: number; total: number } {
  const query = getSearchState(state)?.query;
  if (!query?.valid) return { current: 0, total: 0 };
  const { from, to } = state.selection;
  let total = 0;
  let current = 0;
  for (let pos = 0, hit = query.findNext(state, pos); hit && total < WE_EDITOR_MAX_SEARCH_COUNT; hit = query.findNext(state, pos)) {
    total++;
    if (hit.from === from && hit.to === to) current = total;
    pos = hit.to > hit.from ? hit.to : hit.to + 1;
  }
  return { current, total };
}

/** Inserts a YouTube / Vimeo video for `url`; refuses any other address. */
export function weEditorInsertEmbed(url: string): Command {
  return (state, dispatch) => {
    const src = weEditorEmbedUrl(url);
    if (!src) return false;
    const { $from } = state.selection;
    for (let d = $from.depth; d > 0; d--) if ($from.node(d).type.spec.code) return false;
    if (dispatch) dispatch(state.tr.replaceSelectionWith(s.nodes['embed'].create({ src })).scrollIntoView());
    return true;
  };
}
