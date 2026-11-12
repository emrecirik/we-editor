import { findNext, replaceAll } from 'prosemirror-search';
import { Command, EditorState, NodeSelection, TextSelection } from 'prosemirror-state';

import {
  weEditorClearFormatting,
  weEditorIndent,
  weEditorLinkAt,
  weEditorOutdent,
  weEditorRemoveLink,
  weEditorSetAlign,
  weEditorSetBlock,
  weEditorInsertEmbed,
  weEditorInsertTable,
  weEditorSearchCount,
  weEditorSetSearch,
  weEditorSetImage,
  weEditorSetLink,
  weEditorSetStyle,
  weEditorToggleList,
  weEditorToggleMark
} from './we-editor-commands';
import { weEditorSerializeHtml } from './we-editor-html';
import { weEditorCreateState } from './we-editor-plugins';
import { weEditorSchema } from './we-editor-schema';

/** Creates a state for `html` with the selection from..to (document positions). */
function stateOf(html: string, from: number, to = from): EditorState {
  const state = weEditorCreateState(html);
  return state.apply(state.tr.setSelection(TextSelection.create(state.doc, from, to)));
}

/** Runs `command` and returns the resulting HTML, or null when the command refused. */
function run(state: EditorState, command: Command): string | null {
  let next = state;
  const ok = command(state, (tr) => (next = state.apply(tr)));
  return ok ? weEditorSerializeHtml(next.doc) : null;
}

describe('we-editor commands', () => {
  it('toggles a mark on the selection', () => {
    expect(run(stateOf('<p>hello</p>', 1, 6), weEditorToggleMark(weEditorSchema.marks['bold']))).toBe('<p><strong>hello</strong></p>');
    expect(run(stateOf('<p><strong>hello</strong></p>', 1, 6), weEditorToggleMark(weEditorSchema.marks['bold']))).toBe('<p>hello</p>');
  });

  it('sets a heading and back to a paragraph', () => {
    expect(run(stateOf('<p>t</p>', 1), weEditorSetBlock(3))).toBe('<h3>t</h3>');
    expect(run(stateOf('<h3>t</h3>', 1), weEditorSetBlock(0))).toBe('<p>t</p>');
  });

  it('aligns, and stores left as no style', () => {
    expect(run(stateOf('<p>t</p>', 1), weEditorSetAlign('right'))).toBe('<p style="text-align: right;">t</p>');
    expect(run(stateOf('<p style="text-align: right">t</p>', 1), weEditorSetAlign('left'))).toBe('<p>t</p>');
  });

  it('indents and outdents a paragraph within limits', () => {
    expect(run(stateOf('<p>t</p>', 1), weEditorIndent)).toBe('<p style="margin-left: 40px;">t</p>');
    expect(run(stateOf('<p style="margin-left: 40px">t</p>', 1), weEditorOutdent)).toBe('<p>t</p>');
    expect(run(stateOf('<p>t</p>', 1), weEditorOutdent)).toBeNull();
  });

  it('wraps in a list, converts bullet to numbered, and lifts out', () => {
    const bullet = run(stateOf('<p>a</p>', 1), weEditorToggleList('bullet_list'));
    expect(bullet).toBe('<ul><li><p>a</p></li></ul>');
    expect(run(stateOf(bullet!, 3), weEditorToggleList('ordered_list'))).toBe('<ol><li><p>a</p></li></ol>');
    expect(run(stateOf(bullet!, 3), weEditorToggleList('bullet_list'))).toBe('<p>a</p>');
  });

  it('creates a task list', () => {
    expect(run(stateOf('<p>a</p>', 1), weEditorToggleList('task_list'))).toContain('<li data-type="taskItem" data-checked="false">');
  });

  it('sets and removes a style value, and refuses an invalid one', () => {
    expect(run(stateOf('<p>ab</p>', 1, 3), weEditorSetStyle('text_color', '#00ff00'))).toBe('<p><span style="color: rgb(0, 255, 0);">ab</span></p>');
    expect(run(stateOf('<p><span style="color: #00ff00">ab</span></p>', 1, 3), weEditorSetStyle('text_color', null))).toBe('<p>ab</p>');
    expect(run(stateOf('<p>ab</p>', 1, 3), weEditorSetStyle('font_size', '12px;x'))).toBeNull();
  });

  it('links the selection and refuses javascript: URLs', () => {
    expect(run(stateOf('<p>ab</p>', 1, 3), weEditorSetLink('https://a.com'))).toBe('<p><a href="https://a.com">ab</a></p>');
    expect(run(stateOf('<p>ab</p>', 1, 3), weEditorSetLink('javascript:alert(1)'))).toBeNull();
  });

  it('inserts the URL as text when nothing is selected', () => {
    expect(run(stateOf('<p>x</p>', 2), weEditorSetLink('https://a.com', '_blank'))).toBe(
      '<p>x<a href="https://a.com" target="_blank" rel="noopener noreferrer">https://a.com</a></p>'
    );
  });

  it('updates and removes the whole link around the cursor', () => {
    const html = '<p>x<a href="https://a.com">link</a>y</p>';
    expect(weEditorLinkAt(stateOf(html, 4))).toBe('https://a.com');
    expect(run(stateOf(html, 4), weEditorSetLink('https://b.com'))).toBe('<p>x<a href="https://b.com">link</a>y</p>');
    expect(run(stateOf(html, 4), weEditorRemoveLink)).toBe('<p>xlinky</p>');
  });

  it('inserts an image and refuses unsafe sources or code blocks', () => {
    expect(run(stateOf('<p>ab</p>', 2), weEditorSetImage({ src: 'a.png', alt: ' A ', width: 99.6, align: 'center' }))).toBe(
      '<p>a<img src="a.png" alt="A" width="100" style="display: block; margin-left: auto; margin-right: auto;">b</p>'
    );
    expect(run(stateOf('<p>ab</p>', 2), weEditorSetImage({ src: 'javascript:alert(1)' }))).toBeNull();
    expect(run(stateOf('<pre><code>ab</code></pre>', 2), weEditorSetImage({ src: 'a.png' }))).toBeNull();
  });

  it('updates the selected image', () => {
    const state = weEditorCreateState('<p>a<img src="a.png">b</p>');
    const selected = state.apply(state.tr.setSelection(NodeSelection.create(state.doc, 2)));
    expect(run(selected, weEditorSetImage({ src: 'b.png', width: 50 }))).toBe('<p>a<img src="b.png" width="50">b</p>');
  });

  it('inserts a table with a header row and puts the cursor in its first cell', () => {
    const state = stateOf('<p>ab</p>', 3);
    let next = state;
    expect(weEditorInsertTable(2, 2)(state, (tr) => (next = state.apply(tr)))).toBeTrue();
    expect(weEditorSerializeHtml(next.doc)).toBe(
      '<p>ab</p><table><tbody><tr><th><p></p></th><th><p></p></th></tr><tr><td><p></p></td><td><p></p></td></tr></tbody></table>'
    );
    expect(next.selection.$from.node(-1).type.name).toBe('table_header');
    expect(run(stateOf('<p>a</p>', 2), weEditorInsertTable(1, 2, false))).toBe('<p>a</p><table><tbody><tr><td><p></p></td><td><p></p></td></tr></tbody></table>');
  });

  it('refuses empty, oversized or code-block tables', () => {
    expect(run(stateOf('<p>a</p>', 1), weEditorInsertTable(0, 3))).toBeNull();
    expect(run(stateOf('<p>a</p>', 1), weEditorInsertTable(51, 3))).toBeNull();
    expect(run(stateOf('<pre><code>a</code></pre>', 1), weEditorInsertTable(2, 2))).toBeNull();
  });

  it('counts, steps through and replaces search matches', () => {
    let state = weEditorCreateState('<p>Cat cat <strong>cat</strong>alog</p>');
    const apply = (cmd: Command) => cmd(state, (tr) => (state = state.apply(tr)));
    apply(weEditorSetSearch({ search: 'cat', replace: 'dog' }));
    expect(weEditorSearchCount(state)).toEqual({ current: 0, total: 3 });
    apply(findNext);
    expect(weEditorSearchCount(state)).toEqual({ current: 1, total: 3 });
    apply(weEditorSetSearch({ search: 'cat', replace: 'dog', caseSensitive: true, wholeWord: true }));
    expect(weEditorSearchCount(state).total).toBe(1);
    apply(replaceAll);
    expect(weEditorSerializeHtml(state.doc)).toBe('<p>Cat dog <strong>cat</strong>alog</p>');
    apply(weEditorSetSearch({ search: '' }));
    expect(weEditorSearchCount(state)).toEqual({ current: 0, total: 0 });
  });

  it('treats the search text literally, not as a pattern', () => {
    let state = weEditorCreateState('<p>a.c abc</p>');
    weEditorSetSearch({ search: 'a.c' })(state, (tr) => (state = state.apply(tr)));
    expect(weEditorSearchCount(state).total).toBe(1);
  });

  it('inserts a video embed only for supported addresses', () => {
    expect(run(stateOf('<p>a</p>', 2), weEditorInsertEmbed('https://youtu.be/dQw4w9WgXcQ'))).toBe('<p>a</p><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" width="560" height="315" frameborder="0" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen="true" referrerpolicy="strict-origin-when-cross-origin"></iframe>');
    expect(run(stateOf('<p>a</p>', 2), weEditorInsertEmbed('https://evil.com/v.mp4'))).toBeNull();
  });

  it('clears marks and block styles', () => {
    expect(run(stateOf('<p style="text-align: center"><strong>a</strong></p>', 1, 2), weEditorClearFormatting)).toBe('<p>a</p>');
  });
});
