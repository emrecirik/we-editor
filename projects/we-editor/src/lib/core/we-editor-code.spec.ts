import { EditorState, TextSelection } from 'prosemirror-state';

import { weEditorCodeHighlight, weEditorCodeLanguageAt, weEditorSetCodeLanguage } from './we-editor-code';
import { weEditorSanitizeHtml, weEditorSerializeHtml } from './we-editor-html';
import { weEditorCreateState } from './we-editor-plugins';
import { weEditorSafeCodeLanguage } from './we-editor-schema';

function stateOf(html: string, pos = 1): EditorState {
  const state = weEditorCreateState(html);
  return state.apply(state.tr.setSelection(TextSelection.create(state.doc, pos)));
}

describe('we-editor code blocks', () => {
  it('keeps the language class on the way in and out', () => {
    expect(weEditorSanitizeHtml('<pre><code class="language-TypeScript">let a = 1;</code></pre>')).toBe(
      '<pre><code class="language-typescript">let a = 1;</code></pre>'
    );
    expect(weEditorSanitizeHtml('<pre data-language="sql">select 1</pre>')).toBe('<pre><code class="language-sql">select 1</code></pre>');
    expect(weEditorSanitizeHtml('<pre><code>plain</code></pre>')).toBe('<pre><code>plain</code></pre>');
  });

  it('drops language values that are not a plain identifier', () => {
    expect(weEditorSafeCodeLanguage('c++')).toBe('c++');
    expect(weEditorSafeCodeLanguage('x" onmouseover="alert(1)')).toBeNull();
    expect(weEditorSafeCodeLanguage('<script>')).toBeNull();
    expect(weEditorSafeCodeLanguage('a'.repeat(40))).toBeNull();
    const html = weEditorSanitizeHtml('<pre data-language="&quot; onclick=&quot;x"><code>a</code></pre>');
    expect(html).toBe('<pre><code>a</code></pre>');
  });

  it('sets and clears the language of the code block at the cursor', () => {
    let state = stateOf('<pre><code>x</code></pre>');
    expect(weEditorCodeLanguageAt(state)).toBeNull();
    weEditorSetCodeLanguage('python')(state, (tr) => (state = state.apply(tr)));
    expect(weEditorSerializeHtml(state.doc)).toBe('<pre><code class="language-python">x</code></pre>');
    expect(weEditorCodeLanguageAt(state)).toBe('python');
    weEditorSetCodeLanguage(null)(state, (tr) => (state = state.apply(tr)));
    expect(weEditorSerializeHtml(state.doc)).toBe('<pre><code>x</code></pre>');
    expect(weEditorSetCodeLanguage('bad lang')(state)).toBeFalse();
    expect(weEditorSetCodeLanguage('css')(stateOf('<p>x</p>'))).toBeFalse();
    expect(weEditorCodeLanguageAt(stateOf('<p>x</p>'))).toBeUndefined();
  });

  it('decorates tokens of known languages only', () => {
    const classes = (html: string): string[] => {
      const state = weEditorCreateState(html);
      const set = weEditorCodeHighlight().getState(state)!;
      return set.find().map((d) => (d as unknown as { type: { attrs: { class: string } } }).type.attrs.class);
    };
    expect(classes('<pre><code class="language-javascript">const a = "x"; // c</code></pre>')).toEqual(
      jasmine.arrayContaining(['hljs-keyword', 'hljs-string', 'hljs-comment'])
    );
    expect(classes('<pre><code class="language-html">&lt;b&gt;x&lt;/b&gt;</code></pre>')).toContain('hljs-name');
    expect(classes('<pre><code class="language-unknown">const a = 1</code></pre>')).toEqual([]);
    expect(classes('<pre><code>const a = 1</code></pre>')).toEqual([]);
  });
});
