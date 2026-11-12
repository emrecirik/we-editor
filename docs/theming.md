# Theming

The editor reads only CSS custom properties (`var(--we-editor-*, fallback)`); it ships no CSS
framework and no icon font. Add the default theme once:

```json
// angular.json → build.options.styles
"node_modules/we-editor-angular/styles/we-editor-theme.scss"
```

or copy that file and change values. Dark mode: `data-theme="dark"` on an ancestor (usually
`<html>`), or automatic through `prefers-color-scheme` unless `data-theme="light"` is set.

## Custom properties

| Property | Used for |
|---|---|
| `--we-editor-bg` | Editor background |
| `--we-editor-font-color` | Text |
| `--we-editor-muted-color` | Done task items, secondary text |
| `--we-editor-border-color` | Outer border, toolbar divider, inputs |
| `--we-editor-radius` | Outer corner radius |
| `--we-editor-font-family`, `--we-editor-font-size`, `--we-editor-line-height` | Content typography |
| `--we-editor-content-padding` | Padding of the editable area |
| `--we-editor-min-height` | Minimum height of the editable area |
| `--we-editor-accent-color` | Focus border, primary button, focus outlines |
| `--we-editor-focus-ring` | Focus shadow |
| `--we-editor-toolbar-bg`, `--we-editor-toolbar-gap` | Toolbar and link bar |
| `--we-editor-btn-color`, `--we-editor-btn-hover-bg`, `--we-editor-btn-active-bg`, `--we-editor-btn-active-color`, `--we-editor-btn-disabled-opacity` | Toolbar buttons |
| `--we-editor-separator-color` | Toolbar separators |
| `--we-editor-input-bg` | Selects, link input, secondary buttons |
| `--we-editor-link-color` | Links in content |
| `--we-editor-code-bg`, `--we-editor-code-color`, `--we-editor-code-font-family` | Inline code and code blocks (code colour also used for the link error) |
| `--we-editor-fullscreen-z-index` | Stacking order of the editor in full screen (default `1000`) |
| `--we-editor-code-keyword`, `--we-editor-code-string`, `--we-editor-code-comment`, `--we-editor-code-number`, `--we-editor-code-title`, `--we-editor-code-attr` | Syntax colours of highlighted code blocks (`hljs-*` token classes) |
| `--we-editor-blockquote-border`, `--we-editor-blockquote-color` | Quotes |
| `--we-editor-hr-color` | Horizontal rule |
| `--we-editor-selection-bg` | Text selection |
| `--we-editor-placeholder-color` | Placeholder text in an empty editor |
| `--we-editor-search-match-bg` | Find & replace: every match |
| `--we-editor-search-active-bg` | Find & replace: the current match |
| `--we-editor-swatch` | Set by the component on the colour buttons to show the current colour |

A new property is added to all three blocks of `we-editor-theme.scss`.

## Icons

Icons are inline SVG strings on the `WE_EDITOR_ICONS` token. Replace some or all:

```ts
providers: [{ provide: WE_EDITOR_ICONS, useValue: { ...weEditorDefaultIcons, bold: '<svg …>' } }]
```

Icon markup is rendered as trusted HTML — provide only your own SVG, never user input.
