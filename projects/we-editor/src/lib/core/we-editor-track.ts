import {
  applySuggestion,
  applySuggestions,
  deletion,
  disableSuggestChanges,
  enableSuggestChanges,
  insertion,
  isSuggestChangesEnabled,
  modification,
  revertSuggestion,
  revertSuggestions,
  suggestChangesKey
} from '@handlewithcare/prosemirror-suggest-changes';
import { DOMOutputSpec, Mark, MarkSpec, Node as PmNode } from 'prosemirror-model';
import { Command, EditorState, Transaction } from 'prosemirror-state';

// Track changes rides on @handlewithcare/prosemirror-suggest-changes (MIT). Its marks are wrapped
// here: the library reads `data-id` with JSON.parse and a modification's old value straight from the
// HTML — a damaged file would throw, and "reject" would write an unchecked value back into a node
// (a link's href, say). So only a plain number is read as an id, and modifications are never read
// from HTML: they exist while editing and leave the HTML as their current value.
const suggestionId = (el: HTMLElement): { id: number } | false => {
  const raw = el.getAttribute('data-id') ?? '';
  return /^\d{1,9}$/.test(raw) ? { id: Number(raw) } : false;
};

/** The HTML of a suggestion: its tag and id, shown as a block when it marks a whole block */
const suggestionDom =
  (tag: 'ins' | 'del') =>
  (mark: Mark, inline: boolean): DOMOutputSpec =>
    [tag, inline ? { 'data-id': String(mark.attrs['id']) } : { 'data-id': String(mark.attrs['id']), style: 'display: block' }, 0];

/** `<ins data-id>`: text suggested for insertion */
export const weEditorInsertionMark: MarkSpec = {
  ...insertion,
  toDOM: suggestionDom('ins'),
  parseDOM: [{ tag: 'ins[data-id]', priority: 60, getAttrs: (el) => suggestionId(el as HTMLElement) }]
};
/** `<del data-id>`: text suggested for deletion — a plain `<del>` stays strikethrough */
export const weEditorDeletionMark: MarkSpec = {
  ...deletion,
  toDOM: suggestionDom('del'),
  parseDOM: [{ tag: 'del[data-id]', priority: 60, getAttrs: (el) => suggestionId(el as HTMLElement) }]
};
/**
 * A changed mark or attribute, while editing only: it writes no data into the HTML (the old value
 * would leak, and is never read back), so the value shows the change as made.
 */
export const weEditorModificationMark: MarkSpec = {
  ...modification,
  toDOM: (_mark, inline) => [inline ? 'span' : 'div', 0],
  parseDOM: []
};

export const WE_EDITOR_SUGGESTION_MARKS = 'insertion deletion modification';

/** Whether typing is recorded as suggestions */
export function weEditorTrackingEnabled(state: EditorState): boolean {
  return !!suggestChangesKey.getState(state) && isSuggestChangesEnabled(state);
}

/** Turns recording on or off */
export function weEditorSetTracking(on: boolean): Command {
  return on ? enableSuggestChanges : disableSuggestChanges;
}

/** One suggested change, for a review list */
export interface WeEditorChange {
  id: number;
  kind: 'insertion' | 'deletion' | 'modification';
  /** The text it covers — empty for a change to a block or an image */
  text: string;
  from: number;
  to: number;
}

/** Every suggested change in the document, in reading order; one entry per id and kind */
export function weEditorChanges(doc: PmNode): WeEditorChange[] {
  const byKey = new Map<string, WeEditorChange>();
  doc.descendants((node, pos) => {
    for (const mark of node.marks) {
      const kind = mark.type.name;
      if (kind !== 'insertion' && kind !== 'deletion' && kind !== 'modification') continue;
      const key = `${kind}:${mark.attrs['id']}`;
      const end = pos + node.nodeSize;
      const change = byKey.get(key);
      if (change) {
        change.to = end;
        if (node.isText) change.text += node.text;
      } else {
        byKey.set(key, { id: Number(mark.attrs['id']), kind, text: node.isText ? (node.text ?? '') : '', from: pos, to: end });
      }
    }
    return true;
  });
  return [...byKey.values()].sort((a, b) => a.from - b.from);
}

/** The ids of the changes the selection touches — under the cursor when nothing is selected */
function idsAtSelection(state: EditorState): number[] {
  const { from, to, empty } = state.selection;
  return [...new Set(weEditorChanges(state.doc).filter((c) => (empty ? c.from <= from && from <= c.to : c.from < to && c.to > from)).map((c) => c.id))];
}

/**
 * Accepts (or rejects) the changes the selection touches, or the one under the cursor — as one
 * undo step. False when there is none.
 */
export function weEditorReviewChange(accept: boolean): Command {
  return (state, dispatch) => {
    const ids = idsAtSelection(state);
    if (!ids.length) return false;
    if (!dispatch) return true;
    const out = state.tr;
    let current = state;
    for (const id of ids) {
      const command = accept ? applySuggestion(id) : revertSuggestion(id);
      command(current, (tr: Transaction) => {
        for (const step of tr.steps) out.step(step);
        current = current.apply(tr);
      });
    }
    dispatch(out.setMeta(suggestChangesKey, { skip: true }).scrollIntoView());
    return true;
  };
}

/** Accepts (or rejects) every change in the document */
export function weEditorReviewAll(accept: boolean): Command {
  return (state, dispatch) => {
    if (!weEditorChanges(state.doc).length) return false;
    return accept ? applySuggestions(state, dispatch) : revertSuggestions(state, dispatch);
  };
}
