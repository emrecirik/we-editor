# Contributing

Thanks for considering a contribution to `we-editor-angular`.

## Setup

```bash
npm install
```

## Development loop

```bash
npm run build:lib     # build the library
npm test              # run the unit tests (headless Chrome)
npm start             # try changes in the playground app
```

The playground app (`projects/playground`) is a dev/documentation sandbox — when adding a feature,
add or extend a demo section there so it's exercised outside of unit tests too.

## Guidelines

- Keep the library free of any styling-framework dependency (no Bootstrap, no Material, no
  hardcoded colors) — everything visual goes through a `var(--we-editor-*, fallback)` custom
  property.
- No hardcoded user-facing text — read/add strings through `WeEditorLocale` (see
  `we-editor-locale.model.ts`) and update both `weEditorLocaleEn` and `weEditorLocaleTr`.
- No icon-font dependency — icons are inline SVG through the `WE_EDITOR_ICONS` token (see
  `we-editor-icons.model.ts`).
- Comments and identifiers are in English.
- A new runtime dependency needs a permissive licence (MIT/BSD/ISC/Apache-2.0), checked in its own
  `package.json`, and a row in `docs/LICENSES.md`. CKEditor code is never used or copied.
- Add or update unit tests (`*.spec.ts`) for any behavioral change.
- Run `npm run build:lib` and `npm test` before opening a PR — both must be clean. CI runs the
  same two steps plus a build of the playground.

## Reporting issues

Please include: Angular version, `we-editor-angular` version, a minimal reproduction (StackBlitz or
a small repo), and the expected vs. actual behavior.
