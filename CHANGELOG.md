# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

Target: 0.1.0 — first public release (roadmap phase F0).

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
- Keyboard shortcuts (Ctrl/Cmd+B/I/U/E, Ctrl/Cmd+Shift+X, Ctrl/Cmd+,/., undo/redo, Shift+Enter,
  Tab/Shift+Tab in lists).
- Schema-based HTML allowlist: `weEditorSanitizeHtml`, `weEditorParseHtml`,
  `weEditorSerializeHtml`, `weEditorSafeUrl` and CSS value validators.
- ProseMirror commands and queries exported for advanced use (`weEditorToggleList`,
  `weEditorSetLink`, …).
- Theme `styles/we-editor-theme.scss` (light, `prefers-color-scheme` dark, `[data-theme='dark']`).
- `WE_EDITOR_LOCALE` with `weEditorLocaleEn` and `weEditorLocaleTr`; `WE_EDITOR_ICONS` inline SVG set.
