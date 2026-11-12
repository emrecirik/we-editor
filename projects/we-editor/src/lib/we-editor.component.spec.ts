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
