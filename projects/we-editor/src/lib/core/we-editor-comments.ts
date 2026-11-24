import { suggestChangesKey } from '@handlewithcare/prosemirror-suggest-changes';
import { Fragment, MarkSpec, Node as PmNode, Slice } from 'prosemirror-model';
import { Command, EditorState, Plugin } from 'prosemirror-state';

/** A comment id: letters, digits, `_` and `-` — the only thing about a comment the HTML carries */
export const WE_EDITOR_COMMENT_ID = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * `<span data-comment-id>`: the text a comment is about. Only the id is in the document — the
 * thread itself (text, author, replies) lives in the `comments` input, so the HTML stays clean and
 * a comment's wording never reaches the page. Comments may overlap; each keeps its own mark.
 */
export const weEditorCommentMark: MarkSpec = {
  attrs: { id: { validate: 'string' } },
  inclusive: false,
  excludes: '',
  parseDOM: [
    {
      tag: 'span[data-comment-id]',
      getAttrs: (el) => {
        const id = (el as HTMLElement).getAttribute('data-comment-id') ?? '';
        return WE_EDITOR_COMMENT_ID.test(id) ? { id } : false;
      }
    }
  ],
  toDOM: (mark) => ['span', { 'data-comment-id': mark.attrs['id'] as string }, 0]
};

/** Where a comment sits in the document, and the text it covers */
export interface WeEditorCommentRange {
  id: string;
  from: number;
  to: number;
  text: string;
}

/** Every commented range, in reading order — one entry per id, from its first to its last character */
export function weEditorCommentRanges(doc: PmNode): WeEditorCommentRange[] {
  const byId = new Map<string, WeEditorCommentRange>();
  doc.descendants((node, pos) => {
    if (!node.isText) return true;
    for (const mark of node.marks) {
      if (mark.type.name !== 'comment') continue;
      const id = mark.attrs['id'] as string;
      const range = byId.get(id);
      if (range) {
        range.to = pos + node.nodeSize;
        range.text += node.text ?? '';
      } else {
        byId.set(id, { id, from: pos, to: pos + node.nodeSize, text: node.text ?? '' });
      }
    }
    return false;
  });
  return [...byId.values()].sort((a, b) => a.from - b.from);
}

/** The ids of the comments under the cursor (or the selection start) */
export function weEditorCommentsAt(state: EditorState): string[] {
  const marks = state.selection.$from.marks().concat(state.selection.$to.marks());
  return [...new Set(marks.filter((m) => m.type.name === 'comment').map((m) => m.attrs['id'] as string))];
}

/**
 * Marks the selection as commented with `id`. False on an empty selection or an id that is not
 * allowed. Not recorded as a tracked change: a comment is about the text, not an edit to it.
 */
export function weEditorAddComment(id: string): Command {
  return (state, dispatch) => {
    const { from, to, empty } = state.selection;
    const type = state.schema.marks['comment'];
    if (empty || !type || !WE_EDITOR_COMMENT_ID.test(id)) return false;
    if (dispatch) dispatch(state.tr.addMark(from, to, type.create({ id })).setMeta(suggestChangesKey, { skip: true }));
    return true;
  };
}

/** Takes comment `id` off the text; false when the document has none */
export function weEditorRemoveComment(id: string): Command {
  return (state, dispatch) => {
    const type = state.schema.marks['comment'];
    const range = weEditorCommentRanges(state.doc).find((r) => r.id === id);
    if (!type || !range) return false;
    if (dispatch) dispatch(state.tr.removeMark(range.from, range.to, type.create({ id })).setMeta(suggestChangesKey, { skip: true }));
    return true;
  };
}

/** A fresh comment id — unique enough for one document and its threads */
export function weEditorNewCommentId(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Takes comment marks off pasted content — a copied id would join two places into one thread */
export function weEditorStripComments(slice: Slice): Slice {
  const strip = (fragment: Fragment): Fragment => {
    const nodes: PmNode[] = [];
    fragment.forEach((node) => {
      const marks = node.marks.filter((m) => m.type.name !== 'comment');
      nodes.push(node.isText ? node.mark(marks) : node.copy(strip(node.content)).mark(marks));
    });
    return Fragment.fromArray(nodes);
  };
  return new Slice(strip(slice.content), slice.openStart, slice.openEnd);
}

/** The editor plugin that applies `weEditorStripComments` to every paste and drop */
export function weEditorCommentPaste(): Plugin {
  return new Plugin({ props: { transformPasted: (slice) => weEditorStripComments(slice) } });
}
