import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { WE_EDITOR_LOCALE, WeEditorComponent, WeEditorStats, weEditorLocaleTr, weEditorSanitizeHtml } from 'we-editor-angular';

const SAMPLE = `
<h1>Field trip report</h1>
<p><img src="sample-landscape.png" alt="Green hills under an evening sun" width="300" style="float: right">Everything you see is editable: <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strike</s>,
H<sub>2</sub>O, x<sup>2</sup>, <code>inline code</code>, <span style="color: #c2255c">colour</span>,
<mark style="background-color: #ffe066">highlight</mark>, <span style="font-family: Georgia, serif">Georgia</span>,
<span style="font-size: 24px">24px</span> and a <a href="https://github.com/emrecirik/we-editor">link</a>.
Click the picture and drag its corner to resize it.</p>
<h2>Checklist</h2>
<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><div><p>Book the bus</p></div></li><li data-type="taskItem" data-checked="false"><div><p>Pack lunch</p></div></li></ul>
<h2>Budget</h2>
<table><tbody><tr><th><p>Item</p></th><th><p>Qty</p></th><th><p>Cost</p></th></tr><tr><td><p>Bus</p></td><td><p>1</p></td><td><p>240.00</p></td></tr><tr><td><p>Tickets</p></td><td><p>28</p></td><td><p>196.00</p></td></tr><tr><td colspan="2"><p><strong>Total</strong></p></td><td><p><strong>436.00</strong></p></td></tr></tbody></table>
<h3 style="text-align: center">Notes</h3>
<ol><li><p>Leave at 8:00</p><ul><li><p>Meet at the main gate</p></li></ul></li><li><p>Back by 17:00</p></li></ol>
<blockquote><p>Type <code># </code>, <code>- </code>, <code>1. </code> or <code>&gt; </code> at the start of a line.</p></blockquote>
<pre><code class="language-javascript">const total = 240 + 196; // 436</code></pre>
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
  template: `<we-editor [formControl]="control" [readonly]="readonly" placeholder="Bir şeyler yazın…" (stats)="stats.emit($event)" />`
})
export class EditorTrComponent {
  @Input({ required: true }) control!: FormControl<string>;
  @Input() readonly = false;
  @Output() readonly stats = new EventEmitter<WeEditorStats>();
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
  stats: WeEditorStats | null = null;

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
