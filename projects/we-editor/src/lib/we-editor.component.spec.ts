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
