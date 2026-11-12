import { weEditorParseHtml, weEditorSanitizeHtml, weEditorSerializeHtml } from './we-editor-html';
import { weEditorSafeColor, weEditorSafeFontSize, weEditorSafeUrl } from './we-editor-schema';

describe('weEditorSafeUrl', () => {
  it('allows http(s), mailto, tel and relative URLs', () => {
    for (const url of ['https://a.com', 'http://a.com/x?y#z', 'mailto:a@b.c', 'tel:+905551112233', '/path', '#top', 'page.html', '//cdn.example.com/a']) {
      expect(weEditorSafeUrl(url)).withContext(url).toBe(url);
    }
  });

  it('rejects script-capable and unknown schemes, including obfuscated ones', () => {
    for (const url of ['javascript:alert(1)', ' JavaScript:alert(1)', 'java\tscript:alert(1)', 'java\u0000script:x', 'data:text/html,<b>', 'vbscript:x', 'file:///etc/passwd', '', '   ']) {
      expect(weEditorSafeUrl(url)).withContext(JSON.stringify(url)).toBeNull();
    }
  });
});

describe('style value validators', () => {
  it('accepts plain colours and sizes and rejects CSS injection', () => {
    expect(weEditorSafeColor('#ff0000')).toBe('#ff0000');
    expect(weEditorSafeColor('rgb(1, 2, 3)')).toBe('rgb(1, 2, 3)');
    expect(weEditorSafeColor('red; background: url(x)')).toBeNull();
    expect(weEditorSafeColor('expression(alert(1))')).toBeNull();
    expect(weEditorSafeFontSize('14px')).toBe('14px');
    expect(weEditorSafeFontSize('14px; position: fixed')).toBeNull();
  });
});

describe('weEditorSanitizeHtml', () => {
  it('round-trips the supported F0 markup unchanged', () => {
    // Inline styles come out as the browser's CSSOM writes them: trailing ';', colours as rgb().
    const html =
      '<h2 style="text-align: center;">Title</h2>' +
      '<p style="margin-left: 40px;"><strong>b</strong><em>i</em><u>u</u><s>s</s><sub>2</sub><sup>3</sup><code>c</code></p>' +
      '<p><a href="https://a.com" target="_blank" rel="noopener noreferrer">link</a></p>' +
      '<ul><li><p>one</p></li></ul><ol start="3"><li><p>three</p></li></ol>' +
      '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label contenteditable="false"><input type="checkbox" checked="checked"></label><div><p>done</p></div></li></ul>' +
      '<blockquote><p>q</p></blockquote><pre><code>x &lt; y</code></pre><hr>' +
      '<p><span style="color: rgb(255, 0, 0);">red</span><mark style="background-color: yellow;">hi</mark></p>';
    expect(weEditorSanitizeHtml(html)).toBe(html);
  });

  it('drops scripts, event handlers and unknown elements but keeps their text', () => {
    const out = weEditorSanitizeHtml('<p onclick="x()">a<script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(1)"><iframe src="https://evil"></iframe><blink>b</blink></p>');
    expect(out).toBe('<p>ab</p>');
  });

  it('drops javascript: links but keeps the link text', () => {
    expect(weEditorSanitizeHtml('<p><a href="javascript:alert(1)">click</a></p>')).toBe('<p>click</p>');
  });

  it('drops unsafe inline style values', () => {
    expect(weEditorSanitizeHtml('<p><span style="color: expression(alert(1))">x</span></p>')).toBe('<p>x</p>');
  });

  it('maps foreign markup onto the schema (b, i, del, style weights)', () => {
    expect(weEditorSanitizeHtml('<p><b>a</b><i>b</i><del>c</del><span style="font-weight: 700">d</span></p>')).toBe(
      '<p><strong>a</strong><em>b</em><s>c</s><strong>d</strong></p>'
    );
  });

  it('ignores the Google Docs <b style="font-weight: normal"> wrapper', () => {
    expect(weEditorSanitizeHtml('<b style="font-weight: normal"><p>plain</p></b>')).toBe('<p>plain</p>');
  });

  it('serializes an empty document as an empty string', () => {
    expect(weEditorSerializeHtml(weEditorParseHtml(''))).toBe('');
    expect(weEditorSanitizeHtml('<p></p>')).toBe('');
    expect(weEditorSanitizeHtml(null)).toBe('');
  });

  it('keeps safe images with alt, width and position', () => {
    expect(weEditorSanitizeHtml('<p>a<img src="https://x.com/a.png" alt="A" width="120" style="float: right">b</p>')).toBe(
      '<p>a<img src="https://x.com/a.png" alt="A" width="120" style="float: right; margin: 0px 0px 0.5em 1em;">b</p>'
    );
    expect(weEditorSanitizeHtml('<p><img src="data:image/png;base64,iVBORw0KGgo="></p>')).toBe('<p><img src="data:image/png;base64,iVBORw0KGgo="></p>');
  });

  it('drops images with unsafe sources and their event handlers', () => {
    expect(weEditorSanitizeHtml('<p>a<img src="javascript:alert(1)">b</p>')).toBe('<p>ab</p>');
    expect(weEditorSanitizeHtml('<p>a<img src="data:image/svg+xml;base64,PHN2Zz4=">b</p>')).toBe('<p>ab</p>');
    expect(weEditorSanitizeHtml('<p>a<img src="data:text/html;base64,PHNjcmlwdD4=">b</p>')).toBe('<p>ab</p>');
    expect(weEditorSanitizeHtml('<p><img src="x.png" onerror="alert(1)"></p>')).toBe('<p><img src="x.png"></p>');
  });

  it('keeps tables with header cells, spans and column widths', () => {
    const html = '<table><tbody><tr><th><p>H</p></th><th><p>I</p></th></tr><tr><td colspan="2" data-colwidth="80,120"><p>x</p></td></tr></tbody></table>';
    expect(weEditorSanitizeHtml(html)).toBe(html);
  });

  it('clamps hostile cell spans', () => {
    expect(weEditorSanitizeHtml('<table><tr><td colspan="abc" rowspan="-3"><p>a</p></td></tr></table>')).toBe(
      '<table><tbody><tr><td><p>a</p></td></tr></tbody></table>'
    );
    expect(weEditorSanitizeHtml('<table><tr><td colspan="99999"><p>a</p></td></tr></table>')).toContain('colspan="100"');
  });

  it('wraps bare text in a paragraph', () => {
    expect(weEditorSanitizeHtml('hello')).toBe('<p>hello</p>');
  });
});
