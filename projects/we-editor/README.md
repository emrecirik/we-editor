# we-editor-angular

[![CI](https://github.com/emrecirik/we-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/emrecirik/we-editor/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/emrecirik/we-editor/blob/main/LICENSE)
[![Angular 18-22](https://img.shields.io/badge/Angular-18%20%E2%80%93%2022-dd0031.svg)](https://angular.dev)
[![Languages](https://img.shields.io/badge/UI-EN%20%C2%B7%20TR%20%C2%B7%20DE%20%C2%B7%20FR%20%C2%B7%20ES-5b5bd6.svg)](https://github.com/emrecirik/we-editor/blob/main/docs/localization.md)
[![No CSS framework](https://img.shields.io/badge/CSS%20framework-none-success.svg)](https://github.com/emrecirik/we-editor/blob/main/docs/theming.md)

[Türkçe](https://github.com/emrecirik/we-editor/blob/main/README.tr.md)

A free, themeable rich-text editor for Angular, built on [ProseMirror](https://prosemirror.net).
No CSS framework, no icon font, no commercial dependency. A sibling of
[we-grid-angular](https://github.com/emrecirik/we-grid).

> **Status: 0.1.0 in development (F0).** Not on npm yet. The roadmap goes to Word-level documents,
> spreadsheet tables, a design/code/split HTML editor and mail-merge templates — see
> [docs/ROADMAP.md](https://github.com/emrecirik/we-editor/blob/main/docs/ROADMAP.md).

## Features (F0)

- `<we-editor>` standalone component, a **form control** (`formControlName`, `[formControl]`,
  `ngModel`) whose value is an HTML string; `''` when empty so `Validators.required` works
- Bold, italic, underline, strikethrough, subscript, superscript, inline code
- Paragraph and headings H1–H6, font family, font size, text colour, highlight
- Align left / centre / right / justify, indent / outdent
- Bulleted, numbered and task lists (nest with Tab / Shift+Tab, clickable checkboxes)
- Quote, code block, horizontal line, links (with "open in new tab"), clear formatting
- Undo / redo, keyboard shortcuts
- **Safe HTML in and out:** the document schema is the allowlist — scripts, event handlers,
  `javascript:` links and unsafe CSS values are dropped; `weEditorSanitizeHtml()` is exported for use
  without an editor
- Light and dark theme through CSS custom properties; English, Turkish, German, French and Spanish UI; inline SVG icons

## Install

```bash
npm install we-editor-angular
```

Add the default theme to `angular.json` → `styles`:

```json
"node_modules/we-editor-angular/styles/we-editor-theme.scss"
```

## Use

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { WeEditorComponent } from 'we-editor-angular';

@Component({
  selector: 'app-mail',
  standalone: true,
  imports: [WeEditorComponent, ReactiveFormsModule],
  template: `<we-editor [formControl]="body" />`
})
export class MailComponent {
  body = new FormControl('<p>Hello <strong>world</strong></p>', { nonNullable: true });
}
```

Turkish UI: `providers: [{ provide: WE_EDITOR_LOCALE, useValue: weEditorLocaleTr }]`.

## Docs

[API](https://github.com/emrecirik/we-editor/blob/main/docs/api.md) · [Theming](https://github.com/emrecirik/we-editor/blob/main/docs/theming.md) · [Localization](https://github.com/emrecirik/we-editor/blob/main/docs/localization.md) ·
[Architecture](https://github.com/emrecirik/we-editor/blob/main/docs/ARCHITECTURE.md) · [Roadmap](https://github.com/emrecirik/we-editor/blob/main/docs/ROADMAP.md) · [Licences](https://github.com/emrecirik/we-editor/blob/main/docs/LICENSES.md)

## Compatibility

Angular 18.2 – 22 from a single build (proved by the `compat` workflow). Works with and without
zone.js.

## License

MIT © Emre CIRIK. Third-party licences: [docs/LICENSES.md](https://github.com/emrecirik/we-editor/blob/main/docs/LICENSES.md).
