import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextSelection } from 'prosemirror-state';
import { WeEditorToolbarItem } from './models/we-editor-toolbar.model';
import { WeEditorComponent } from './we-editor.component';

@Component({
  standalone: true,
  imports: [WeEditorComponent, ReactiveFormsModule],
  template: `<we-editor [formControl]="control" [trackChanges]="tracking" [toolbar]="toolbar" />`
})
class HostComponent {
  control = new FormControl<string>('<p>hello world</p>', { nonNullable: true });
  tracking = true;
  toolbar: WeEditorToolbarItem[] = ['bold', 'trackChanges', 'acceptChange', 'rejectChange', 'acceptAllChanges', 'rejectAllChanges'];
}

describe('WeEditorComponent — track changes', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let editor: WeEditorComponent;

  const btn = (item: string): HTMLButtonElement => fixture.nativeElement.querySelector(`button[data-item="${item}"]`);
  const type = (text: string, at: number): void => {
    const view = editor.editorView!;
    view.dispatch(view.state.tr.insertText(text, at));
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    editor = fixture.debugElement.children[0].componentInstance as WeEditorComponent;
  });

  it('records typing as a suggestion while trackChanges is on, and the form value carries it', () => {
    expect(btn('trackChanges').getAttribute('aria-pressed')).toBe('true');
    type('!', 12);
    expect(host.control.value).toContain('<ins data-id="');
    expect(editor.getChanges().map((c) => [c.kind, c.text])).toEqual([['insertion', '!']]);
  });

  it('enables accept and reject where a change is, and applies them', () => {
    type('!', 12);
    const view = editor.editorView!;
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 2)));
    fixture.detectChanges();
    expect(btn('acceptChange').disabled).toBeTrue();
    expect(btn('acceptAllChanges').disabled).toBeFalse();
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 13)));
    fixture.detectChanges();
    expect(btn('rejectChange').disabled).toBeFalse();
    btn('rejectChange').click();
    fixture.detectChanges();
    expect(host.control.value).toBe('<p>hello world</p>');
  });

  it('switches recording off from the toolbar, and keeps it across setHtml', () => {
    editor.setHtml('<p>new text</p>');
    fixture.detectChanges();
    expect(editor.trackChanges).toBeTrue();
    btn('trackChanges').click();
    fixture.detectChanges();
    expect(btn('trackChanges').getAttribute('aria-pressed')).toBe('false');
    type('!', 9);
    expect(editor.getChanges()).toEqual([]);
  });

  it('accepts every change from the API', () => {
    type('!', 12);
    editor.acceptAllChanges();
    fixture.detectChanges();
    expect(host.control.value).toBe('<p>hello world!</p>');
  });
});
