# Architecture

`we-editor-angular` is an Angular wrapper and feature layer around **ProseMirror**. Why ProseMirror
(and not TipTap or CKEditor): [`decisions/0001-editor-core.md`](decisions/0001-editor-core.md).

## Layers

```
projects/we-editor/src/lib/
├── core/                         framework-free, unit-tested ProseMirror code
│   ├── we-editor-schema.ts       nodes + marks = the HTML allowlist; URL/CSS value validators
│   ├── we-editor-code.ts         code block language, lowlight highlighting plugin
│   ├── we-editor-format.ts       HTML pretty-printer for the source view
│   ├── we-editor-source.ts       CodeMirror 6 source editor (dynamic import)
│   ├── we-editor-html.ts         parse (HTML → doc), serialize (doc → HTML), sanitize (both)
│   ├── we-editor-commands.ts     every toolbar action as a ProseMirror Command
│   └── we-editor-plugins.ts      history, keymap, state factory, task-item node view
├── models/                       public contracts: locale, icons, toolbar items/options
├── testing/                      DOM baseline (markup guard)
└── we-editor.component.*         <we-editor>: EditorView host, toolbar, link bar, ControlValueAccessor
```

Rules of thumb:

- `core/` never imports Angular. Anything that can be expressed as a `Command` lives there and is
  tested with plain `EditorState`s (`we-editor-commands.spec.ts`), not through the component.
- The component owns UI only: it maps toolbar items to commands (the `BUTTONS` table), recomputes a
  small `ui` state object after every transaction (active/enabled per item, current block, styles),
  and bridges to forms.
- Every public symbol is exported from `src/public-api.ts`, including the core functions; later
  phases and consumers build on them.

## Data flow

1. `writeValue(html)` / `setHtml(html)` → `weEditorParseHtml` → new `EditorState` (history reset,
   no change emitted).
2. User input → transaction → `dispatchTransaction` → `apply` → if `docChanged`, `onChange(getHtml())`.
3. `getHtml()` → `weEditorSerializeHtml` → `''` for an empty document (so `Validators.required` works).

## Security model

- **Schema = allowlist.** HTML is parsed with `DOMParser` into a detached, inert document (scripts
  don't run, images don't load) and mapped onto the schema; unknown elements, attributes and styles
  disappear. Output is produced only by `DOMSerializer` from the schema.
- `href` passes `weEditorSafeUrl` (http/https/mailto/tel/relative) on parse, on command, and again on
  serialize. CSS values (`color`, `font-size`, `font-family`, `background-color`) pass regex
  validators; anything else is dropped.
- `line-height` on paragraphs and headings passes `weEditorSafeLineHeight` (unitless 0.5–5).
- A code block's `language` (from `class="language-x"`, `lang-x` or `data-language`) passes
  `weEditorSafeCodeLanguage` (letters, digits, `+ # . _ -`, max 32) before it is written into `class`.
  Highlighting only adds ProseMirror decorations (classes); it never produces HTML strings.
- Pasted Office / Docs HTML is cleaned by `weEditorCleanOfficeHtml` in an inert `DOMParser` document; the
  result still goes through ProseMirror's clipboard parser and the schema like any paste.
- HTML source view text is never rendered: it is parsed by `weEditorParseHtml` (inert document +
  schema) and replaces the document; `weEditorFormatHtml` also parses inertly and returns text only.
- Table cells keep `background-color` (through `weEditorSafeColor`) and `vertical-align` (top / middle /
  bottom only); a table `<caption>` is plain text (whitespace collapsed, 500 characters). Background colour
  on a `<td>`/`<th>` is the cell's attribute — the highlight rule skips elements read inside a table row.
- A figure's image link (`href`) and an image's link mark pass `weEditorSafeUrl`; a `<figure>` without a
  safe `<img>` is not a figure (its caption text survives as a paragraph).
- Image `src` passes `weEditorSafeImageSrc`: http/https/relative, or a base64 raster
  `data:image/(png|jpeg|gif|webp|avif)` URL. SVG and other `data:` types are dropped (on parse, on
  command, in the node view, on serialize). Uploads accept the same raster types only.
- `<iframe>` is allowed only for YouTube / Vimeo: `weEditorEmbedUrl` takes the video id from the
  parsed `src` (strict id patterns, exact host match) and rebuilds the player URL; every other attribute
  (`srcdoc`, `onload`, `sandbox`, …) is dropped and fixed ones are written. In the editor the iframe sits
  behind a click shield with `sandbox="allow-scripts allow-presentation"` (Vimeo); YouTube's player
  needs `allow-same-origin` too (it stays black without it, checked 2026-11-12) — safe because the frame
  is always cross-origin to the host page.
- Table cells: `colspan`/`rowspan` are clamped to 1–100 and `data-colwidth` to whole pixels ≤ 4000 on
  parse, so hostile HTML cannot build a huge table map.
- The page's live DOM is never written with `innerHTML` from document content. The only
  `[innerHTML]` binding renders the developer-provided SVG icons (`WE_EDITOR_ICONS`), the same
  pattern as we-grid.
- Links with `target="_blank"` always get `rel="noopener noreferrer"`.
- F3's preview will render in a `sandbox` iframe (no `allow-scripts`), fed with sanitized HTML.

Known limit: the form value is not normalized until the first edit. `writeValue` does not echo the
sanitized HTML back to the control (that would mark it dirty), so a consumer who saves an untouched
form saves what it put in. Open decision, see `HANDOVER.md`.

## Theming and i18n

- `styles/we-editor-theme.scss` holds every default in three blocks (`:root`,
  `prefers-color-scheme: dark`, `[data-theme='dark']`). The component SCSS reads only
  `var(--we-editor-*, fallback)`.
- The component uses `ViewEncapsulation.None` because ProseMirror creates the content DOM outside
  Angular's emulated encapsulation; every rule is scoped under `.we-editor`.
- `WE_EDITOR_LOCALE` (`weEditorLocaleEn`, `weEditorLocaleTr`) for every string; `WE_EDITOR_ICONS`
  for every icon.

## Angular compatibility

Built on Angular 18 (partial Ivy compilation) so one artifact serves 18.2–22; proved by
`.github/workflows/compat.yml`. Templates use built-in control flow (`@if/@for/@switch`, Angular
17+), `@Input` decorators (not signal inputs) and `ChangeDetectorRef.markForCheck()`, so the
component works with and without zone.js.
