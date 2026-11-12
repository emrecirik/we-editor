# Handover — read this first

Last updated: 2026-11-12 (session 3). Owner: Emre CIRIK (`emrecirik`).

## Current state

- Angular 18.2 workspace (mirrors `C:\Projects\we-grid`): library `projects/we-editor` (npm name
  `we-editor-angular`, **0.1.0 on npm since 2026-11-12** — published by hand from `dist/we-editor`;
  npm put the first version through *staged publishing* (a `0.0.0-stage` placeholder version stays in
  the version list, harmless). Trusted Publishing still to be bound — see manual steps), `projects/playground` (feature sandbox), `projects/studio` (the live demo, mirrors we-grid Studio:
  EN/TR, light/dark, Editor / Safe HTML / Get started tabs),
  CI / compat / release / pages workflows, `.claude/` agent + rule + skills (local only, gitignored).
- Core decision: **ProseMirror used directly** — `docs/decisions/0001-editor-core.md`.
- Public repo `github.com/emrecirik/we-editor`, `main` pushed (HTTPS remote — this machine has no
  GitHub SSH key; `gh auth setup-git` is the credential helper).
- **Live:** https://emrecirik.github.io/we-editor/ redirects to the Studio at `/studio/`; the old landing
  page is `/features.html`; `/demo/` redirects to the Studio. Rebuilt by `.github/workflows/pages.yml` on
  every push. Repo description, homepage and topics set (2026-11-12).
- Author name is written **`Emre CIRIK`** everywhere (no Turkish letters) — fixed 2026-11-12 at Emre's request.
- Goal set by Emre (2026-11-12): **no feature CKEditor 5 / TinyMCE / TipTap / Froala / Quill /
  Lexical have that we lack, plus features they do not have**; then publish free (MIT) on npm. Gap
  matrix with sources: `docs/COMPETITORS.md`; ordered work list: section **P** of `docs/ROADMAP.md`.

### Done in session 3 (2026-11-12)

| Item | What | Commit |
|---|---|---|
| Name | `Emre Çırık` → `Emre CIRIK` in READMEs, landing page, decision note | `5b5ecf3` |
| Studio | `projects/studio` live demo like we-grid / we-report; CI builds it; Pages serves it at `/studio/` | `8af368e` |
| Locales | `weEditorLocaleDe` / `Fr` / `Es` (UI languages now as in we-grid) | `b5d12d9` |
| P4 | Colour palette bar (swatches, custom, remove, recent) + special characters / emoji picker | `41008d9` |
| 0.1.0 | Changelog section, READMEs (npm badge, feature list, status); published to npm by hand, smoke-installed in a clean folder | `d934fab` |

### Done in session 2 (each one commit, pushed, CI green)

| Item | What | Commit |
|---|---|---|
| F0.12 | `placeholder` input, `stats` output / `getStats()`, Markdown input rules (`prosemirror-inputrules`) | `6130669` |
| F1.2 | Images: URL / upload / paste / drop, resize handle, position, alt text, `imageUpload` hook, `weEditorSafeImageSrc` | `ae1ab33` |
| F1.1 | Tables (`prosemirror-tables`): insert bar, table tools bar, merge/split, header row/column, column resize, Tab; spans clamped 1–100 | `bacdcc4` |
| Pages | Landing page `docs/index.html`, screenshots `docs/images/`, demo under `/demo/`, `docs/COMPETITORS.md`, ROADMAP section P | `727ea73` |
| P1 | Find & replace (`prosemirror-search`): Ctrl/Cmd+F bar, count, match case, whole words, replace all | `cb2689d` |
| P2 | Autolink: after space / Enter, on paste, URL pasted over a selection | `e18122c` |
| P3 | YouTube / Vimeo embeds: iframe allowlist, player URL rebuilt from the video id | `3fd8db9` |

Also: `docs/knowledge/` was removed from the (unpushed) history before the first push and is now
excluded locally (`.git/info/exclude`), as in we-grid.

### Verified at the end of session 2

| Check | Result |
|---|---|
| `npm test` | **69 / 69 SUCCESS** (ChromeHeadless) |
| `npm run build:lib`, `npx ng build playground` | OK |
| GitHub: CI, Angular compatibility (19–22 matrix), Pages | all green on `3fd8db9` |
| Playground in a real browser (Playwright) | every feature above clicked through; no console errors from our code |
| Live demo / landing page | load, images present, demo editor works under `/we-editor/demo/` |

### Not verified / not done

- No screen-reader check; toolbar has no roving tabindex (F0.13).
- Zoneless consumer app not checked by hand (`.claude/rules/angular-compat.md`).
- Drag-and-drop of image files and pasting a URL over a selection: covered by specs only.
- TipTap / Lexical cells in `docs/COMPETITORS.md` partly from package knowledge, not fetched pages;
  the landing-page comparison table is a short, hand-checked subset — re-check before quoting.
- `SampleUsageProjects/*` are still empty placeholders.

## Next tasks (in order)

0. ~~First npm publish~~ — done. **Bind Trusted Publishing** (manual steps below); later releases go
   through the `editor-release` skill (tag-driven). No `v0.1.0` tag / GitHub release exists yet.
1. **P5…P18** in `docs/ROADMAP.md`
   order: code-block language + highlighting, source HTML view + preview (decision note on the
   code-editor dependency first), line height / case change / format painter / styles, full screen +
   autosave + status bar, paste from Word / Google Docs, image & table captions + cell properties,
   mentions + slash commands, Markdown in/out, bubble toolbar / drag handle, page break / details /
   footnotes / TOC, math, a11y pass (F0.13), RTL + more locales, DOCX / PDF.
2. Keep `docs/COMPETITORS.md` statuses, the landing page feature cards / "coming next" note and
   `docs/images/*` (see the `editor-screenshots` skill) in step with each item.
3. When P is done: first npm release (see manual steps), free, then the F2 / F3 differentiators
   (formula tables, design/code/split view, e-mail mode, mail merge).

Before F2 and F3 start, write the decision notes they call for (`<we-sheet>` integration; code
editor dependency for the HTML view).

## How to work (agreed with Emre, 2026-11-12)

- Per feature: code in `core/` + component, specs, playground check in a real browser, docs
  (`api.md`, `localization.md`, `theming.md`, `ARCHITECTURE.md` for safety rules), CHANGELOG,
  ROADMAP/COMPETITORS status, `editor-contract-reviewer` agent → then **commit + push without asking**
  and check the GitHub runs.
- Permissive (MIT/BSD/ISC/Apache) official or widely used packages may be added for parity items
  without asking: verify the licence in `node_modules`, add to `docs/LICENSES.md`, both
  `package.json` files and `ng-package.json` `allowedNonPeerDependencies`; mention it in the report.
- Still ask for: destructive git operations, tags / releases, npm publish.
- DOM baseline (`testing/we-editor-dom-baseline.ts`) changes with every new default toolbar button;
  re-record from the failing spec's "actual" value (the file has CRLF line endings) and say so in the
  changelog.

## Commands

```bash
nvm use 24.19.0             # same Node as the other projects on this machine
npm install
npm run build:lib           # must precede any playground build/serve
npm test
npm start                   # playground on http://localhost:4200
npx ng build playground
gh run list --limit 5       # CI / compat / Pages after a push
bash .github/compat/probe.sh 22 <scratch-dir> "$PWD/.github/compat/probe.ts" "$PWD/.github/compat/probe.html" <tarball>
```

## Open decisions (ask Emre)

1. **Normalize the form value on `writeValue`?** Today the control keeps the raw HTML it was given
   until the first edit (sanitized HTML is only emitted after a change). Option: emit the sanitized
   value once without marking dirty. Matters for consumers who save untouched forms.
2. **Colour output format.** Inline styles come out as CSSOM text (`rgb(255, 0, 0);`). Keep, or write
   our own style serializer to preserve `#hex` (likely needed anyway for e-mail mode, F3.8)?
3. ~~Colour UI~~ — going with a palette popover in P4 (parity list).
4. **`<we-sheet>` reuse (F2)**: optional peer dependency on `we-grid-angular` vs. own engine. we-grid's
   formula engine is not exported as a standalone API today — would need a we-grid change (separate
   repo, separate decision).
5. **Scope of F3 code view dependency** (CodeMirror 6, MIT, ~bundle cost) vs. a lightweight
   `<textarea>` + highlight overlay.
6. **Images without an `imageUpload` hook** are embedded as base64 `data:` URLs (chosen so uploads
   work out of the box). Keep, or require the hook / add an opt-in flag?

## Known risks

- **Playground dev server + `build:lib`:** rebuilding the library while `npm start` runs wipes
  `dist/we-editor` and the server fails with "Cannot find module 'we-editor-angular'"; restart it.
  The machine also ran low on memory late in session 2 (Claude Code stopped the dev server twice).
- **Embeds:** the editor's YouTube iframe needs `allow-same-origin` (black player without it; the
  frame is cross-origin, so it only gets its own origin). Vimeo runs with the stricter sandbox and logs
  two CORS errors from its own Cloudflare script — harmless. Consumers rendering our HTML need
  `frame-src` for youtube-nocookie.com / player.vimeo.com in their CSP.
- **Tables:** output has no border styles (consumer CSS decides); column widths only as
  `data-colwidth`. Tab in the last cell leaves the table (no auto-added row).
- Floated images: list markers next to a floated image overlap it (browser default).
- `stats` is not emitted on `writeValue`/`setHtml` (avoids ExpressionChanged errors in consumers);
  consumers read `getStats()` for loaded content.
- **Serialization on every keystroke** (`apply()` → `getHtml()`); marked `shortcut:` in
  `we-editor.component.ts`. Debounce or lazy serialize if large documents get slow.
- `ViewEncapsulation.None`: all editor CSS is global under `.we-editor`; consumer CSS for `p`, `ul`
  etc. can leak into the content area.
- Task list HTML uses `data-type="taskList"/"taskItem"` (TipTap-compatible on purpose).
- ProseMirror packages are `^1.x` ranges in the published package; a breaking 2.0 would need a
  bound update.
- Windows: Karma's ChromeHeadless sometimes reports "not killed in 2000 ms" at exit; harmless.

## Manual steps for Emre

1. ~~GitHub repo~~ — done 2026-11-12 (public, pushed). ~~GitHub Pages~~ — enabled (workflow build).
2. **npm Trusted Publishing** — the Trusted Publisher form lives in an existing package's settings
   (as of the last check; confirm on docs.npmjs.com/trusted-publishers), so the first version needs
   one manual publish:
   - `npm run build:lib && npm test`, then `cd dist/we-editor && npm publish --access public`
     (2FA: security key is unusable from the CLI → recovery code `--otp=<code>`; or publish
     `0.0.1-alpha.0` as a placeholder with `--tag alpha`).
   - On npmjs.com → package `we-editor-angular` → Settings → **Trusted Publisher** → GitHub Actions:
     organization/user `emrecirik`, repository `we-editor`, workflow filename `release.yml`,
     environment empty. Optionally set "Require two-factor authentication and disallow tokens".
   - From then on: bump version, changelog, `git tag v<version>`, push the tag (see the
     `editor-release` skill).

## Where things are

- Contracts and rules: `CLAUDE.md` (local), `.claude/skills/editor-feature/SKILL.md`,
  `.claude/skills/editor-screenshots/SKILL.md` (how each `docs/images/*` frame is made).
- Architecture and security model: `docs/ARCHITECTURE.md`.
- Every public symbol: `docs/api.md`; theme variables: `docs/theming.md`; locale keys:
  `docs/localization.md`; licences: `docs/LICENSES.md`.
- Competitor gap and parity plan: `docs/COMPETITORS.md`, `docs/ROADMAP.md` section P.
- Business-rule notes (Turkish, project-brain format): `docs/knowledge/_index.md` — local only
  (`.git/info/exclude`), not in the public repo.
