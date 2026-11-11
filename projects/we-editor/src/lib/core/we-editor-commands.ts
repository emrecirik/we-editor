import { chainCommands, exitCode, lift, setBlockType, toggleMark, wrapIn } from 'prosemirror-commands';
import { Mark, MarkType, Node as PmNode, NodeType } from 'prosemirror-model';
import { liftListItem, sinkListItem, wrapInList } from 'prosemirror-schema-list';
import { Command, EditorState, TextSelection } from 'prosemirror-state';

import {
  WE_EDITOR_MAX_INDENT,
  WeEditorAlign,
  weEditorSafeColor,
  weEditorSafeFontFamily,
  weEditorSafeFontSize,
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
