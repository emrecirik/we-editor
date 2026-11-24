import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextSelection } from 'prosemirror-state';
import { undo } from 'prosemirror-history';
import { WeEditorComment } from './models/we-editor-comment.model';
import { WeEditorToolbarItem } from './models/we-editor-toolbar.model';
import { WeEditorComponent } from './we-editor.component';

@Component({
  standalone: true,
  imports: [WeEditorComponent, ReactiveFormsModule],
  template: `<we-editor [formControl]="control" [toolbar]="toolbar" [comments]="comments" commentAuthor="Ayşe" (commentsChange)="comments = $event; changes = changes + 1" />`
})
class HostComponent {
  control = new FormControl<string>('<p>hello brave world</p>', { nonNullable: true });
  toolbar: WeEditorToolbarItem[] = ['bold', 'comment', 'comments'];
  comments: WeEditorComment[] = [];
  changes = 0;
}

describe('WeEditorComponent — comments', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let editor: WeEditorComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const btn = (item: string): HTMLButtonElement => el().querySelector(`button[data-item="${item}"]`) as HTMLButtonElement;

  const select = (from: number, to: number): void => {
    const view = editor.editorView!;
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, from, to)));
    fixture.detectChanges();
  };

  const comment = (text: string): void => {
    btn('comment').click();
    fixture.detectChanges();
    const input = el().querySelector('[data-bar="comment"] input') as HTMLInputElement;
    input.value = text;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (el().querySelector('[data-bar="comment"]') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    editor = fixture.debugElement.children[0].componentInstance as WeEditorComponent;
  });

  it('comments on the selection only — the thread goes out through commentsChange, the HTML keeps an id', () => {
    expect(btn('comment').disabled).toBeTrue();
    select(7, 12);
    expect(btn('comment').disabled).toBeFalse();
    comment('Too strong?');
    expect(host.comments.length).toBe(1);
    const [c] = host.comments;
    expect(c.text).toBe('Too strong?');
    expect(c.author).toBe('Ayşe');
    expect(host.control.value).toBe(`<p>hello <span data-comment-id="${c.id}">brave</span> world</p>`);
    expect(host.control.value).not.toContain('Too strong');
    // The panel opens on the new thread
    expect(el().querySelector('.we-editor__thread-quote')!.textContent).toContain('brave');
    expect(el().querySelector('.we-editor__thread-text')!.textContent).toBe('Too strong?');
  });

  it('answers, resolves and deletes a thread', () => {
    select(7, 12);
    comment('Too strong?');
    const id = host.comments[0].id;
    const reply = el().querySelector('.we-editor__thread-actions input') as HTMLInputElement;
    reply.value = 'Keep it';
    reply.dispatchEvent(new Event('input'));
    (el().querySelector('.we-editor__thread-actions') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(host.comments[0].replies?.map((r) => r.text)).toEqual(['Keep it']);

    const buttons = () => Array.from(el().querySelectorAll<HTMLButtonElement>('.we-editor__thread-actions button'));
    buttons().find((b) => b.textContent!.trim() === 'Resolve')!.click();
    fixture.detectChanges();
    expect(host.comments[0].resolved).toBeTrue();
    expect(el().querySelector('.we-editor__thread--resolved')).not.toBeNull();

    buttons().find((b) => b.textContent!.trim() === 'Delete')!.click();
    fixture.detectChanges();
    expect(host.comments).toEqual([]);
    expect(host.control.value).toBe('<p>hello brave world</p>');
    expect(el().querySelector('.we-editor__thread')).toBeNull();
    expect(id).toBeTruthy();
  });

  it('puts the cursor in the comment box, so typing goes into the comment and not the document', () => {
    document.body.appendChild(fixture.nativeElement);
    select(7, 12);
    btn('comment').click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(el().querySelector('[data-bar="comment"] input'));
    fixture.nativeElement.remove();
  });

  it('selects the commented text from the panel', () => {
    select(7, 12);
    comment('Too strong?');
    select(1, 1);
    (el().querySelector('.we-editor__thread-quote') as HTMLButtonElement).click();
    const sel = editor.editorView!.state.selection;
    expect([sel.from, sel.to]).toEqual([7, 12]);
  });

  it('shows no reply, resolve or delete on a read-only editor', () => {
    select(7, 12);
    comment('Too strong?');
    editor.readonly = true;
    fixture.detectChanges();
    expect(el().querySelector('.we-editor__thread-text')).not.toBeNull();
    expect(el().querySelector('.we-editor__thread-actions')).toBeNull();
  });

  it('can still take off a mark whose thread is gone — after undoing a delete', () => {
    select(7, 12);
    comment('Too strong?');
    const del = Array.from(el().querySelectorAll<HTMLButtonElement>('.we-editor__thread-actions button')).find((b) => b.textContent!.trim() === 'Delete')!;
    del.click();
    fixture.detectChanges();
    const view = editor.editorView!;
    undo(view.state, view.dispatch);
    fixture.detectChanges();
    expect(host.comments).toEqual([]);
    expect(host.control.value).toContain('data-comment-id');
    (el().querySelector('.we-editor__thread-actions button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.control.value).toBe('<p>hello brave world</p>');
  });
});
