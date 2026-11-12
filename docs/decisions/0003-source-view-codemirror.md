# 0003 — HTML source view: CodeMirror 6, loaded on demand

- **Status:** accepted (2026-11-12)
- **Deciders:** Emre CIRIK (delegated: "go with the recommendation")

## Context

Roadmap P6 / F3.1–F3.2: an HTML source view with highlighting, and a split view where source and
design stay in sync — offered by CKEditor 5 (source editing), TinyMCE (code plugin) and Froala, mostly
as a plain `<textarea>`. We want a real code editor without making every consumer pay for it.

## Options

| | CodeMirror 6 | `<textarea>` + highlight overlay | Monaco |
|---|---|---|---|
| Licence | MIT (all `@codemirror/*`, `@lezer/*`, `style-mod`, `crelt`) | — | MIT |
| Editing | line numbers, undo, auto-close tags, HTML parser, accessible contenteditable | caret/scroll sync between two layers is fragile; no undo grouping | full IDE, workers, ~2 MB |
| Size | ~160 kB gzip, split out of the main bundle by dynamic `import()` | ~0 | far too large for an editor component |
| Theming | `EditorView.theme` + `HighlightStyle` with CSS variables | CSS | own theme system |

## Decision

**CodeMirror 6, imported with dynamic `import()`** from `core/we-editor-source.ts`. The packaged
FESM keeps `import('@codemirror/…')`, so the consumer's bundler emits a lazy chunk that loads when a
source view is first opened. Colours reuse `--we-editor-*` variables (syntax: the
`--we-editor-code-*` set from decision 0002). No Tab binding (no keyboard trap).

Source text is never rendered: it goes through `weEditorParseHtml` (schema allowlist) and replaces
the document as one undoable transaction, debounced 250 ms. Design edits re-format the source.

## Consequences

- Six `@codemirror` / `@lezer` packages are runtime `dependencies` (installed even when unused; not
  downloaded by browsers unless the view opens). Bundlers without dynamic-import support would
  inline them — none of Angular's do.
- What the user types stays as typed until **Format**; the schema-normalized HTML is what the form
  control receives. Unknown markup silently disappears from the design view — the visible
  difference teaches the allowlist.
- The live preview in a sandboxed iframe with device widths (F3.3) is still open.
