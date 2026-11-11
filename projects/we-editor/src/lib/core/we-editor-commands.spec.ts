import { Command, EditorState, TextSelection } from 'prosemirror-state';

import {
  weEditorClearFormatting,
  weEditorIndent,
  weEditorLinkAt,
  weEditorOutdent,
  weEditorRemoveLink,
  weEditorSetAlign,
  weEditorSetBlock,
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

  it('clears marks and block styles', () => {
    expect(run(stateOf('<p style="text-align: center"><strong>a</strong></p>', 1, 2), weEditorClearFormatting)).toBe('<p>a</p>');
  });
});
