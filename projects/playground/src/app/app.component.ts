import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { WE_EDITOR_LOCALE, WeEditorComponent, weEditorLocaleTr, weEditorSanitizeHtml } from 'we-editor-angular';

const SAMPLE = `
<h1>we-editor playground</h1>
<p>Every F0 feature: <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strike</s>,
H<sub>2</sub>O, x<sup>2</sup>, <code>inline code</code>,
<span style="color: #c2255c">colour</span>, <mark style="background-color: #ffe066">highlight</mark>,
<span style="font-family: Georgia, serif">Georgia</span>, <span style="font-size: 24px">24px</span>
and a <a href="https://github.com/emrecirik">link</a>.</p>
<h2 style="text-align: center">Centred heading</h2>
<p style="margin-left: 40px">An indented paragraph.</p>
<ul><li><p>Bulleted</p><ul><li><p>Nested</p></li></ul></li></ul>
<ol><li><p>First</p></li><li><p>Second</p></li></ol>
<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><div><p>Done task</p></div></li><li data-type="taskItem" data-checked="false"><div><p>Open task</p></div></li></ul>
<blockquote><p>A quote.</p></blockquote>
<pre><code>const answer = 42;</code></pre>
<hr>
<p>Unsafe input is dropped: <a href="javascript:alert(1)">this link</a> has no href, and the script below never ran.</p>
<script>alert('xss')</script>
`;

/** Renders the editor with the Turkish locale — the locale is resolved through DI per component. */
@Component({
  selector: 'app-editor-tr',
  standalone: true,
  imports: [WeEditorComponent, ReactiveFormsModule],
  providers: [{ provide: WE_EDITOR_LOCALE, useValue: weEditorLocaleTr }],
  template: `<we-editor [formControl]="control" [readonly]="readonly" />`
})
export class EditorTrComponent {
  @Input({ required: true }) control!: FormControl<string>;
  @Input() readonly = false;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WeEditorComponent, EditorTrComponent, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly control = new FormControl(SAMPLE, { nonNullable: true, validators: Validators.required });
  lang: 'en' | 'tr' = 'en';
  dark = false;
  readonly = false;
  sourceDraft = '';

  toggleTheme(): void {
    this.dark = !this.dark;
    document.documentElement.setAttribute('data-theme', this.dark ? 'dark' : 'light');
  }

  toggleDisabled(): void {
    if (this.control.disabled) this.control.enable();
    else this.control.disable();
  }

  loadSource(): void {
    this.control.setValue(this.sourceDraft);
  }

  sanitizedPreview(): string {
    return weEditorSanitizeHtml(this.sourceDraft);
  }
}
