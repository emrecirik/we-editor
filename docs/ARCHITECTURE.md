# Architecture

`we-editor-angular` is an Angular wrapper and feature layer around **ProseMirror**. Why ProseMirror
(and not TipTap or CKEditor): [`decisions/0001-editor-core.md`](decisions/0001-editor-core.md).

## Layers

```
projects/we-editor/src/lib/
├── core/                         framework-free, unit-tested ProseMirror code
│   ├── we-editor-schema.ts       nodes + marks = the HTML allowlist; URL/CSS value validators
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
