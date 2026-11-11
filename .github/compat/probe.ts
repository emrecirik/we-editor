import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  WE_EDITOR_DEFAULT_TOOLBAR,
  WE_EDITOR_LOCALE,
  WeEditorComponent,
  WeEditorToolbarItem,
  weEditorLocaleTr,
  weEditorSanitizeHtml,
  weEditorSchema,
  weEditorToggleMark
} from 'we-editor-angular';

/** Exercises the public surface so the consumer build type-checks and links all of it. */
@Component({
  selector: 'app-probe-tr',
  standalone: true,
  imports: [WeEditorComponent, ReactiveFormsModule],
  providers: [{ provide: WE_EDITOR_LOCALE, useValue: weEditorLocaleTr }],
  template: `<we-editor [formControl]="control" [toolbar]="toolbar" [readonly]="true" />`
})
export class ProbeTr {
  readonly control = new FormControl('<p>tr</p>', { nonNullable: true });
  readonly toolbar: WeEditorToolbarItem[] = ['bold', 'italic', '|', 'link'];
}

@Component({
  selector: 'app-probe',
  standalone: true,
  imports: [WeEditorComponent, ReactiveFormsModule, ProbeTr],
  templateUrl: './probe.html'
})
export class ProbeApp {
  readonly control = new FormControl('<p>Hello <strong>probe</strong></p>', { nonNullable: true });
  readonly toolbar = WE_EDITOR_DEFAULT_TOOLBAR;
  readonly sanitized = weEditorSanitizeHtml('<p onclick="x()">safe<script>alert(1)</script></p>');
  readonly boldCommand = weEditorToggleMark(weEditorSchema.marks['bold']);
}
