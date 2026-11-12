# Handover — read this first

Last updated: 2026-11-11 (session 2: F0.12). Owner: Emre Çırık (`emrecirik`).

## Current state

- Workspace mirrors `C:\Projects\we-grid`: Angular 18.2 workspace, library `projects/we-editor`
  (npm name `we-editor-angular`, version `0.1.0`, unreleased), `projects/playground`, CI / release /
  compat workflows, `.claude/` agent + rule + skills (local only, gitignored like we-grid).
- Core decision: **ProseMirror used directly** — `docs/decisions/0001-editor-core.md`.
- F0 status per item: `docs/ROADMAP.md` (F0.1–F0.12 done, F0.4 and F0.14 partial, F0.13 open).
- Git: local repository, one commit on `main`. **No remote, nothing pushed, nothing published.**

### Verified in this session

| Check | Result |
|---|---|
| `npm install` | OK (Node 24.19.0 / npm 11.17.0); npm warns that `lmdb`, `msgpackr-extract`, `esbuild` install scripts were not approved (`npm approve-scripts`) — builds work regardless |
| `npm run build:lib` | OK, FESM bundle 71 kB (unminified) |
| `npm test` | **45 / 45 SUCCESS** (ChromeHeadless, session 2). Karma sometimes needs a while to kill Chrome on Windows at exit |
| `npx ng build playground` | OK, initial 454 kB raw / 126 kB transfer (Angular + ProseMirror + forms) |
| Playground in a real browser (Playwright) | Renders all F0 features, light and dark theme, no console errors |
| Compat probe Angular 22 (local run of `.github/compat/probe.sh`) | **PROBE OK: Angular 22** — packed tarball (25 files; README was added to the package afterwards → 26) installed into a fresh `ng new` v22 app and built (520 kB initial; budget warning only) |

### Not verified / not done

- GitHub workflows have never run (no remote). Compat for 19/20/21 not run (22 passed locally).
- Zoneless consumer app not checked by hand (rule in `.claude/rules/angular-compat.md`).
- No screen-reader check; toolbar has no roving tabindex (every button is a Tab stop).
- No screenshots, no `docs/gallery.html` / `usage.html` / GitHub Pages workflow (we-grid has them).
- `SampleUsageProjects/*` are empty placeholders.
- Playground link bar, colour pickers and font selects were exercised by specs, not by hand.

## Next tasks (in order)

1. **Push + first CI run** (after Emre creates the repo, see below): fix whatever CI/compat finds;
   run compat for 19–22.
2. **F0.13** — keyboard/a11y: toolbar roving tabindex, `Mod-k` opens the link bar, focus return,
   Escape handling; check with NVDA. Then cut **0.1.0** (`editor-release` skill).
3. **F1.1 Tables** with `prosemirror-tables` (merge/split, column resize, header row, Tab nav) —
   biggest F1 item; design the table toolbar/context menu first.
4. **F1.2 Images** — `imageUpload` hook (consumer returns URL), resize, align, alt text, `src`
   allowlist; then F1.7 find/replace.

Before F2 and F3 start, write the decision notes they call for (`<we-sheet>` integration; code
editor dependency for the HTML view).

## Commands

```bash
nvm use 24.19.0             # same Node as the other projects on this machine
npm install
npm run build:lib           # must precede any playground build/serve
npm test
npm start                   # playground on http://localhost:4200
npx ng build playground
bash .github/compat/probe.sh 22 <scratch-dir> "$PWD/.github/compat/probe.ts" "$PWD/.github/compat/probe.html" <tarball>
```

## Open decisions (ask Emre)

1. **Normalize the form value on `writeValue`?** Today the control keeps the raw HTML it was given
   until the first edit (sanitized HTML is only emitted after a change). Option: emit the sanitized
   value once without marking dirty. Matters for consumers who save untouched forms.
2. **Colour output format.** Inline styles come out as CSSOM text (`rgb(255, 0, 0);`). Keep, or write
   our own style serializer to preserve `#hex` (likely needed anyway for e-mail mode, F3.8)?
3. **Colour UI**: native `<input type="color">` (current) vs. a palette popover like we-grid's format
   palette (needs a "remove colour" entry and locale keys).
4. **`<we-sheet>` reuse (F2)**: optional peer dependency on `we-grid-angular` vs. own engine. we-grid's
   formula engine is not exported as a standalone API today — would need a we-grid change (separate
   repo, separate decision).
5. **Scope of F3 code view dependency** (CodeMirror 6, MIT, ~bundle cost) vs. a lightweight
   `<textarea>` + highlight overlay.

## Known risks

- **Playground dev server + `build:lib`:** rebuilding the library while `npm start` runs wipes
  `dist/we-editor` and the server fails with "Cannot find module 'we-editor-angular'"; restart it.
- `stats` is not emitted on `writeValue`/`setHtml` (avoids ExpressionChanged errors in consumers);
  consumers read `getStats()` for loaded content.

- **Serialization on every keystroke** (`apply()` → `getHtml()`); marked `shortcut:` in
  `we-editor.component.ts`. Debounce or lazy serialize if large documents get slow.
- `ViewEncapsulation.None`: all editor CSS is global under `.we-editor`; consumer CSS for `p`, `ul`
  etc. can leak into the content area.
- Task list HTML uses `data-type="taskList"/"taskItem"` (TipTap-compatible on purpose); other
  editors' task markup is only partially recognized.
- ProseMirror packages are `^1.x` ranges in the published package; a breaking 2.0 would need a
  bound update.
- Windows: Karma's ChromeHeadless sometimes reports "not killed in 2000 ms" at exit; harmless.

## Manual steps for Emre

1. **GitHub repo**: create public `emrecirik/we-editor` (empty, no README), then
   `git remote add origin https://github.com/emrecirik/we-editor.git` and `git push -u origin main`.
   CI runs on the push.
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
3. Optional: GitHub Pages from `/docs` once a gallery exists.

## Where things are

- Contracts and rules: `CLAUDE.md` (local), `.claude/skills/editor-feature/SKILL.md`.
- Architecture and security model: `docs/ARCHITECTURE.md`.
- Every public symbol: `docs/api.md`; theme variables: `docs/theming.md`; locale keys:
  `docs/localization.md`; licences: `docs/LICENSES.md`.
- Business-rule notes (Turkish, project-brain format): `docs/knowledge/_index.md`.
