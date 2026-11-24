import { transformToSuggestionTransaction } from '@handlewithcare/prosemirror-suggest-changes';
import { EditorState, TextSelection, Transaction } from 'prosemirror-state';

import { weEditorParseHtml, weEditorSanitizeHtml, weEditorSerializeHtml } from './we-editor-html';
import { weEditorCreateState } from './we-editor-plugins';
import { weEditorChanges, weEditorReviewAll, weEditorReviewChange, weEditorSetTracking, weEditorTrackingEnabled } from './we-editor-track';

/** A state from HTML with recording on */
function tracking(html: string): EditorState {
  const state = weEditorCreateState(html);
  let next = state;
  weEditorSetTracking(true)(state, (tr) => (next = state.apply(tr)));
  return next;
}

/** Applies an edit the way the editor does while tracking: through the suggestion transform */
function edit(state: EditorState, make: (tr: Transaction) => Transaction): EditorState {
  return state.apply(transformToSuggestionTransaction(make(state.tr), state));
}

function run(state: EditorState, command: (s: EditorState, d?: (tr: Transaction) => void) => boolean): EditorState {
  let next = state;
  command(state, (tr) => (next = state.apply(tr)));
  return next;
}

const html = (state: EditorState): string => weEditorSerializeHtml(state.doc);

describe('track changes', () => {
  it('records typing as an insertion and a deletion as struck-through text that stays', () => {
    let state = tracking('<p>Hello world</p>');
    expect(weEditorTrackingEnabled(state)).toBeTrue();
    state = edit(state, (tr) => tr.insertText(' big', 6));
    state = edit(state, (tr) => tr.delete(1, 6));
    expect(html(state)).toContain('<ins data-id="');
    expect(html(state)).toContain('<del data-id="');
    expect(state.doc.textContent).toBe('Hello big world');
    expect(weEditorChanges(state.doc).map((c) => [c.kind, c.text])).toEqual([
      ['deletion', 'Hello'],
      ['insertion', ' big']
    ]);
  });

  it('accepts or rejects the change under the cursor', () => {
    let state = tracking('<p>Hello world</p>');
    state = edit(state, (tr) => tr.insertText('!', 12));
    state = edit(state, (tr) => tr.delete(1, 6));
    // Cursor at the insertion: accepting keeps "!" as plain text
    state = state.apply(state.tr.setSelection(TextSelection.create(state.doc, 13)));
    state = run(state, weEditorReviewChange(true));
    expect(weEditorChanges(state.doc).map((c) => c.kind)).toEqual(['deletion']);
    // Rejecting the deletion brings "Hello" back as plain text
    state = state.apply(state.tr.setSelection(TextSelection.create(state.doc, 2)));
    state = run(state, weEditorReviewChange(false));
    expect(weEditorChanges(state.doc)).toEqual([]);
    expect(html(state)).toBe('<p>Hello world!</p>');
  });

  it('joins a deletion and the text typed right after it into one replacement, reviewed together', () => {
    let state = tracking('<p>Hello world</p>');
    state = edit(state, (tr) => tr.delete(1, 6));
    state = edit(state, (tr) => tr.insertText('Hi', 6));
    const changes = weEditorChanges(state.doc);
    expect(new Set(changes.map((c) => c.id)).size).toBe(1);
    state = state.apply(state.tr.setSelection(TextSelection.create(state.doc, 7)));
    state = run(state, weEditorReviewChange(true));
    expect(html(state)).toBe('<p>Hi world</p>');
  });

  it('accepts every change at once — deleted text goes, inserted text stays', () => {
    let state = tracking('<p>Hello world</p>');
    state = edit(state, (tr) => tr.insertText('!', 12));
    state = edit(state, (tr) => tr.delete(1, 7));
    state = run(state, weEditorReviewAll(true));
    expect(html(state)).toBe('<p>world!</p>');
    expect(weEditorReviewAll(true)(state)).toBeFalse();
  });

  it('has nothing to review away from a change', () => {
    const state = tracking('<p>Hello</p>');
    expect(weEditorReviewChange(true)(state)).toBeFalse();
  });

  it('tracks edits inside a code block too', () => {
    let state = tracking('<pre><code>let a = 1;</code></pre>');
    state = edit(state, (tr) => tr.insertText('2', 9));
    expect(weEditorChanges(state.doc).map((c) => c.kind)).toEqual(['insertion']);
  });
});

describe('track changes — whole blocks', () => {
  /** The position just before the first node of the given type */
  const before = (state: EditorState, type: string): number => {
    let at = -1;
    state.doc.descendants((node, pos) => {
      if (at === -1 && node.type.name === type) at = pos;
      return at === -1;
    });
    return at;
  };

  it('suggests deleting a whole list item without breaking the list', () => {
    let state = tracking('<ul><li><p>one</p></li><li><p>two</p></li></ul>');
    const from = before(state, 'list_item');
    const item = state.doc.nodeAt(from)!;
    expect(() => (state = edit(state, (tr) => tr.delete(from, from + item.nodeSize)))).not.toThrow();
    expect(weEditorChanges(state.doc).map((c) => c.kind)).toContain('deletion');
    expect(state.doc.textContent).toBe('onetwo');
  });

  it('suggests re-aligning a paragraph inside a quote, and ticking a task', () => {
    let state = tracking('<blockquote><p>quoted</p></blockquote><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>task</p></li></ul>');
    const para = before(state, 'paragraph');
    expect(() => (state = edit(state, (tr) => tr.setNodeMarkup(para, undefined, { ...state.doc.nodeAt(para)!.attrs, align: 'center' })))).not.toThrow();
    const task = before(state, 'task_item');
    expect(() => (state = edit(state, (tr) => tr.setNodeMarkup(task, undefined, { ...state.doc.nodeAt(task)!.attrs, checked: true })))).not.toThrow();
    expect(weEditorChanges(state.doc).filter((c) => c.kind === 'modification').length).toBe(2);
  });

  it('writes no old value into the HTML when a format changes while tracking', () => {
    let state = tracking('<p>plain text</p>');
    state = edit(state, (tr) => tr.addMark(1, 6, state.schema.marks['bold'].create()));
    const out = html(state);
    // Re-formatted text is suggested as a replacement: the old run deleted, the bold one inserted
    expect(out).toMatch(/<del data-id="(\d+)">plain<\/del><strong><ins data-id="\1">plain<\/ins><\/strong>/);
    expect(out).not.toContain('data-mod');
    expect(out).not.toContain('data-type="modification"');
  });

  it('writes only the id on <ins> and <del>', () => {
    let state = tracking('<p>Hello</p>');
    state = edit(state, (tr) => tr.insertText('!', 6));
    expect(html(state)).toMatch(/<ins data-id="\d+">!<\/ins>/);
  });
});

describe('track changes — reading HTML', () => {
  it('reads suggestions back from <ins data-id> / <del data-id>', () => {
    const doc = weEditorParseHtml('<p>a<ins data-id="3">b</ins><del data-id="4">c</del></p>');
    expect(weEditorChanges(doc).map((c) => [c.id, c.kind, c.text])).toEqual([
      [3, 'insertion', 'b'],
      [4, 'deletion', 'c']
    ]);
  });

  it('keeps a plain <del> as strikethrough and ignores ids that are not plain numbers', () => {
    expect(weEditorSanitizeHtml('<p><del>old</del></p>')).toBe('<p><s>old</s></p>');
    for (const id of ['x', '{"a":1}', '1e3', '-1', '"1"', '']) {
      expect(() => weEditorParseHtml(`<p><ins data-id='${id}'>t</ins></p>`)).not.toThrow();
      expect(weEditorChanges(weEditorParseHtml(`<p><ins data-id='${id}'>t</ins></p>`))).toEqual([]);
    }
  });

  it('never reads a modification from HTML — its old value could be anything', () => {
    const doc = weEditorParseHtml(`<p><a href="https://example.com"><span data-type="modification" data-id="1" data-mod-type="attr" data-mod-prev-val='"javascript:alert(1)"'>x</span></a></p>`);
    expect(weEditorChanges(doc)).toEqual([]);
    expect(weEditorSerializeHtml(doc)).not.toContain('javascript');
  });
});
