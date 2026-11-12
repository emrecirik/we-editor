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
| `imageUpload` | `(file: File) => Promise<string>` \| `null` | `null` | Stores an image file (upload button, paste, drop) and resolves to its URL. When `null`, files are embedded as base64 `data:` URLs |
| `placeholder` | `string` | `''` | Shown in an empty document (also set as `aria-placeholder`) |

Disabled state comes from the form control (`control.disable()`).

### Outputs

| Output | Type | Description |
|---|---|---|
| `stats` | `WeEditorStats` (`{ words, characters }`) | After every edit. Not emitted by `writeValue`/`setHtml` — read `getStats()` for loaded content |

### Methods

| Method | Description |
|---|---|
| `getHtml(): string` | Current content, serialized through the schema; `''` when empty |
| `setHtml(html)` | Replace content and reset undo history, without emitting a change |
| `getStats(): WeEditorStats` | Word and character counts (characters = Unicode code points, block breaks not counted) |
| `focus()` | Focus the editable area |
| `editorView` | The underlying ProseMirror `EditorView` (advanced use; undefined before init) |

### Toolbar items (`WeEditorToolbarItem`)

`undo`, `redo`, `blockType`, `fontFamily`, `fontSize`, `bold`, `italic`, `underline`, `strike`,
`subscript`, `superscript`, `code`, `textColor`, `highlight`, `alignLeft`, `alignCenter`,
`alignRight`, `alignJustify`, `bulletList`, `orderedList`, `taskList`, `outdent`, `indent`,
`blockquote`, `codeBlock`, `horizontalRule`, `link`, `unlink`, `image`, `table`, `clearFormatting`, `'|'`.

`table` opens the insert bar (rows, columns up to 50, header row). While the cursor is in a table a
**table tools** bar appears: row above/below, delete row, column left/right, delete column, merge
cells, split cell, header row, header column, delete table. Drag a column border to resize it
(written as `data-colwidth`); Shift+click or drag across cells to select several.

`image` opens the image bar: address, upload from computer, alternative text, width in px, and
position (in line with text / left or right with text wrapping / centred). With an image selected
the bar edits it; dragging the corner handle of a selected image resizes it. Pasted and dropped
image files (PNG, JPEG, GIF, WebP, AVIF) are inserted too.

### Keyboard

| Keys | Action |
|---|---|
| Ctrl/Cmd+B / I / U | Bold / italic / underline |
| Ctrl/Cmd+Shift+X | Strikethrough |
| Ctrl/Cmd+E | Inline code |
| Ctrl/Cmd+, / . | Subscript / superscript |
| Ctrl/Cmd+Z, Ctrl/Cmd+Y, Ctrl/Cmd+Shift+Z | Undo / redo |
| Shift+Enter | Line break (`<br>`) |
| Tab / Shift+Tab | Nest / lift a list item; next / previous table cell (elsewhere Tab moves focus) |

Input rules, typed at the start of a block (not inside code blocks): `# ` … `###### ` heading,
`- ` / `* ` bulleted list, `1. ` numbered list (the number becomes `start`), `> ` quote, ```` ``` ````
code block. Backspace right after a rule fired restores the typed text.

## HTML helpers

| Function | Description |
|---|---|
| `weEditorSanitizeHtml(html)` | HTML → schema → HTML. The allowlist sanitizer without an editor |
| `weEditorParseHtml(html, schema?)` | HTML → ProseMirror document |
| `weEditorSerializeHtml(doc, schema?)` | ProseMirror document → HTML (`''` for an empty doc) |
| `weEditorSafeUrl(url)` | URL if http/https/mailto/tel/relative, else `null` |
| `weEditorSafeImageSrc(src)` | Image URL if http/https/relative or a base64 raster `data:image/…`, else `null` |
| `weEditorSafeColor`, `weEditorSafeFontSize`, `weEditorSafeFontFamily` | CSS value validators |

Output format: inline styles are written by the browser's CSSOM, so colours come out as `rgb(...)`
and declarations end with `;` (`<span style="color: rgb(255, 0, 0);">`).

## Schema and commands

`weEditorSchema` (nodes: `paragraph`, `heading`, `blockquote`, `code_block`, `horizontal_rule`,
`bullet_list`, `ordered_list`, `list_item`, `task_list`, `task_item`, `hard_break`, `table`, `table_row`, `table_cell`, `table_header` (`colspan`, `rowspan`,
`colwidth`; spans clamped to `WE_EDITOR_MAX_CELL_SPAN` = 100 on parse), `image` (inline;
`src`, `alt`, `title`, `width`, `align`); marks: `link`,
`bold`, `italic`, `underline`, `strike`, `subscript`, `superscript`, `code`, `font_family`,
`font_size`, `text_color`, `highlight`).

Commands (ProseMirror `Command`s, usable with `editorView`): `weEditorToggleMark`,
`weEditorSetStyle`, `weEditorClearFormatting`, `weEditorSetBlock`, `weEditorSetAlign`,
`weEditorIndent`, `weEditorOutdent`, `weEditorToggleList`, `weEditorToggleWrap`,
`weEditorToggleCodeBlock`, `weEditorInsertHorizontalRule`, `weEditorInsertHardBreak`,
`weEditorSetLink`, `weEditorRemoveLink`, `weEditorSetImage(attrs)` (insert, or update the selected
image), `weEditorInsertTable(rows, cols, header = true)` (max `WE_EDITOR_MAX_TABLE_SIZE` = 50). Row,
column, merge and header commands come from `prosemirror-tables` (`addRowAfter`, `mergeCells`, …) and
work on `editorView` directly; queries `weEditorImageAt`, `weEditorMarkActive`, `weEditorMarkAt`,
`weEditorBlockLevel`, `weEditorAlignAt`, `weEditorListAt`, `weEditorLinkAt`.

Node views: `WeEditorImageView` (resize handle).

State: `weEditorCreateState(html)`, `weEditorPlugins()`, `weEditorInputRules()`, `weEditorStats(doc)`,
`WeEditorTaskItemView`.

## Tokens

| Token | Default | Docs |
|---|---|---|
| `WE_EDITOR_LOCALE` | `weEditorLocaleEn` | [localization.md](localization.md) |
| `WE_EDITOR_ICONS` | `weEditorDefaultIcons` | [theming.md](theming.md) |
