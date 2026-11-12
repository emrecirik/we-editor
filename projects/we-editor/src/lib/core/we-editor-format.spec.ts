import { weEditorFormatHtml } from './we-editor-format';
import { weEditorSanitizeHtml } from './we-editor-html';
import { weEditorCreateSourceEditor } from './we-editor-source';

describe('weEditorFormatHtml', () => {
  it('puts blocks on their own lines and indents nested blocks', () => {
    expect(weEditorFormatHtml('<h1>T</h1><ul><li><p>a <b>b</b></p></li></ul>')).toBe(
      ['<h1>T</h1>', '<ul>', '  <li>', '    <p>a <b>b</b></p>', '  </li>', '</ul>'].join('\n')
    );
  });

  it('keeps <pre> and inline whitespace as they are', () => {
    const pre = '<pre><code>a\n  b</code></pre>';
    expect(weEditorFormatHtml(pre)).toBe(pre);
    expect(weEditorFormatHtml('<div>x <i>y</i> z<p>p</p></div>')).toBe(['<div>', '  x <i>y</i> z', '  <p>p</p>', '</div>'].join('\n'));
  });

  it('round-trips editor HTML unchanged through the schema', () => {
    const html = weEditorSanitizeHtml(
      '<h2>H</h2><p>a&nbsp;b &amp; c &lt;d&gt;</p><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><div><p>t</p></div></li></ul>' +
        '<table><tbody><tr><th><p>A</p></th></tr><tr><td><p>1</p></td></tr></tbody></table><blockquote><p>q</p></blockquote><hr>'
    );
    expect(weEditorSanitizeHtml(weEditorFormatHtml(html))).toBe(html);
  });

  it('never executes or loads what it formats', () => {
    const spy = jasmine.createSpy('onerror');
    (window as unknown as Record<string, unknown>)['weFormatProbe'] = spy;
    const out = weEditorFormatHtml('<p><img src="x" onerror="weFormatProbe()"></p><script>weFormatProbe()</script>');
    expect(spy).not.toHaveBeenCalled();
    expect(typeof out).toBe('string');
    delete (window as unknown as Record<string, unknown>)['weFormatProbe'];
  });
});

describe('weEditorCreateSourceEditor', () => {
  it('reports user edits, not setText, and honours read-only', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const changes: string[] = [];
    const editor = await weEditorCreateSourceEditor(host, { text: '<p>a</p>', readOnly: false, label: 'HTML', onChange: (t) => changes.push(t) });
    expect(host.querySelector('.cm-content')?.getAttribute('aria-label')).toBe('HTML');
    expect(editor.getText()).toBe('<p>a</p>');
    editor.setText('<p>b</p>');
    expect(changes).toEqual([]);
    const { EditorView } = await import('@codemirror/view');
    const view = EditorView.findFromDOM(host)!;
    view.dispatch({ changes: { from: 0, insert: '<h1>x</h1>' } });
    expect(changes).toEqual(['<h1>x</h1><p>b</p>']);
    editor.setReadOnly(true);
    expect(view.state.readOnly).toBeTrue();
    editor.destroy();
    host.remove();
  });
});
