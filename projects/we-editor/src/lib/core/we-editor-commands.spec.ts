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
  weEditorInsertText,
  weEditorInsertTable,
  weEditorSearchCount,
  weEditorSetSearch,
  weEditorSetImage,
  weEditorImageAt,
  weEditorSetLink,
  weEditorSetStyle,
  weEditorToggleList,
  weEditorToggleMark,
  weEditorChangeCase,
  weEditorLineHeightAt,
  weEditorPaintMarks,
  weEditorSetLineHeight,
  weEditorCellAt,
  weEditorSetCellAlign,
  weEditorSetCellBackground,
  weEditorSetTableCaption,
  weEditorTableCaptionAt
} from './we-editor-commands';
import { weEditorSanitizeHtml, weEditorSerializeHtml } from './we-editor-html';
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
  it('inserts text over the selection, keeping the marks there', () => {
    expect(run(stateOf('<p><strong>ab</strong></p>', 2), weEditorInsertText('©'))).toBe('<p><strong>a©b</strong></p>');
    expect(run(stateOf('<p>abc</p>', 1, 3), weEditorInsertText('€'))).toBe('<p>€c</p>');
    expect(run(stateOf('<p>abc</p>', 1), weEditorInsertText(''))).toBeNull();
  });

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

  it('parses and serializes captioned figures, dropping unsafe links and figures without an image', () => {
    const fig = '<figure style="float: right; margin: 0px 0px 0.5em 1em;"><a href="https://x.test/"><img src="a.png" alt="A" width="120"></a><figcaption>Cap <em>tion</em></figcaption></figure>';
    expect(weEditorSanitizeHtml(fig)).toBe(fig);
    expect(weEditorSanitizeHtml('<figure><a href="javascript:alert(1)"><img src="a.png"></a><figcaption>c</figcaption></figure>')).toBe(
      '<figure><img src="a.png"><figcaption>c</figcaption></figure>'
    );
    expect(weEditorSanitizeHtml('<figure><img src="javascript:x"><figcaption>c</figcaption></figure>')).toBe('<p>c</p>');
    expect(weEditorSanitizeHtml('<figure><img src="a.png"></figure>')).toBe('<figure><img src="a.png"><figcaption></figcaption></figure>');
    // A link around the whole figure is not the image's link.
    expect(weEditorSanitizeHtml('<a href="https://x.test"><figure><img src="a.png"><figcaption>c</figcaption></figure></a>')).toContain(
      '<figure><img src="a.png">'
    );
  });

  it('adds and removes a caption, keeping the caption text', () => {
    const state = weEditorCreateState('<p>a<img src="a.png">b</p>');
    const selected = state.apply(state.tr.setSelection(NodeSelection.create(state.doc, 2)));
    let next = selected;
    weEditorSetImage({ src: 'a.png', caption: true })(selected, (tr) => (next = selected.apply(tr)));
    expect(weEditorSerializeHtml(next.doc)).toBe('<p>a</p><figure><img src="a.png"><figcaption></figcaption></figure><p>b</p>');
    expect(next.selection.$from.parent.type.name).toBe('figure');
    expect(weEditorImageAt(next)?.caption).toBeTrue();
    next = next.apply(next.tr.insertText('Hills'));
    let back = next;
    weEditorSetImage({ src: 'a.png', caption: false })(next, (tr) => (back = next.apply(tr)));
    expect(weEditorSerializeHtml(back.doc)).toBe('<p>a</p><p><img src="a.png"></p><p>Hills</p><p>b</p>');
  });

  it('links an image or a figure and refuses an unsafe link', () => {
    const state = weEditorCreateState('<p><img src="a.png"></p>');
    const selected = state.apply(state.tr.setSelection(NodeSelection.create(state.doc, 1)));
    expect(run(selected, weEditorSetImage({ src: 'a.png', href: 'https://x.test' }))).toBe('<p><a href="https://x.test"><img src="a.png"></a></p>');
    expect(run(selected, weEditorSetImage({ src: 'a.png', href: 'javascript:alert(1)' }))).toBeNull();
    expect(run(selected, weEditorSetImage({ src: 'a.png', href: 'https://x.test', caption: true }))).toBe(
      '<figure><a href="https://x.test"><img src="a.png"></a><figcaption></figcaption></figure>'
    );
    const linked = weEditorCreateState('<p><a href="https://x.test"><img src="a.png"></a></p>');
    const sel2 = linked.apply(linked.tr.setSelection(NodeSelection.create(linked.doc, 1)));
    expect(weEditorImageAt(sel2)?.href).toBe('https://x.test');
    expect(run(sel2, weEditorSetImage({ src: 'a.png', href: '' }))).toBe('<p><img src="a.png"></p>');
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

  it('keeps table captions and cell background / vertical alignment; drops unsafe values', () => {
    const html =
      '<table><caption>  Budget\n 2026 </caption><tbody><tr><td style="background-color: #ffe066; vertical-align: middle"><p>a</p></td>' +
      '<td style="background-color: url(javascript:x); vertical-align: sideways"><p>b</p></td></tr></tbody></table>';
    expect(weEditorSanitizeHtml(html)).toBe(
      '<table><caption>Budget 2026</caption><tbody><tr><td style="background-color: rgb(255, 224, 102); vertical-align: middle;"><p>a</p></td><td><p>b</p></td></tr></tbody></table>'
    );
  });

  it('still reads highlighted spans in list items, quotes and cells without a <p>', () => {
    const mark = '<mark style="background-color: rgb(255, 224, 102);">x</mark>';
    const span = '<span style="background-color: #ffe066">x</span>';
    expect(weEditorSanitizeHtml(`<ul><li>${span}</li></ul>`)).toBe(`<ul><li><p>${mark}</p></li></ul>`);
    expect(weEditorSanitizeHtml(`<blockquote>${span}</blockquote>`)).toBe(`<blockquote><p>${mark}</p></blockquote>`);
    expect(weEditorSanitizeHtml(`<table><tbody><tr><td>${span}</td></tr></tbody></table>`)).toBe(
      `<table><tbody><tr><td><p>${mark}</p></td></tr></tbody></table>`
    );
  });

  it('sets the table caption and cell properties at the cursor', () => {
    const table = '<table><tbody><tr><td><p>a</p></td><td><p>b</p></td></tr></tbody></table>';
    const at = stateOf(table, 4);
    expect(weEditorTableCaptionAt(at)).toBeNull();
    expect(weEditorTableCaptionAt(stateOf('<p>x</p>', 1))).toBeUndefined();
    expect(run(at, weEditorSetTableCaption(' Q1 '))).toContain('<table><caption>Q1</caption>');
    expect(run(at, weEditorSetCellBackground('#ff0000'))).toContain('<td style="background-color: rgb(255, 0, 0);"><p>a</p></td><td><p>b</p></td>');
    expect(run(at, weEditorSetCellBackground('expression(alert(1))'))).toBeNull();
    expect(run(at, weEditorSetCellAlign('bottom'))).toContain('<td style="vertical-align: bottom;"><p>a</p></td>');
    expect(weEditorCellAt(stateOf('<table><tbody><tr><td style="vertical-align: top"><p>a</p></td></tr></tbody></table>', 4))).toEqual({
      background: null,
      verticalAlign: 'top'
    });
    expect(weEditorSetTableCaption('x')(stateOf('<p>x</p>', 1))).toBeFalse();
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

  it('sets, reads and clears the line height; refuses units and out-of-range values', () => {
    const html = run(stateOf('<p>a</p><h2>b</h2>', 1, 5), weEditorSetLineHeight('1.5'));
    expect(html).toBe('<p style="line-height: 1.5;">a</p><h2 style="line-height: 1.5;">b</h2>');
    expect(weEditorLineHeightAt(stateOf(html!, 1))).toBe('1.5');
    expect(run(stateOf(html!, 1), weEditorSetLineHeight(null))).toBe('<p>a</p><h2 style="line-height: 1.5;">b</h2>');
    expect(weEditorSetLineHeight('20px')(stateOf('<p>a</p>', 1))).toBeFalse();
    expect(weEditorSetLineHeight('9')(stateOf('<p>a</p>', 1))).toBeFalse();
    expect(weEditorSanitizeHtml('<p style="line-height: expression(alert(1))">a</p><p style="line-height: 2">b</p>')).toBe(
      '<p>a</p><p style="line-height: 2;">b</p>'
    );
  });

  it('changes case across marks, with title and sentence rules', () => {
    const doc = '<p>hello <strong>big</strong> world. new start</p>';
    expect(run(stateOf(doc, 1, 27), weEditorChangeCase('upper', 'en'))).toBe('<p>HELLO <strong>BIG</strong> WORLD. NEW START</p>');
    expect(run(stateOf(doc, 1, 27), weEditorChangeCase('title', 'en'))).toBe('<p>Hello <strong>Big</strong> World. New Start</p>');
    expect(run(stateOf('<p>HELLO BIG. NEW ONE</p>', 1, 19), weEditorChangeCase('sentence', 'en'))).toBe('<p>Hello big. New one</p>');
    // Mid-word selection: no capital in the middle of a word.
    expect(run(stateOf('<p>heLLO</p>', 3, 6), weEditorChangeCase('title', 'en'))).toBe('<p>hello</p>');
    expect(weEditorChangeCase('upper')(stateOf('<p>a</p>', 1))).toBeFalse();
  });

  it('follows language rules and length changes when changing case', () => {
    expect(run(stateOf('<p>istanbul ılık</p>', 1, 14), weEditorChangeCase('upper', 'tr'))).toBe('<p>İSTANBUL ILIK</p>');
    let state = stateOf('<p>straße x</p>', 1, 7);
    weEditorChangeCase('upper', 'de')(state, (tr) => (state = state.apply(tr)));
    expect(weEditorSerializeHtml(state.doc)).toBe('<p>STRASSE x</p>');
    expect(state.doc.textBetween(state.selection.from, state.selection.to)).toBe('STRASSE');
  });

  it('paints copied marks over the selection, leaving links alone', () => {
    const bold = weEditorSchema.marks['bold'].create();
    const link = weEditorSchema.marks['link'].create({ href: 'https://x.test' });
    expect(run(stateOf('<p><em>ab</em> <a href="https://a.test">cd</a></p>', 1, 6), weEditorPaintMarks([bold, link]))).toBe(
      '<p><strong>ab </strong><a href="https://a.test"><strong>cd</strong></a></p>'
    );
    expect(weEditorPaintMarks([bold])(stateOf('<p>a</p>', 1))).toBeFalse();
  });
});
