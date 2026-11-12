# Competitor feature matrix

Goal (Emre, 2026-11-12): **no end-user feature the leading editors have that we-editor lacks, and
features they do not have** — then publish free (MIT) on npm. This page tracks that gap; the work
order lives in [ROADMAP.md](ROADMAP.md) (section P).

Researched 2026-11-12 from the vendors' own pages: [CKEditor 5 features](https://ckeditor.com/docs/ckeditor5/latest/features/index.html),
[CKEditor pricing](https://ckeditor.com/pricing/), [TinyMCE plugins](https://www.tiny.cloud/docs/tinymce/latest/plugins/),
[Froala features](https://froala.com/wysiwyg-editor/features/), [Quill formats](https://quilljs.com/docs/formats),
[Lexical](https://lexical.dev/docs/intro), [TipTap pricing](https://tiptap.dev/pricing),
[TipTap feature comparison](https://tiptap.dev/feature-comparison). Some TipTap/Lexical cells are from
package knowledge, not a fetched page — re-check before quoting them publicly.

**CK** CKEditor 5 · **Ty** TinyMCE · **TT** TipTap · **Fr** Froala (commercial as a whole) · **Q** Quill ·
**Lx** Lexical · **P** = premium / paid. Status: ✅ have · 🟡 partial · ⬜ missing.

## Matrix

| Feature | Competitors | we-editor |
|---|---|---|
| **Text formatting** | | |
| Bold/italic/underline/strike, sub/sup, inline code | all | ✅ |
| Font family/size, text colour, highlight | CK, Ty, TT, Fr, Q | ✅ palette, custom colour, remove, recent colours (P4) |
| Line height | CK-P, Ty, TT, Fr | ✅ (P7) |
| Format painter | CK-P, Ty-P | ✅ free (P7) |
| Case change | CK-P, Ty-P | ✅ free, language-aware (P7) |
| Styles / CSS classes | CK, Ty, Fr | ⬜ |
| Typography (smart quotes, dashes) | CK, Ty-P, TT | ⬜ |
| Special characters, emoji | CK, Ty, TT, Fr, Lx | ✅ configurable symbol + emoji picker (P4) |
| Text direction (RTL), language of parts | CK, Ty, Q | ⬜ |
| **Blocks & lists** | | |
| Paragraph, H1–H6, quote, rule, alignment, indent | all | ✅ |
| Bulleted / numbered / task lists, nesting | all (task: CK, Ty-P, TT, Lx) | ✅ |
| Markdown-style input rules | CK, TT, Lx | ✅ |
| Code block language + syntax highlighting | CK, Ty, TT, Fr, Q, Lx | ✅ 23 languages, lowlight (P5) |
| List styles (roman, start, reversed) | CK, Ty | 🟡 start number only |
| Multi-level legal numbering (1.1.1) | CK-P | ⬜ |
| Collapsible details / accordion | Ty, TT | ⬜ |
| Page break | CK, Ty, Fr | ⬜ |
| Drag handle / reorder blocks | TT, Fr, Lx | ⬜ |
| Footnotes | CK-P, Ty-P | ⬜ |
| Math (LaTeX) | CK-P, Ty-P, TT, Q, Fr | ⬜ |
| **Links & media** | | |
| Links, new tab, unsafe schemes refused | all | ✅ |
| Autolink while typing / pasting | CK, Ty, TT, Lx | ✅ |
| Anchors / bookmarks | CK, Ty, Fr | ⬜ |
| Images: URL, upload, paste, drop, resize, position, alt | all | ✅ |
| Image caption, link on image | CK, Ty | ⬜ |
| Image editing (crop/rotate) | Ty-P, Fr | ⬜ |
| Video / media embed | CK, Ty, TT, Fr, Q | ✅ YouTube, Vimeo |
| File attachments | CK-P, Ty-P, Fr | ⬜ |
| Mentions | CK, Ty-P, TT, Fr, Lx | ⬜ |
| **Tables** | | |
| Insert, rows/columns, merge/split, header row/column, column resize, Tab | CK, Ty, TT, Fr, Lx | ✅ |
| Cell / table properties (background, border, padding, v-align) | CK, Ty, Fr | ⬜ |
| Table caption | CK, Ty | ⬜ |
| Sort, column types | Ty-P | ⬜ (planned F2 — formulas too) |
| **Productivity** | | |
| Word / character count | CK, Ty, TT, Fr, Lx | 🟡 output only, no status bar |
| Placeholder | CK, Ty, TT, Fr, Q, Lx | ✅ |
| Find & replace | CK, Ty, Fr | ✅ |
| Autosave hook | CK, Ty, Fr | ⬜ |
| Full screen | CK, Ty, Fr | ⬜ |
| Slash commands / quick insert | CK-P, Fr, TT, Lx | ⬜ |
| Templates / snippets | CK-P, Ty-P | ⬜ |
| Merge tags (mail merge) | CK-P, Ty-P | ⬜ (planned F4.1) |
| Table of contents | CK-P, Ty-P, TT | ⬜ |
| Spell / grammar checker | CK-P, Ty-P, Fr | 🟡 browser spellcheck only |
| Show blocks / invisible characters | CK, Ty, TT | ⬜ |
| Bubble / floating toolbar | CK, Ty, TT, Fr | ⬜ |
| Keyboard shortcut help | CK, Ty, Fr | ⬜ |
| **Paste & import / export** | | |
| Paste from Word / Google Docs cleanup | CK (P enhanced), Ty-P, Fr | 🟡 allowlist only |
| Markdown in / out | CK, Ty-P, TT, Fr, Lx | 🟡 input rules only |
| Import Word (DOCX) | CK-P, Ty-P, TT-P, Fr | ⬜ |
| Export Word / PDF | CK-P, Ty-P, TT-P, Fr | ⬜ |
| Page layout / pagination | CK-P, TT-P | ⬜ |
| **Source / HTML** | | |
| HTML in/out with allowlist sanitizer | all | ✅ |
| Source view with highlighting | CK, Ty, Fr | ✅ CodeMirror 6, code + split view, two-way sync, format (P6) — the others offer a textarea or code-only view |
| Preview | Ty | ⬜ (planned F3.3) |
| E-mail output (inline CSS) | Ty-P, CK-P | ⬜ (planned F3.8) |
| **Collaboration** (needs a backend) | | |
| Real-time co-editing | CK-P, Ty-P, TT-P, Fr, Lx | ⬜ |
| Comments, track changes, revision history | CK-P, Ty-P, TT-P, Fr | ⬜ |
| Restricted editing regions | CK | ⬜ |
| **AI** (needs an LLM endpoint) | | |
| Rewrite, summarize, translate, chat | CK-P, Ty-P, TT-P, Fr | ⬜ |
| **Accessibility** | | |
| Keyboard toolbar navigation, ARIA | CK, Ty | 🟡 not audited (F0.13) |
| Accessibility checker | Ty-P | ⬜ |
| **Developer** | | |
| Forms integration, readonly/disabled | all | ✅ (Angular `ControlValueAccessor`) |
| Theming, i18n | all | ✅ (EN/TR; competitors ship 40+ languages) |
| Light / dark theme via CSS variables | CK, TT | ✅ |

## Where we-editor goes further

Free, client-side, and in one MIT package — most of these are paid or absent elsewhere:

1. **Formula tables** — `=SUM(A1:A3)`, cell references, number/currency formats, sort/filter (F2).
2. **Design / Code / Split view** with a sandboxed live preview (F3).
3. **E-mail-safe mode** with inlined CSS and a client compatibility check (F3.8).
4. **Mail-merge variables** with fallbacks and a sample-data preview (F4.1).
5. **Track changes and comments without a vendor backend** — state in the document, storage via an
   adapter.
6. **DOCX import/export and print-to-PDF** in the browser.
7. **Accessibility checker** with one-click fixes.
8. **Bring-your-own AI** — provider-agnostic hook, diff review before applying.
9. **Security as a feature** — the schema is the allowlist; no `innerHTML` of document content.
10. **Angular-native and complete for free** — standalone component and forms, Angular 18–22. CKEditor
    and TinyMCE have official Angular wrappers too, but their table/image/productivity extras sit in
    paid plans.
