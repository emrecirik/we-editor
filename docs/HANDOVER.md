# Handover — read this first

Last updated: 2026-11-13 (end of session 3). Owner: Emre CIRIK (`emrecirik`).

## Current state

- **`we-editor-angular` 0.4.0 is on npm** (`latest`). Releases are tag-driven and automatic: push a
  `v*` tag → `.github/workflows/release.yml` builds, tests, publishes through **npm Trusted Publishing
  (OIDC) with provenance** and creates the GitHub release from `CHANGELOG.md`. Proven on 0.2.0, 0.3.0,
  0.4.0. (0.1.0 was published by hand; npm's staged publishing left a harmless `0.0.0-stage` version in
  the list. A fresh tag can take a few minutes to show up as `latest` — registry lag, do not re-publish.)
- Angular 18.2 workspace (mirrors `C:\Projects\we-grid`): library `projects/we-editor`,
  `projects/playground` (feature sandbox), `projects/studio` (the live demo, like we-grid / we-report
  Studio: EN/TR, light/dark, Editor / Safe HTML / Get started tabs, status bar + autosave to
  localStorage), CI / compat / release / pages workflows, `.claude/` agent + rule + skills (local only).
- **Live:** https://emrecirik.github.io/we-editor/ → Studio at `/studio/`; landing page with feature
  cards and comparison at `/features.html`; `/demo/` redirects to the Studio. Rebuilt on every push.
- Public repo `github.com/emrecirik/we-editor` (HTTPS remote; `gh auth setup-git` is the credential
  helper — no SSH key on this machine). Description, homepage and topics are set.
- Core decision: ProseMirror used directly (`docs/decisions/0001`). Code highlighting: lowlight +
  highlight.js (`0002`). HTML source view: CodeMirror 6, dynamic `import()` (`0003`).
- UI languages shipped: EN, TR, DE, FR, ES (`weEditorLocale*`). Author name is always **`Emre CIRIK`**.
- **Vision (Emre, session 3):** better than every paid editor, **free (MIT) for the community**;
  we-editor is one of a growing family — we-grid, we-report, and soon **we-charts** (dashboards, KPI
  tools). Keep the family look (Studio pages, EN/TR, light/dark). Gap matrix with sources:
  `docs/COMPETITORS.md`; ordered work list: section **P** of `docs/ROADMAP.md`.

### Done in session 3 (2026-11-12 / 13) — each item one commit, pushed, CI green

| Item | What | Commit |
|---|---|---|
| Name | `Emre Çırık` → `Emre CIRIK` everywhere | `5b5ecf3` |
| Studio | `projects/studio` live demo; CI builds it; Pages serves it at `/studio/` | `8af368e` |
| Locales | `weEditorLocaleDe` / `Fr` / `Es` | `b5d12d9` |
| P4 | Colour palette bar (swatches, custom, remove, recent) + special characters / emoji picker | `41008d9` |
| 0.1.0 | First npm release (by hand), GitHub release `v0.1.0` | `d934fab` |
| P5 | Code block language picker + highlighting, 23 languages (lowlight / highlight.js) | `c0190e5` |
| P6 | HTML source view: CodeMirror 6 lazy-loaded, Code + Split (two-way sync), Format | `dbd5438` |
| 0.2.0 | First tag-driven release via OIDC | `3e82dbe` |
| P7 | Line height, language-aware change case, format painter | `a5a62e8` |
| P8 | Full screen, status bar (clickable element path, counts, save state), autosave hook | `ebc1fb9` |
| P9 | Paste from Word / Outlook / Google Docs: nested lists, style noise removed | `cc6aa68` |
| 0.3.0 | Release of P7–P9 | `da4538f` |
| P10 | Image captions (`figure`) and image links; table caption, cell background, vertical alignment | `534ab4b`, `2647b3b` |
| 0.4.0 | Release of P10 | `108c465` |

Session 2 (F0.12, images, tables, landing page, P1 find & replace, P2 autolink, P3 video embeds) is in
`git log` and `CHANGELOG.md`.

### Verified at the end of session 3

| Check | Result |
|---|---|
| `npm test` | **108 / 108 SUCCESS** (ChromeHeadless) |
| `npm run build:lib`, `npx ng build playground`, `npx ng build studio` | OK |
| GitHub: CI, Angular compatibility (19–22 matrix), Pages, Release | all green on `108c465` / `v0.4.0` |
| npm | `latest` = 0.4.0; clean-folder install checked on 0.1.0 (theme, LICENSE, README, ProseMirror deps present) |
| Studio in a real browser (Playwright) | palette, special chars, code highlighting (light/dark), source Code/Split, TR change case + line height, status bar / full screen / autosave, image caption + link, table caption / cell colour / valign — no console errors |
| `editor-contract-reviewer` | run on every feature; findings fixed (autosave status race, api.md table, figure link scope) |

### Not verified / not done

- Format painter and Word / Google Docs paste: covered by specs only (no real clipboard from Word).
- No screen-reader check; toolbar has no roving tabindex (F0.13 / P16).
- Zoneless consumer app not checked by hand (`.claude/rules/angular-compat.md`).
- `docs/images/*` screenshots and `docs/features.html` comparison table predate P4–P10 (refresh with
  the `editor-screenshots` skill).
- `SampleUsageProjects/*` are still empty placeholders.
- TipTap / Lexical cells in `docs/COMPETITORS.md` partly from package knowledge — re-check before quoting.

## Next tasks (in order)

1. **P11** — mentions (`@`) + slash commands (`/`), one suggestion plugin (keyboard navigable,
   consumer-supplied items for mentions, locale strings, safe output e.g. `<span data-mention>`).
2. **P12…P18** in `docs/ROADMAP.md` order: Markdown in/out (`prosemirror-markdown`, MIT), bubble toolbar /
   drag handle / show blocks / shortcut help, page break / details / footnotes / TOC / anchors, math
   (KaTeX, MIT), keyboard + screen-reader pass (F0.13), RTL + more locales, DOCX / PDF.
3. Leftovers: P7 "styles" (consumer-defined class allowlist), F3.3 device-width preview (sandboxed
   iframe), screenshots / features page refresh.
4. Then the F2 / F3 differentiators (formula tables via `<we-sheet>`, e-mail mode, mail merge) —
   write their decision notes first (open decision 3).
5. Cut a minor release (`editor-release` skill) after each batch of green features.

## How to work (agreed with Emre)

- **Session 3: "don't ask me, follow your recommendation"** — work through ROADMAP P in order, pick
  dependencies with a decision note (`docs/decisions/000N-*.md`), and cut minor releases with a `v*` tag
  when a batch is green. Still ask for: destructive git operations, licence / naming / ownership changes.
- Per feature (`editor-feature` skill): code in `core/` + component, specs (incl. an attack input for
  anything security-relevant), check in the Studio in a real browser, docs (`api.md`, `localization.md`,
  `theming.md`, `ARCHITECTURE.md` safety rules), CHANGELOG `[Unreleased]`, ROADMAP / COMPETITORS /
  `features.html` / Studio tips, `editor-contract-reviewer` agent → **commit + push without asking**, check
  `gh run list`.
- Permissive (MIT/BSD/ISC/Apache) packages may be added without asking: verify the licence in
  `node_modules`, add to `docs/LICENSES.md`, both `package.json` files and `ng-package.json`
  `allowedNonPeerDependencies`. Heavy, optional ones are loaded with dynamic `import()` (see 0003).
- New locale keys go into **all five** locales (En, Tr in `we-editor-locale.model.ts`; De, Fr, Es in
  `we-editor-locale-extra.model.ts`); each addition is noted in the changelog as breaking for
  hand-written full locale objects.
- DOM baseline (`testing/we-editor-dom-baseline.ts`) changes with every new default toolbar item;
  re-record from the failing spec's "actual" value and say so in the changelog.
- Don't trust a reviewer's "no regression" without a spec — session 3 caught one only by testing.

## Commands

```bash
nvm use 24.19.0             # same Node as the other projects on this machine
npm install
npm run build:lib           # must precede any playground / studio build or serve
npm test
npm start                   # playground on http://localhost:4200
npx ng serve studio --port 4300
npx ng build playground && npx ng build studio
gh run list --limit 5       # CI / compat / Pages / Release after a push
node .github/scripts/changelog-section.mjs <version>   # preview release notes
bash .github/compat/probe.sh 22 <scratch-dir> "$PWD/.github/compat/probe.ts" "$PWD/.github/compat/probe.html" <tarball>
```

Release: bump `projects/we-editor/package.json`, move `[Unreleased]` notes under `## <version> — <date>`,
update the status line in the three READMEs, commit, `git tag -a v<version> -m "we-editor-angular <version>"`,
push the tag, watch the Release run, check `npm view we-editor-angular dist-tags` after a few minutes.

## Open decisions (ask Emre)

1. **Normalize the form value on `writeValue`?** The control keeps the raw HTML it was given until the
   first edit. Option: emit the sanitized value once without marking dirty.
2. **Colour output format.** Inline styles come out as CSSOM text (`rgb(255, 0, 0);`). Keep, or write
   our own style serializer to preserve `#hex` (likely needed for e-mail mode, F3.8)?
3. **`<we-sheet>` reuse (F2)**: optional peer dependency on `we-grid-angular` vs. own engine (we-grid's
   formula engine is not exported standalone today — would need a we-grid change).
4. **Images without an `imageUpload` hook** are embedded as base64 `data:` URLs. Keep, or require the
   hook / add an opt-in flag?
5. **Status bar default:** `statusBar` is `false` so existing consumers see no change; turn it on by
   default at 1.0?

## Known risks

- **Dev server + `build:lib`:** rebuilding the library while a dev server runs wipes `dist/we-editor`
  and the server breaks; stop it, rebuild, restart. Stale servers can keep port 4300/4200 busy
  (`netstat -ano | grep :4300` → `taskkill //PID <pid> //F //T`).
- **Change case** follows the closest `lang` attribute, else the browser language — a page without
  `lang` on a Turkish machine upper-cases English "i" to "İ". Studio sets `<html lang>`.
- **Highlight vs cell background:** the highlight mark's `background-color` style rule has a `context`
  list that excludes table rows (so `<td style="background-color">` stays a cell attribute). A new
  block container node must be added to that list or highlighted spans directly inside it get lost.
- **CodeMirror** (6 `@codemirror/*` / `@lezer/*` packages) is a runtime dependency but loaded only via
  dynamic `import()`; bundlers without code splitting would inline it.
- **Embeds:** the YouTube iframe needs `allow-same-origin`; consumers need `frame-src` for
  youtube-nocookie.com / player.vimeo.com in their CSP.
- **Tables:** no border styles in the output (consumer CSS decides); column widths only as
  `data-colwidth`. Table caption is plain text only.
- **Serialization on every keystroke** (`apply()` → `getHtml()`), plus re-highlighting all code blocks and
  re-formatting the source view on change — all marked `shortcut:`. Debounce if large documents get slow.
- `ViewEncapsulation.None`: editor CSS is global under `.we-editor`; consumer CSS can leak in.
- Task list output contains `<label contenteditable="false"><input type="checkbox">` (TipTap-compatible).
- Windows: Karma's ChromeHeadless sometimes reports "not killed in 2000 ms" at exit; harmless.
- Writing code through Node scripts in Bash heredocs can eat backslashes (`\s` → `s`); use the Edit /
  Write tools for code containing regexes.

## Where things are

- Contracts and rules: `CLAUDE.md` (local), `.claude/skills/editor-feature/SKILL.md`,
  `.claude/skills/editor-release/SKILL.md`, `.claude/skills/editor-screenshots/SKILL.md`.
- Architecture and security model: `docs/ARCHITECTURE.md`; decisions: `docs/decisions/`.
- Every public symbol: `docs/api.md`; theme variables: `docs/theming.md`; locale keys:
  `docs/localization.md`; licences: `docs/LICENSES.md`.
- Competitor gap and parity plan: `docs/COMPETITORS.md`, `docs/ROADMAP.md` section P.
- Business-rule notes (Turkish, project-brain format): `docs/knowledge/_index.md` — local only
  (`.git/info/exclude`), not in the public repo.
