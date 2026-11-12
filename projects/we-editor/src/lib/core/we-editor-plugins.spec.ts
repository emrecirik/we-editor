import { Slice } from 'prosemirror-model';
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

describe('we-editor autolink', () => {
  const key = (view: EditorView, k: string) => view.someProp('handleKeyDown', (f) => f(view, new KeyboardEvent('keydown', { key: k })));

  it('links a URL when a space follows it, without trailing punctuation', () => {
    expect(typed('', 'see https://a.com/x?q=1 ok')).toBe('<p>see <a href="https://a.com/x?q=1">https://a.com/x?q=1</a> ok</p>');
    expect(typed('', 'at www.b.org. ')).toBe('<p>at <a href="https://www.b.org">www.b.org</a>. </p>');
    expect(typed('', 'plain text ')).toBe('<p>plain text </p>');
  });

  it('leaves code alone and Backspace undoes the link', () => {
    expect(typed('<p><code>x</code></p>', 'https://a.com ')).toBe('<p><code>xhttps://a.com </code></p>');
    const view = typeInto('', 'https://a.com ');
    key(view, 'Backspace');
    expect(weEditorSerializeHtml(view.state.doc)).toBe('<p>https://a.com </p>');
    view.destroy();
  });

  it('links the URL before the cursor on Enter', () => {
    const view = typeInto('', 'https://a.com');
    key(view, 'Enter');
    expect(weEditorSerializeHtml(view.state.doc)).toBe('<p><a href="https://a.com">https://a.com</a></p><p></p>');
    view.destroy();
  });

  it('links URLs in pasted text and a URL pasted over a selection', () => {
    const view = typeInto('<p>x</p>', '');
    view.pasteText('docs at https://a.com/docs, or www.b.org');
    expect(weEditorSerializeHtml(view.state.doc)).toBe(
      '<p>xdocs at <a href="https://a.com/docs">https://a.com/docs</a>, or <a href="https://www.b.org">www.b.org</a></p>'
    );
    view.destroy();

    const state = weEditorCreateState('<p>read this</p>');
    const v2 = new EditorView(document.createElement('div'), { state: state.apply(state.tr.setSelection(TextSelection.create(state.doc, 6, 10))) });
    const data = new DataTransfer();
    data.setData('text/plain', 'https://a.com');
    v2.someProp('handlePaste', (f) => f(v2, new ClipboardEvent('paste', { clipboardData: data }), Slice.empty));
    expect(weEditorSerializeHtml(v2.state.doc)).toBe('<p>read <a href="https://a.com">this</a></p>');
    v2.destroy();
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
