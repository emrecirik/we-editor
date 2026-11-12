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
- Keyboard shortcuts (Ctrl/Cmd+B/I/U/E, Ctrl/Cmd+Shift+X, Ctrl/Cmd+,/., undo/redo, Shift+Enter,
  Tab/Shift+Tab in lists).
- Schema-based HTML allowlist: `weEditorSanitizeHtml`, `weEditorParseHtml`,
  `weEditorSerializeHtml`, `weEditorSafeUrl` and CSS value validators.
- ProseMirror commands and queries exported for advanced use (`weEditorToggleList`,
  `weEditorSetLink`, …).
- Theme `styles/we-editor-theme.scss` (light, `prefers-color-scheme` dark, `[data-theme='dark']`).
- `WE_EDITOR_LOCALE` with `weEditorLocaleEn` and `weEditorLocaleTr`; `WE_EDITOR_ICONS` inline SVG set.
