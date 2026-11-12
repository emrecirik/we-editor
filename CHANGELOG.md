# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added

- HTML source view (P6, F3.1/F3.2): new `source` toolbar item with **Code** and **Split** views
  (two-way sync, debounced 250 ms, through the schema) and **Format**; CodeMirror 6 loaded on demand
  via dynamic `import()`; `weEditorFormatHtml`, `weEditorCreateSourceEditor`; locale keys `source`,
  `sourceCode`, `sourceSplit`, `sourceFormat`; DOM baseline re-recorded (button + `we-editor__body`
  wrapper around the content). New dependencies `@codemirror/state`, `view`, `commands`, `language`,
  `lang-html`, `@lezer/highlight` (all MIT); decision note `docs/decisions/0003-source-view-codemirror.md`.

- Code block language + syntax highlighting (P5): a code bar with a language picker appears inside code
  blocks; 23 languages coloured through lowlight / highlight.js; output `<pre><code class="language-x">`
  (also read from `lang-x` and `data-language`, validated by `weEditorSafeCodeLanguage`). New
  `codeLanguages` input, `WE_EDITOR_DEFAULT_CODE_LANGUAGES`, `weEditorSetCodeLanguage`,
  `weEditorCodeLanguageAt`, `weEditorCodeHighlight`; theme variables `--we-editor-code-keyword`,
  `-string`, `-comment`, `-number`, `-title`, `-attr`; locale keys `codeLanguage`, `codeLanguagePlain`
  (breaking for hand-written full locale objects). New dependencies `lowlight` (MIT) and
  `highlight.js` (BSD-3-Clause); decision note `docs/decisions/0002-code-highlighting.md`.

## 0.1.0 — 2026-11-12

First public release.

### Added

- `<we-editor>` standalone component on ProseMirror, a `ControlValueAccessor` whose value is an
  HTML string (`''` for an empty document); `readonly` input, disabled state from the form control,
  `getHtml()`, `setHtml()`, `focus()`, `editorView`.
- Toolbar (`toolbar` input, `WE_EDITOR_DEFAULT_TOOLBAR`): undo/redo, paragraph/H1–H6, font family,
  font size, bold, italic, underline, strikethrough, subscript, superscript, inline code, text
  colour, highlight, alignment, bulleted/numbered/task lists, indent/outdent, quote, code block,
  horizontal line, link bar (with new-tab option), unlink, clear formatting.
- `placeholder` input; `stats` output and `getStats()` (word/character count), `weEditorStats(doc)`.
- Markdown-style input rules (`# `, `- `, `* `, `1. `, `> `, ```` ``` ````; Backspace undoes the rule),
  `weEditorInputRules()`. New dependency `prosemirror-inputrules` (MIT).
- Images (F1.2): `image` toolbar item and image bar (URL, upload, alt text, width, position),
  resize handle, paste/drop of image files, `imageUpload` input (base64 `data:` URL when unset),
  `image` schema node, `weEditorSetImage`, `weEditorImageAt`, `weEditorSafeImageSrc`,
  `WeEditorImageView`. New locale keys `image*` (breaking for hand-written full locale objects). DOM
  baseline re-recorded for the new toolbar button.
- Tables (F1.1): `table` toolbar item with an insert bar (rows, columns, header row) and a table
  tools bar (add/delete rows and columns, merge/split cells, header row/column, delete table);
  column resize by drag, cell selection, Tab / Shift+Tab between cells; `weEditorInsertTable`,
  `WE_EDITOR_MAX_CELL_SPAN`, `WE_EDITOR_MAX_TABLE_SIZE`; new locale keys `table*`; DOM baseline
  re-recorded. New dependency `prosemirror-tables` (MIT).
- Find & replace (P1 / F1.7): `findReplace` toolbar item and Ctrl/Cmd+F, match highlights and count,
  previous/next, match case, whole words, replace, replace all; `weEditorSetSearch`,
  `weEditorSearchCount`; theme variables `--we-editor-search-match-bg`,
  `--we-editor-search-active-bg`; locale keys `find*`/`replace*`; DOM baseline re-recorded. New
  dependency `prosemirror-search` (MIT).
- Autolink (P2): URLs become links after a space or Enter and in pasted content; a URL pasted over
  a selection links it; `weEditorAutolink`, `weEditorAutolinkHref`.
- Video embeds (P3): `media` toolbar item for YouTube / Vimeo links, `embed` schema node (iframe
  allowlist, canonical player URL rebuilt from the video id), `weEditorEmbedUrl`, `weEditorInsertEmbed`,
  `WeEditorEmbedView`; locale keys `media*`; DOM baseline re-recorded.
- Colour palette and special characters (P4): `textColor` / `highlight` open a palette bar (swatches,
  custom colour, remove colour, recent colours) instead of the native picker; new `specialChars`
  toolbar item with a symbol and emoji picker; `colors` and `specialCharacters` inputs,
  `WE_EDITOR_DEFAULT_COLORS`, `WE_EDITOR_DEFAULT_SPECIAL_CHARACTERS`, `weEditorInsertText`; locale keys
  `colorRemove`, `colorCustom`, `colorRecent`, `specialChars`; DOM baseline re-recorded.
- Keyboard shortcuts (Ctrl/Cmd+B/I/U/E, Ctrl/Cmd+Shift+X, Ctrl/Cmd+,/., undo/redo, Shift+Enter,
  Tab/Shift+Tab in lists).
- Schema-based HTML allowlist: `weEditorSanitizeHtml`, `weEditorParseHtml`,
  `weEditorSerializeHtml`, `weEditorSafeUrl` and CSS value validators.
- ProseMirror commands and queries exported for advanced use (`weEditorToggleList`,
  `weEditorSetLink`, …).
- Theme `styles/we-editor-theme.scss` (light, `prefers-color-scheme` dark, `[data-theme='dark']`).
- `WE_EDITOR_LOCALE` with `weEditorLocaleEn`, `weEditorLocaleTr`, `weEditorLocaleDe`, `weEditorLocaleFr`
  and `weEditorLocaleEs`; `WE_EDITOR_ICONS` inline SVG set.
