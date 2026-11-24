import { EditorState, TextSelection } from 'prosemirror-state';

import { weEditorAddComment, weEditorCommentRanges, weEditorCommentsAt, weEditorNewCommentId, weEditorRemoveComment, weEditorStripComments, WE_EDITOR_COMMENT_ID } from './we-editor-comments';
import { weEditorParseHtml, weEditorSanitizeHtml, weEditorSerializeHtml } from './we-editor-html';
import { weEditorCreateState } from './we-editor-plugins';
import { weEditorChanges, weEditorSetTracking } from './we-editor-track';

function select(state: EditorState, from: number, to: number): EditorState {
  return state.apply(state.tr.setSelection(TextSelection.create(state.doc, from, to)));
}

function run(state: EditorState, command: (s: EditorState, d?: (tr: import('prosemirror-state').Transaction) => void) => boolean): EditorState {
  let next = state;
  command(state, (tr) => (next = state.apply(tr)));
  return next;
}

describe('comments', () => {
  it('marks the selection with an id that only the HTML carries', () => {
    let state = select(weEditorCreateState('<p>Hello brave world</p>'), 7, 12);
    state = run(state, weEditorAddComment('c1'));
    expect(weEditorSerializeHtml(state.doc)).toBe('<p>Hello <span data-comment-id="c1">brave</span> world</p>');
    expect(weEditorCommentRanges(state.doc)).toEqual([{ id: 'c1', from: 7, to: 12, text: 'brave' }]);
    expect(weEditorCommentsAt(select(state, 9, 9))).toEqual(['c1']);
  });

  it('lets comments overlap, and takes one off without touching the other', () => {
    let state = select(weEditorCreateState('<p>Hello brave world</p>'), 1, 12);
    state = run(state, weEditorAddComment('a'));
    state = run(select(state, 7, 18), weEditorAddComment('b'));
    expect(weEditorCommentRanges(state.doc).map((r) => [r.id, r.text])).toEqual([
      ['a', 'Hello brave'],
      ['b', 'brave world']
    ]);
    state = run(state, weEditorRemoveComment('a'));
    expect(weEditorCommentRanges(state.doc).map((r) => r.id)).toEqual(['b']);
    expect(weEditorRemoveComment('a')(state)).toBeFalse();
  });

  it('needs a selection and an allowed id', () => {
    const state = weEditorCreateState('<p>Hello</p>');
    expect(weEditorAddComment('c1')(state)).toBeFalse();
    expect(weEditorAddComment('bad id"')(select(state, 1, 3))).toBeFalse();
    expect(WE_EDITOR_COMMENT_ID.test(weEditorNewCommentId())).toBeTrue();
  });

  it('is not recorded as a tracked change', () => {
    let state = weEditorCreateState('<p>Hello world</p>');
    state = run(state, weEditorSetTracking(true));
    state = run(select(state, 1, 6), weEditorAddComment('c1'));
    expect(weEditorChanges(state.doc)).toEqual([]);
    expect(weEditorCommentRanges(state.doc).length).toBe(1);
  });

  it('reads comment marks back from HTML, and drops ids that are not plain', () => {
    expect(weEditorCommentRanges(weEditorParseHtml('<p>a <span data-comment-id="x_1-2">b</span></p>')).map((r) => r.id)).toEqual(['x_1-2']);
    for (const id of ['', 'a b', '"><script>', 'x'.repeat(65)]) {
      const html = weEditorSanitizeHtml(`<p><span data-comment-id='${id}'>t</span></p>`);
      expect(html).toBe('<p>t</p>');
    }
  });

  it('takes comment marks off pasted content, keeping the text and its other marks', () => {
    const doc = weEditorParseHtml('<p><strong><span data-comment-id="c1">bold</span></strong> plain</p>');
    const pasted = weEditorStripComments(doc.slice(1, doc.content.size - 1));
    expect(weEditorCommentRanges(doc).length).toBe(1);
    let text = '';
    let bold = false;
    pasted.content.descendants((node) => {
      if (node.isText) {
        text += node.text;
        if (node.marks.some((m) => m.type.name === 'bold')) bold = true;
        expect(node.marks.some((m) => m.type.name === 'comment')).toBeFalse();
      }
    });
    expect(text).toBe('bold plain');
    expect(bold).toBeTrue();
  });
});
