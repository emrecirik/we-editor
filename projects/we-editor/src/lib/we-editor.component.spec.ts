import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextSelection } from 'prosemirror-state';

import { WE_EDITOR_LOCALE, weEditorLocaleEn, weEditorLocaleTr } from './models/we-editor-locale.model';
import { WeEditorComponent } from './we-editor.component';

@Component({
  standalone: true,
  imports: [WeEditorComponent, ReactiveFormsModule],
  template: `<we-editor [formControl]="control" />`
})
class HostComponent {
  control = new FormControl<string>('<p>hello world</p>', { nonNullable: true });
}

describe('WeEditorComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let editor: WeEditorComponent;

  function el(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function btn(item: string): HTMLButtonElement {
    return el().querySelector(`button[data-item="${item}"]`) as HTMLButtonElement;
  }

  function select(from: number, to: number): void {
    const view = editor.editorView!;
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, from, to)));
    fixture.detectChanges();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    editor = fixture.debugElement.children[0].componentInstance as WeEditorComponent;
  });

  it('renders the form value as editable content', () => {
    const content = el().querySelector('.we-editor__prosemirror') as HTMLElement;
    expect(content.getAttribute('contenteditable')).toBe('true');
    expect(content.innerText.trim()).toBe('hello world');
  });

  it('writes form value changes into the editor without emitting them back', () => {
    const spy = jasmine.createSpy('valueChanges');
    host.control.valueChanges.subscribe(spy);
    host.control.setValue('<p>new <em>text</em></p>');
    expect(editor.getHtml()).toBe('<p>new <em>text</em></p>');
    expect(spy).toHaveBeenCalledTimes(1); // only the setValue itself
  });

  it('sanitizes the incoming value', () => {
    host.control.setValue('<p>a<script>alert(1)</script><a href="javascript:x">b</a></p>');
    expect(editor.getHtml()).toBe('<p>ab</p>');
    expect(el().querySelector('.we-editor__content script')).toBeNull();
  });

  it('applies bold from the toolbar and pushes the HTML to the form control', () => {
    select(1, 6);
    btn('bold').click();
    fixture.detectChanges();
    expect(host.control.value).toBe('<p><strong>hello</strong> world</p>');
    expect(btn('bold').getAttribute('aria-pressed')).toBe('true');
  });

  it('undo and redo follow the history', () => {
    expect(btn('undo').disabled).toBeTrue();
    select(1, 6);
    btn('italic').click();
    fixture.detectChanges();
    expect(btn('undo').disabled).toBeFalse();
    btn('undo').click();
    fixture.detectChanges();
    expect(host.control.value).toBe('<p>hello world</p>');
    btn('redo').click();
    expect(host.control.value).toBe('<p><em>hello</em> world</p>');
  });

  it('toggles a bulleted list', () => {
    select(1, 1);
    btn('bulletList').click();
    expect(host.control.value).toBe('<ul><li><p>hello world</p></li></ul>');
  });

  it('adds a link through the link bar and rejects an unsafe one', () => {
    select(1, 6);
    btn('link').click();
    fixture.detectChanges();
    const input = el().querySelector('.we-editor__linkbar input[type="text"]') as HTMLInputElement;
    const form = el().querySelector('.we-editor__linkbar') as HTMLFormElement;

    input.value = 'javascript:alert(1)';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(el().querySelector('.we-editor__error')?.textContent).toContain(weEditorLocaleEn.linkInvalid);
    expect(host.control.value).toBe('<p>hello world</p>');

    input.value = 'https://example.com';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(host.control.value).toBe('<p><a href="https://example.com">hello</a> world</p>');
    expect(el().querySelector('.we-editor__linkbar')).toBeNull();
  });

  it('disables editing and the toolbar with the form control', () => {
    host.control.disable();
    fixture.detectChanges();
    expect((el().querySelector('.we-editor__prosemirror') as HTMLElement).getAttribute('contenteditable')).toBe('false');
    expect(btn('bold').disabled).toBeTrue();
    host.control.enable();
    fixture.detectChanges();
    expect((el().querySelector('.we-editor__prosemirror') as HTMLElement).getAttribute('contenteditable')).toBe('true');
  });

  it('marks the control touched on blur', () => {
    const content = el().querySelector('.we-editor__prosemirror') as HTMLElement;
    content.dispatchEvent(new FocusEvent('blur'));
    expect(host.control.touched).toBeTrue();
  });

  it('reports an empty document as an empty string', () => {
    host.control.setValue('');
    expect(editor.getHtml()).toBe('');
  });

  it('toggles a task item checkbox', () => {
    host.control.setValue('<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><div><p>do it</p></div></li></ul>');
    fixture.detectChanges();
    const box = el().querySelector('li[data-type="taskItem"] input[type="checkbox"]') as HTMLInputElement;
    box.click();
    expect(host.control.value).toContain('data-checked="true"');
  });

  it('shows the placeholder only while the document is empty', () => {
    const content = el().querySelector('.we-editor__prosemirror') as HTMLElement;
    editor.placeholder = 'Write here';
    const shown = () => content.querySelector('p.we-editor__placeholder')?.getAttribute('data-placeholder') ?? null;
    expect(content.getAttribute('aria-placeholder')).toBe('Write here');
    expect(shown()).toBeNull();
    host.control.setValue('');
    expect(shown()).toBe('Write here');
    editor.placeholder = '';
    expect(shown()).toBeNull();
    expect(content.hasAttribute('aria-placeholder')).toBeFalse();
  });

  it('inserts an image through the image bar and rejects an unsafe address', () => {
    select(6, 6);
    btn('image').click();
    fixture.detectChanges();
    const bar = el().querySelector('form[data-bar="image"]') as HTMLFormElement;
    const [url, , alt] = Array.from(bar.querySelectorAll('input')) as HTMLInputElement[];
    url.value = 'javascript:alert(1)';
    url.dispatchEvent(new Event('input'));
    bar.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(el().querySelector('.we-editor__error')?.textContent).toContain(weEditorLocaleEn.imageInvalid);

    url.value = 'https://x.com/a.png';
    url.dispatchEvent(new Event('input'));
    alt.value = 'A';
    alt.dispatchEvent(new Event('input'));
    bar.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(host.control.value).toBe('<p>hello<img src="https://x.com/a.png" alt="A"> world</p>');
    expect(el().querySelector('form[data-bar="image"]')).toBeNull();
  });

  it('stores pasted image files through imageUpload', async () => {
    editor.imageUpload = (file) => Promise.resolve(`https://cdn.test/${file.name}`);
    const data = new DataTransfer();
    data.items.add(new File(['x'], 'p.png', { type: 'image/png' }));
    data.items.add(new File(['<svg/>'], 'evil.svg', { type: 'image/svg+xml' }));
    select(1, 1);
    const content = el().querySelector('.we-editor__prosemirror') as HTMLElement;
    content.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r));
    expect(host.control.value).toBe('<p><img src="https://cdn.test/p.png">hello world</p>');
  });

  it('inserts a table from the table bar and edits it with the table tools', () => {
    select(1, 1);
    btn('table').click();
    fixture.detectChanges();
    const bar = el().querySelector('form[data-bar="table"]') as HTMLFormElement;
    const [rows, cols] = Array.from(bar.querySelectorAll('input[type="number"]')) as HTMLInputElement[];
    rows.value = '2';
    rows.dispatchEvent(new Event('input'));
    cols.value = '1';
    cols.dispatchEvent(new Event('input'));
    bar.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(host.control.value).toContain('<table><tbody><tr><th><p></p></th></tr><tr><td><p></p></td></tr></tbody></table>');

    const tools = el().querySelector('[data-bar="table-tools"]') as HTMLElement;
    expect(tools).not.toBeNull();
    (tools.querySelector('[data-action="tableAddColumnAfter"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.control.value).toContain('<tr><th><p></p></th><th><p></p></th></tr>');
    (el().querySelector('[data-action="tableDelete"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.control.value).not.toContain('<table');
    expect(el().querySelector('[data-bar="table-tools"]')).toBeNull();
  });

  it('opens find & replace with Ctrl+F, counts matches and replaces all', () => {
    host.control.setValue('<p>one two one</p>');
    const content = el().querySelector('.we-editor__prosemirror') as HTMLElement;
    content.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true, cancelable: true }));
    fixture.detectChanges();
    const bar = el().querySelector('form[data-bar="find"]') as HTMLFormElement;
    expect(bar).not.toBeNull();
    const [search, , , replace] = Array.from(bar.querySelectorAll('input')) as HTMLInputElement[];
    search.value = 'one';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(bar.querySelector('.we-editor__count')?.textContent?.trim()).toBe('– of 2');
    expect(content.querySelectorAll('.ProseMirror-search-match').length).toBe(2);
    bar.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(bar.querySelector('.we-editor__count')?.textContent?.trim()).toBe('1 of 2');

    replace.value = '1';
    replace.dispatchEvent(new Event('input'));
    const replaceAllBtn = Array.from(bar.querySelectorAll('button')).find((b) => b.textContent?.trim() === weEditorLocaleEn.replaceAll)!;
    replaceAllBtn.click();
    fixture.detectChanges();
    expect(host.control.value).toBe('<p>1 two 1</p>');
    expect(bar.querySelector('.we-editor__count')?.textContent?.trim()).toBe(weEditorLocaleEn.findNoResults);
  });

  it('keeps find but hides replace in read-only mode', () => {
    editor.readonly = true;
    btn('findReplace').click();
    fixture.detectChanges();
    const bar = el().querySelector('form[data-bar="find"]') as HTMLFormElement;
    expect(bar.querySelectorAll('input[type="text"]').length).toBe(1);
  });

  it('embeds a video from the media bar and explains unsupported addresses', () => {
    select(12, 12);
    btn('media').click();
    fixture.detectChanges();
    const bar = el().querySelector('form[data-bar="media"]') as HTMLFormElement;
    const input = bar.querySelector('input') as HTMLInputElement;
    input.value = 'https://example.com/video';
    input.dispatchEvent(new Event('input'));
    bar.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(el().querySelector('.we-editor__error')?.textContent).toContain(weEditorLocaleEn.mediaInvalid);

    input.value = 'https://vimeo.com/76979871';
    input.dispatchEvent(new Event('input'));
    bar.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(host.control.value).toContain('<iframe src="https://player.vimeo.com/video/76979871"');
    expect(el().querySelector('.we-editor__embed iframe')?.getAttribute('sandbox')).toBe('allow-scripts allow-presentation');
  });

  it('colours text from the palette, remembers recent colours and removes the colour', () => {
    select(1, 6);
    btn('textColor').click();
    fixture.detectChanges();
    const swatch = el().querySelector('[data-bar="color"] .we-editor__swatch[title="#c92a2a"]') as HTMLButtonElement;
    swatch.click();
    fixture.detectChanges();
    expect(host.control.value).toBe('<p><span style="color: rgb(201, 42, 42);">hello</span> world</p>');
    expect(el().querySelector('[data-bar="color"]')).toBeNull();

    btn('textColor').click();
    fixture.detectChanges();
    expect(el().querySelectorAll('[data-bar="color"] [data-recent]').length).toBe(1);
    (el().querySelector('[data-action="colorRemove"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.control.value).toBe('<p>hello world</p>');
  });

  it('highlights through its own palette and closes it with Escape', () => {
    select(1, 6);
    btn('highlight').click();
    fixture.detectChanges();
    expect(btn('highlight').getAttribute('aria-expanded')).toBe('true');
    editor.editorView!.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(el().querySelector('[data-bar="color"]')).toBeNull();
    btn('highlight').click();
    fixture.detectChanges();
    (el().querySelector('[data-bar="color"] .we-editor__swatch[title="#ffe066"]') as HTMLButtonElement).click();
    expect(host.control.value).toContain('<mark style="background-color: rgb(255, 224, 102);">hello</mark>');
  });

  it('inserts special characters and keeps the picker open', () => {
    select(6, 6);
    btn('specialChars').click();
    fixture.detectChanges();
    const chars = Array.from(el().querySelectorAll('[data-bar="chars"] .we-editor__char')) as HTMLButtonElement[];
    chars.find((c) => c.textContent === '©')!.click();
    chars.find((c) => c.textContent === '😀')!.click();
    fixture.detectChanges();
    expect(host.control.value).toBe('<p>hello©😀 world</p>');
    expect(el().querySelector('[data-bar="chars"]')).not.toBeNull();
  });

  it('shows the code language bar inside a code block and highlights the chosen language', () => {
    host.control.setValue('<p>x</p><pre><code>const a = 1;</code></pre>');
    fixture.detectChanges();
    expect(el().querySelector('[data-bar="code"]')).toBeNull();
    select(5, 5);
    const picker = el().querySelector('[data-bar="code"] select') as HTMLSelectElement;
    picker.value = 'javascript';
    picker.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.control.value).toBe('<p>x</p><pre><code class="language-javascript">const a = 1;</code></pre>');
    expect(el().querySelector('.we-editor__content .hljs-keyword')?.textContent).toBe('const');
  });

  it('edits the HTML source, syncs both ways in split view and locks design tools in code view', async () => {
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    btn('source').click();
    fixture.detectChanges();
    const pane = el().querySelector('.we-editor__source') as HTMLElement;
    for (let i = 0; i < 50 && !pane.querySelector('.cm-content'); i++) await wait(20);
    await wait(0);
    const { EditorView } = await import('@codemirror/view');
    const cm = EditorView.findFromDOM(pane)!;
    expect(cm.state.doc.toString()).toBe('<p>hello world</p>');
    expect(btn('bold').disabled).toBeTrue();
    expect((el().querySelector('.we-editor__content') as HTMLElement).hidden).toBeTrue();

    cm.dispatch({ changes: { from: 0, to: cm.state.doc.length, insert: '<h2>Title</h2><p onclick="x()">body</p>' } });
    await wait(300);
    // The event handler is dropped by the schema; the user's text stays as typed until Format.
    expect(host.control.value).toBe('<h2>Title</h2><p>body</p>');
    expect(cm.state.doc.toString()).toContain('onclick');

    (el().querySelector('[data-action="sourceSplit"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(btn('bold').disabled).toBeFalse();
    expect((el().querySelector('.we-editor__content') as HTMLElement).hidden).toBeFalse();
    const view = editor.editorView!;
    view.dispatch(view.state.tr.insertText('!', view.state.doc.content.size - 1));
    await wait(0);
    expect(cm.state.doc.toString()).toBe('<h2>Title</h2>\n<p>body!</p>');

    btn('source').click();
    fixture.detectChanges();
    expect((el().querySelector('.we-editor__source') as HTMLElement).hidden).toBeTrue();
  });

  it('sets line height and case from the toolbar and copies formatting with the format painter', async () => {
    (fixture.nativeElement as HTMLElement).setAttribute('lang', 'en');
    host.control.setValue('<p><strong>bold</strong> plain</p>');
    fixture.detectChanges();
    select(1, 3);
    const lineHeight = el().querySelector('select[aria-label="Line height"]') as HTMLSelectElement;
    lineHeight.value = '2';
    lineHeight.dispatchEvent(new Event('change'));
    expect(host.control.value).toBe('<p style="line-height: 2;"><strong>bold</strong> plain</p>');

    select(6, 11);
    const textCase = el().querySelector('select[aria-label="Change case"]') as HTMLSelectElement;
    textCase.value = 'upper';
    textCase.dispatchEvent(new Event('change'));
    expect(host.control.value).toBe('<p style="line-height: 2;"><strong>bold</strong> PLAIN</p>');
    expect(textCase.value).toBe('');
    // The content language decides the rules: Turkish lowercases I to dotless ı.
    (fixture.nativeElement as HTMLElement).setAttribute('lang', 'tr');
    select(6, 11);
    textCase.value = 'lower';
    textCase.dispatchEvent(new Event('change'));
    expect(host.control.value).toBe('<p style="line-height: 2;"><strong>bold</strong> plaın</p>');

    select(2, 2);
    btn('formatPainter').click();
    fixture.detectChanges();
    expect(btn('formatPainter').getAttribute('aria-pressed')).toBe('true');
    select(6, 11);
    editor.editorView!.dom.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await new Promise((r) => setTimeout(r));
    fixture.detectChanges();
    expect(host.control.value).toBe('<p style="line-height: 2;"><strong>bold</strong> <strong>plaın</strong></p>');
    expect(btn('formatPainter').getAttribute('aria-pressed')).toBe('false');
  });

  it('emits word and character counts on edits', () => {
    const spy = jasmine.createSpy('stats');
    editor.stats.subscribe(spy);
    host.control.setValue('<p>a b</p>');
    expect(spy).not.toHaveBeenCalled();
    expect(editor.getStats()).toEqual({ words: 2, characters: 3 });
    const view = editor.editorView!;
    view.dispatch(view.state.tr.insertText(' cd', 4));
    expect(spy).toHaveBeenCalledOnceWith({ words: 3, characters: 6 });
  });
});

describe('WeEditorComponent locale', () => {
  it('uses the provided WE_EDITOR_LOCALE for labels', () => {
    TestBed.configureTestingModule({ providers: [{ provide: WE_EDITOR_LOCALE, useValue: weEditorLocaleTr }] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const bold = (fixture.nativeElement as HTMLElement).querySelector('button[data-item="bold"]')!;
    expect(bold.getAttribute('aria-label')).toBe('Kalın');
  });

  it('fills every locale key in both shipped languages', () => {
    const keys = Object.keys(weEditorLocaleEn).sort();
    expect(Object.keys(weEditorLocaleTr).sort()).toEqual(keys);
    for (const key of keys) expect((weEditorLocaleTr as unknown as Record<string, string>)[key]).withContext(key).toBeTruthy();
  });
});
