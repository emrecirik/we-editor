## What and why

<!-- What changes for the people using the editor, and the issue it closes, if any. -->

## Checklist

- [ ] `npm run build:lib` and `npm test` pass
- [ ] New behaviour has a `*.spec.ts`
- [ ] Colours and spacing go through `var(--we-editor-*, fallback)`; new variables are in all three blocks of `styles/we-editor-theme.scss`
- [ ] New text is a `WeEditorLocale` key, filled in `weEditorLocaleEn` and `weEditorLocaleTr`
- [ ] HTML that reaches the page goes through the schema; no `innerHTML` with document content
- [ ] Anything a consumer imports is exported from `src/public-api.ts`
- [ ] Docs and `CHANGELOG.md` (under "Unreleased") are updated
