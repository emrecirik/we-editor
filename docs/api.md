# API

Everything below is exported from `we-editor-angular`.

## `<we-editor>` (`WeEditorComponent`)

Standalone component and `ControlValueAccessor`. The value is an HTML string.

```ts
import { WeEditorComponent } from 'we-editor-angular';

@Component({
  standalone: true,
  imports: [WeEditorComponent, ReactiveFormsModule],
  template: `<we-editor formControlName="body" />`
})
```

### Inputs

| Input | Type | Default | Notes |
|---|---|---|---|
| `toolbar` | `readonly WeEditorToolbarItem[]` | `WE_EDITOR_DEFAULT_TOOLBAR` | Order of toolbar entries; `'|'` is a separator; `[]` hides the toolbar |
| `fontFamilies` | `readonly WeEditorOption[]` | `WE_EDITOR_DEFAULT_FONT_FAMILIES` | `value` is the CSS `font-family` written to the text (must pass `weEditorSafeFontFamily`) |
| `fontSizes` | `readonly WeEditorOption[]` | `WE_EDITOR_DEFAULT_FONT_SIZES` | `value` is a CSS size (`px`, `pt`, `em`, `rem`, `%`) |
| `readonly` | `boolean` | `false` | Content not editable, toolbar disabled; the value is still readable |

Disabled state comes from the form control (`control.disable()`).

### Methods

| Method | Description |
|---|---|
| `getHtml(): string` | Current content, serialized through the schema; `''` when empty |
| `setHtml(html)` | Replace content and reset undo history, without emitting a change |
| `focus()` | Focus the editable area |
| `editorView` | The underlying ProseMirror `EditorView` (advanced use; undefined before init) |

### Toolbar items (`WeEditorToolbarItem`)

`undo`, `redo`, `blockType`, `fontFamily`, `fontSize`, `bold`, `italic`, `underline`, `strike`,
`subscript`, `superscript`, `code`, `textColor`, `highlight`, `alignLeft`, `alignCenter`,
`alignRight`, `alignJustify`, `bulletList`, `orderedList`, `taskList`, `outdent`, `indent`,
`blockquote`, `codeBlock`, `horizontalRule`, `link`, `unlink`, `clearFormatting`, `'|'`.

### Keyboard

| Keys | Action |
|---|---|
| Ctrl/Cmd+B / I / U | Bold / italic / underline |
| Ctrl/Cmd+Shift+X | Strikethrough |
| Ctrl/Cmd+E | Inline code |
| Ctrl/Cmd+, / . | Subscript / superscript |
| Ctrl/Cmd+Z, Ctrl/Cmd+Y, Ctrl/Cmd+Shift+Z | Undo / redo |
| Shift+Enter | Line break (`<br>`) |
| Tab / Shift+Tab | Nest / lift a list item (outside lists Tab moves focus) |

## HTML helpers

| Function | Description |
|---|---|
| `weEditorSanitizeHtml(html)` | HTML → schema → HTML. The allowlist sanitizer without an editor |
| `weEditorParseHtml(html, schema?)` | HTML → ProseMirror document |
| `weEditorSerializeHtml(doc, schema?)` | ProseMirror document → HTML (`''` for an empty doc) |
| `weEditorSafeUrl(url)` | URL if http/https/mailto/tel/relative, else `null` |
| `weEditorSafeColor`, `weEditorSafeFontSize`, `weEditorSafeFontFamily` | CSS value validators |

Output format: inline styles are written by the browser's CSSOM, so colours come out as `rgb(...)`
and declarations end with `;` (`<span style="color: rgb(255, 0, 0);">`).

## Schema and commands

`weEditorSchema` (nodes: `paragraph`, `heading`, `blockquote`, `code_block`, `horizontal_rule`,
`bullet_list`, `ordered_list`, `list_item`, `task_list`, `task_item`, `hard_break`; marks: `link`,
`bold`, `italic`, `underline`, `strike`, `subscript`, `superscript`, `code`, `font_family`,
`font_size`, `text_color`, `highlight`).

Commands (ProseMirror `Command`s, usable with `editorView`): `weEditorToggleMark`,
`weEditorSetStyle`, `weEditorClearFormatting`, `weEditorSetBlock`, `weEditorSetAlign`,
`weEditorIndent`, `weEditorOutdent`, `weEditorToggleList`, `weEditorToggleWrap`,
`weEditorToggleCodeBlock`, `weEditorInsertHorizontalRule`, `weEditorInsertHardBreak`,
`weEditorSetLink`, `weEditorRemoveLink`; queries `weEditorMarkActive`, `weEditorMarkAt`,
`weEditorBlockLevel`, `weEditorAlignAt`, `weEditorListAt`, `weEditorLinkAt`.

State: `weEditorCreateState(html)`, `weEditorPlugins()`, `WeEditorTaskItemView`.

## Tokens

| Token | Default | Docs |
|---|---|---|
| `WE_EDITOR_LOCALE` | `weEditorLocaleEn` | [localization.md](localization.md) |
| `WE_EDITOR_ICONS` | `weEditorDefaultIcons` | [theming.md](theming.md) |
