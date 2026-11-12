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
| `lineHeights` | `readonly WeEditorOption[]` | `WE_EDITOR_DEFAULT_LINE_HEIGHTS` | Line height picker; `value` is a unitless `line-height` between 0.5 and 5 (`weEditorSafeLineHeight`) |
| `colors` | `readonly string[]` | `WE_EDITOR_DEFAULT_COLORS` | Swatches of the text colour and highlight palettes; each must pass `weEditorSafeColor` |
| `codeLanguages` | `readonly WeEditorOption[]` | `WE_EDITOR_DEFAULT_CODE_LANGUAGES` | Languages of the code block bar; `value` is written as `class="language-<value>"` and must pass `weEditorSafeCodeLanguage`. Only the 23 default ids are coloured |
| `specialCharacters` | `readonly string[]` | `WE_EDITOR_DEFAULT_SPECIAL_CHARACTERS` | Entries of the special-characters picker (symbols and emoji); each is inserted as text |
| `readonly` | `boolean` | `false` | Content not editable, toolbar disabled; the value is still readable |
| `imageUpload` | `(file: File) => Promise<string>` \| `null` | `null` | Stores an image file (upload button, paste, drop) and resolves to its URL. When `null`, files are embedded as base64 `data:` URLs |
| `statusBar` | `boolean` | `false` | Status bar under the content: element path (click a crumb to select that ancestor), autosave state, word and character counts |
| `autosave` | `(html: string) => void \| Promise<void>` \| `null` | `null` | Called `autosaveDelay` ms after the last edit, and once more on destroy if an edit is still pending; a rejected promise shows "Could not save" |
| `autosaveDelay` | `number` | `1500` | Milliseconds of quiet before `autosave` runs |
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
`subscript`, `superscript`, `code`, `lineHeight`, `textColor`, `highlight`, `alignLeft`, `alignCenter`,
`alignRight`, `alignJustify`, `bulletList`, `orderedList`, `taskList`, `outdent`, `indent`,
`blockquote`, `codeBlock`, `horizontalRule`, `link`, `unlink`, `image`, `media`, `table`, `specialChars`,
`findReplace`, `formatPainter`, `textCase`, `clearFormatting`, `source`, `fullscreen`, `'|'`.

**Pasting from Word, Outlook or Google Docs** is cleaned automatically: Word's marker paragraphs
become real nested `<ul>` / `<ol>` lists, and Office font, size, spacing, `mso-*` and default-colour
styles are dropped while bold, italic, underline and real colours stay. Other HTML is not touched.

`fullscreen` pins the editor over the page (`position: fixed`, `z-index: var(--we-editor-fullscreen-z-index)`);
Esc or the button again leaves it.

`lineHeight` sets `line-height` on the selected paragraphs and headings. `textCase` converts the
selection to UPPERCASE, lowercase, Title Case or Sentence case, keeping its formatting; the rules follow
the content language (closest `lang` attribute, e.g. Turkish i → İ, ı ← I), else the browser's.
`formatPainter` picks up the formatting at the cursor; the next selection (mouse or keyboard) receives
it, links excluded. Esc cancels it.

`source` opens the **HTML source view** (CodeMirror 6, downloaded on first use through dynamic
`import()`): **Code** shows only the source, **Split** shows source and design side by side (stacked
below 720 px) and keeps them in sync both ways, **Format** re-indents the source from the current
document. Source edits are applied 250 ms after the last keystroke, through the schema allowlist, as
one undoable change; what you typed stays as typed until Format. Design tools are disabled in Code
view; read-only / disabled make the source read-only.

`textColor` and `highlight` open a palette bar: the `colors` swatches, **Custom colour…** (the
browser's colour picker), **Remove colour**, and up to 8 recently used colours (per editor, not
stored). `specialChars` opens a character bar; a click inserts the character at the cursor and the
bar stays open for more. Esc closes either bar while the editor has focus.

While the cursor is in a code block (and the editor is editable) a **code bar** appears with a language
picker. A block with a language is syntax-highlighted (lowlight / highlight.js; `hljs-*` classes coloured
by the `--we-editor-code-*` theme variables) and serialized as `<pre><code class="language-x">`. Pasted
`language-x` / `lang-x` classes and `data-language` are kept when they pass `weEditorSafeCodeLanguage`.

`media` embeds a YouTube or Vimeo video from a page, share or embed link (`youtube.com/watch?v=…`,
`youtu.be/…`, `/shorts/…`, `vimeo.com/123…`). Output is an `<iframe>` with the canonical player URL
(`youtube-nocookie.com` for YouTube) — consumers who render it need `frame-src
https://www.youtube-nocookie.com https://player.vimeo.com` in their CSP. In the editor the video sits
under a click shield: a click selects the block.

`findReplace` (also **Ctrl/Cmd+F** while the editor has focus) opens the find bar: search text (a short
selection is taken over), match count, previous/next (Shift+Enter / Enter), match case, whole words,
replace and replace all; Esc closes it and removes the highlights. Search text is literal, never a
pattern. In read-only mode only finding is offered.

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
| Ctrl/Cmd+F | Find & replace |
| Tab / Shift+Tab | Nest / lift a list item; next / previous table cell (elsewhere Tab moves focus) |

Input rules, typed at the start of a block (not inside code blocks): `# ` … `###### ` heading,
`- ` / `* ` bulleted list, `1. ` numbered list (the number becomes `start`), `> ` quote, ```` ``` ````
code block. Backspace right after a rule fired restores the typed text.

**Autolink:** a URL (`http://`, `https://` or `www.`) becomes a link when a space or Enter follows it
and in pasted content; closing punctuation (`.`, `,`, `)` …) stays outside the link, `www.` links get
`https://`. Pasting a single URL over selected text links the selection. Backspace right after the
space undoes the link. Code is never linked; every `href` passes `weEditorSafeUrl`.

## HTML helpers

| Function | Description |
|---|---|
| `weEditorSanitizeHtml(html)` | HTML → schema → HTML. The allowlist sanitizer without an editor |
| `weEditorParseHtml(html, schema?)` | HTML → ProseMirror document |
| `weEditorSerializeHtml(doc, schema?)` | ProseMirror document → HTML (`''` for an empty doc) |
| `weEditorSafeUrl(url)` | URL if http/https/mailto/tel/relative, else `null` |
| `weEditorEmbedUrl(url)` | Canonical YouTube / Vimeo player URL for a page or embed link, else `null` |
| `weEditorSafeImageSrc(src)` | Image URL if http/https/relative or a base64 raster `data:image/…`, else `null` |
| `weEditorSafeColor`, `weEditorSafeFontSize`, `weEditorSafeFontFamily` | CSS value validators |

Output format: inline styles are written by the browser's CSSOM, so colours come out as `rgb(...)`
and declarations end with `;` (`<span style="color: rgb(255, 0, 0);">`).

## Schema and commands

`weEditorSchema` (nodes: `paragraph`, `heading`, `blockquote`, `code_block`, `horizontal_rule`,
`bullet_list`, `ordered_list`, `list_item`, `task_list`, `task_item`, `hard_break`, `embed` (`src`, `title`; only `weEditorEmbedUrl` URLs), `table`, `table_row`, `table_cell`, `table_header` (`colspan`, `rowspan`,
`colwidth`; spans clamped to `WE_EDITOR_MAX_CELL_SPAN` = 100 on parse), `image` (inline;
`src`, `alt`, `title`, `width`, `align`); marks: `link`,
`bold`, `italic`, `underline`, `strike`, `subscript`, `superscript`, `code`, `font_family`,
`font_size`, `text_color`, `highlight`).

Commands (ProseMirror `Command`s, usable with `editorView`): `weEditorToggleMark`,
`weEditorSetStyle`, `weEditorClearFormatting`, `weEditorSetBlock`, `weEditorSetAlign`,
`weEditorIndent`, `weEditorOutdent`, `weEditorToggleList`, `weEditorToggleWrap`,
`weEditorToggleCodeBlock`, `weEditorInsertHorizontalRule`, `weEditorInsertHardBreak`,
`weEditorSetLink`, `weEditorRemoveLink`, `weEditorSetImage(attrs)` (insert, or update the selected
image), `weEditorInsertEmbed(url)`, `weEditorInsertText(text)`, `weEditorCleanOfficeHtml(html)` (the paste cleaner on its own),
`weEditorPasteFromOffice()` (its plugin, in `weEditorPlugins()`), `weEditorSetLineHeight(value | null)`, `weEditorLineHeightAt(state)`,
`weEditorChangeCase('upper' | 'lower' | 'title' | 'sentence', locale?)`, `weEditorPaintMarks(marks)`, `weEditorFormatHtml(html, indent?)` (pretty-print for display; inert
parse, text out), `weEditorCreateSourceEditor(element, options)` (the CodeMirror HTML editor on its
own), `weEditorSetCodeLanguage(language | null)`, `weEditorCodeLanguageAt(state)`
(`undefined` outside code blocks), the `weEditorCodeHighlight()` plugin (in `weEditorPlugins()`), `weEditorSetSearch({ search, replace, caseSensitive, wholeWord })`
(highlight / clear a query), `weEditorSearchCount(state)` (`{ current, total }`, capped at
`WE_EDITOR_MAX_SEARCH_COUNT` = 1000; `findNext`, `findPrev`, `replaceNext`, `replaceAll` come from
`prosemirror-search`), `weEditorInsertTable(rows, cols, header = true)` (max `WE_EDITOR_MAX_TABLE_SIZE` = 50). Row,
column, merge and header commands come from `prosemirror-tables` (`addRowAfter`, `mergeCells`, …) and
work on `editorView` directly; queries `weEditorImageAt`, `weEditorMarkActive`, `weEditorMarkAt`,
`weEditorBlockLevel`, `weEditorAlignAt`, `weEditorListAt`, `weEditorLinkAt`.

Node views: `WeEditorImageView` (resize handle), `WeEditorEmbedView` (sandboxed video under a click shield).

State: `weEditorCreateState(html)`, `weEditorPlugins()`, `weEditorInputRules()`, `weEditorAutolink()`,
`weEditorAutolinkHref(text)`, `weEditorStats(doc)`,
`WeEditorTaskItemView`.

## Tokens

| Token | Default | Docs |
|---|---|---|
| `WE_EDITOR_LOCALE` | `weEditorLocaleEn` | [localization.md](localization.md) |
| `WE_EDITOR_ICONS` | `weEditorDefaultIcons` | [theming.md](theming.md) |
