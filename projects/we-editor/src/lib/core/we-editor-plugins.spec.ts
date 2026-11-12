import { TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { weEditorSerializeHtml } from './we-editor-html';
import { weEditorCreateState, weEditorStats } from './we-editor-plugins';

/** Types `text` character by character at the end of the first block, as the browser would. */
function typeInto(html: string, text: string): EditorView {
  const state = weEditorCreateState(html);
  const view = new EditorView(document.createElement('div'), {
    state: state.apply(state.tr.setSelection(TextSelection.atEnd(state.doc)))
  });
  for (const ch of text) {
    const { from, to } = view.state.selection;
    const handled = view.someProp('handleTextInput', (f) => f(view, from, to, ch, () => view.state.tr.insertText(ch, from, to)));
    if (!handled) view.dispatch(view.state.tr.insertText(ch, from, to));
  }
  return view;
}

function typed(html: string, text: string): string {
  const view = typeInto(html, text);
  const out = weEditorSerializeHtml(view.state.doc);
  view.destroy();
  return out;
}

describe('we-editor input rules', () => {
  it('turns "## " into a heading', () => {
    expect(typed('', '## Title')).toBe('<h2>Title</h2>');
    expect(typed('', '####### x')).toBe('<p>####### x</p>');
  });

  it('turns "- ", "* " and "1. " into lists', () => {
    expect(typed('', '- a')).toBe('<ul><li><p>a</p></li></ul>');
    expect(typed('', '* a')).toBe('<ul><li><p>a</p></li></ul>');
    expect(typed('', '3. a')).toBe('<ol start="3"><li><p>a</p></li></ol>');
  });

  it('turns "> " into a quote and ``` into a code block', () => {
    expect(typed('', '> q')).toBe('<blockquote><p>q</p></blockquote>');
    expect(typed('', '```x')).toBe('<pre><code>x</code></pre>');
  });

  it('only fires at the start of a block and not inside code', () => {
    expect(typed('<p>a</p>', ' # b')).toBe('<p>a # b</p>');
    expect(typed('<pre><code></code></pre>', '# x')).toBe('<pre><code># x</code></pre>');
  });

  it('Backspace right after a rule restores the typed text', () => {
    const view = typeInto('', '# ');
    expect(weEditorSerializeHtml(view.state.doc)).toBe('<h1></h1>');
    view.someProp('handleKeyDown', (f) => f(view, new KeyboardEvent('keydown', { key: 'Backspace' })));
    expect(weEditorSerializeHtml(view.state.doc)).toBe('<p># </p>');
    view.destroy();
  });
});

describe('we-editor table keymap', () => {
  it('Tab moves to the next cell', () => {
    const state = weEditorCreateState('<table><tr><td><p>a</p></td><td><p>b</p></td></tr></table>');
    const view = new EditorView(document.createElement('div'), {
      state: state.apply(state.tr.setSelection(TextSelection.create(state.doc, 4)))
    });
    view.someProp('handleKeyDown', (f) => f(view, new KeyboardEvent('keydown', { key: 'Tab' })));
    expect(view.state.selection.$from.parent.textContent).toBe('b');
    view.destroy();
  });
});

describe('weEditorStats', () => {
  it('counts words and characters across blocks', () => {
    const doc = weEditorCreateState('<p>Merhaba dünya</p><ul><li><p>bir</p></li></ul>').doc;
    expect(weEditorStats(doc)).toEqual({ words: 3, characters: 16 });
  });

  it('is zero for an empty document', () => {
    expect(weEditorStats(weEditorCreateState('').doc)).toEqual({ words: 0, characters: 0 });
  });
});
