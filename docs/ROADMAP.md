# Roadmap

Vision (Emre): *"Every CKEditor feature and more — the user can do anything: like Word, like Excel,
even like Dreamweaver; write HTML source and preview it."*

Each item has an acceptance criterion (AC). An item is done when its AC holds and it has specs, a
playground demo, docs (`api.md` / `theming.md` / `localization.md`) and a CHANGELOG line.
Status: ✅ done · 🟡 partial · ⬜ not started.

## F0 — Skeleton and core (target 0.1.0)

| # | Item | AC | Status |
|---|---|---|---|
| F0.1 | Workspace, CI, release, compat, docs | `build:lib`, `test`, playground build green; compat matrix 19–22 defined | ✅ (workflows never run on GitHub yet) |
| F0.2 | `<we-editor>` + `ControlValueAccessor` | Works with `formControl`, `formControlName`, `ngModel`; disabled/touched/required behave like a native input | ✅ |
| F0.3 | Inline marks: bold, italic, underline, strike, sub/superscript, inline code | Toolbar + shortcut toggle; `aria-pressed` reflects state; HTML round-trip | ✅ |
| F0.4 | Font family / size / text colour / highlight | Pickers set and clear; invalid CSS values refused | 🟡 colour = native picker; no palette, no "remove colour" button (clear formatting removes it) |
| F0.5 | Blocks: paragraph, H1–H6, quote, code block, horizontal rule | Select + buttons; round-trip | ✅ |
| F0.6 | Alignment, indent/outdent | `text-align` / `margin-left` in 40px steps, max 8 | ✅ |
| F0.7 | Lists: bulleted, numbered, task | Toggle, convert, nest (Tab/Shift-Tab), task checkbox toggles | ✅ |
| F0.8 | Link | Insert/edit/remove; unsafe schemes refused with a message; new tab → `rel="noopener noreferrer"` | ✅ |
| F0.9 | Undo/redo | Buttons enable/disable with history; Ctrl+Z / Ctrl+Y | ✅ |
| F0.10 | HTML in/out + sanitizer | `weEditorSanitizeHtml` drops script, handlers, unsafe URLs and styles (spec'd) | ✅ |
| F0.11 | Theme (light/dark), tr/en, SVG icons | Three-block theme; every string a locale key | ✅ |
| F0.12 | Placeholder, word/character count, Markdown-style input rules (`# `, `- `, `1. `, `> `) | Placeholder on empty doc; rules convert while typing | ✅ (count is an output; status bar is F1.9) |
| F0.13 | Keyboard / a11y pass | Toolbar roving tabindex, `Mod-k` opens link bar, real screen-reader check | ⬜ |
| F0.14 | Paste cleanup basics | Google Docs / web paste maps headings and lists; plain-text paste option | 🟡 schema already drops foreign markup |

## F1 — Word level

| # | Item | AC |
|---|---|---|
| F1.1 | Tables (`prosemirror-tables`, MIT) ✅ | Insert N×M, add/remove row/column, merge/split, header row, column resize by drag, Tab navigation; `<table>` round-trip with `colspan`/`rowspan`/`colwidth` |
| F1.2 | Images ✅ | `imageUpload` hook returning a URL (base64 `data:` URL when no hook is set), resize handles, align left/centre/right/inline, alt text; `src` allowlist (http/https/relative, raster `data:image` allowed, SVG never) |
| F1.3 | Page layout | Page size (A4/Letter), margins, "page view" with visible page boundaries |
| F1.4 | Page break | Page-break node, visible in the editor, honoured when printing |
| F1.5 | Print / PDF export | Print stylesheet; `print()` through the browser; optional we-report hook — no paid library |
| F1.6 ✅ | Paste from Word | MSO list paragraphs become real lists, `mso-*` styles stripped, tables kept |
| F1.7 | Find / replace ✅ | Ctrl+F panel, match case / whole word, highlight decorations, replace all |
| F1.8 | Spell-check hook | Native `spellcheck` on by default; `WeEditorSpellChecker` interface for a server checker with decorations |
| F1.9 ✅ | Word / character counter | Status bar + `(stats)` output |
| F1.10 ✅ | Full screen | Toggle; Esc exits; focus kept |
| F1.11 ✅ | Format painter | Copy marks + block attrs; single use, sticky on double click |
| F1.12 | Styles | Consumer-defined paragraph/character styles (class-based, allowlisted class names) |
| F1.13 ✅ | Special characters, line height, letter case | Pickers with locale strings |

## F2 — Excel level

| # | Item | AC |
|---|---|---|
| F2.1 | Sheet-mode table | A table can switch to "sheet" mode: A1 headers shown, cells hold value + formula |
| F2.2 | Formulas | `=SUM(A1:A3)` etc. recalculated on change; reuse we-grid's formula engine if it is exported, otherwise a small engine — never `eval` |
| F2.3 | Cell formats | Number / currency / percent / date, tr/en aware |
| F2.4 | Sort / filter | Per column; formulas stay consistent |
| F2.5 | `<we-sheet>` integration design | `docs/decisions/000x-sheet-integration.md`: embed `we-grid-angular`'s `<we-sheet>` as a node view (optional peer) vs. own engine — decide before coding |

## F3 — Dreamweaver level

| # | Item | AC |
|---|---|---|
| F3.1 ✅ | Design / Code / Split views | Toggle; code view edits HTML; switching back re-parses through the schema; split view syncs both ways (debounced) |
| F3.2 ✅ | Code editor | Syntax highlighting + pretty-print for HTML; dependency decision (e.g. CodeMirror 6, MIT) recorded first |
| F3.3 | Live preview | `sandbox` iframe without scripts; device widths (mobile / tablet / desktop) |
| F3.4 | Element inspector | Panel for the selected node's attributes/styles; edits limited to the allowlist |
| F3.5 ✅ | DOM path bar | Breadcrumb `table > tr > td > p`; click selects that ancestor |
| F3.6 | Template / component blocks | Insert consumer-defined blocks (hero, two columns, button, card) |
| F3.7 | Drag-and-drop blocks | Move blocks with a handle; drop cursor |
| F3.8 | E-mail safe mode | Output with inlined CSS and table layout, no unsupported tags; checklist against common clients |

## F4 — Integration

| # | Item | AC |
|---|---|---|
| F4.1 | Variables / placeholders (mail merge) | Atom chip node, inserted from a data-source tree or by drag; serialized as a configurable token (e.g. `{{customer.name}}`); `render(data)` helper |
| F4.2 | Sanitizer hardening | Spec corpus from the OWASP XSS filter-evasion vectors; sanitizer contract documented for a server-side mirror |
| F4.3 | Collaboration hooks (later) | Expose steps / `prosemirror-collab` hooks; no backend shipped |
| F4.4 | we-report document templates | Template authored in we-editor rendered by we-report; contract note in `docs/` |
| F4.5 | Comments / track changes (later) | Design note only |

## P — Competitor parity (before the first npm release)

Gap list from [COMPETITORS.md](COMPETITORS.md), most common across CKEditor 5 / TinyMCE / TipTap /
Froala / Quill / Lexical first. Everything here ships free in the MIT package.

| # | Item | Notes |
|---|---|---|
| P1 ✅ | Find & replace | `prosemirror-search` (MIT) or own decorations; Ctrl+F panel, match case / whole word (= F1.7) |
| P2 ✅ | Autolink | URLs become links while typing and on paste; same `weEditorSafeUrl` check |
| P3 ✅ | Media embed | YouTube / Vimeo iframe node, provider allowlist on the parsed `src` |
| P4 ✅ | Colour palette + special characters + emoji | Palette popover with "remove colour" (F0.4), character picker |
| P5 ✅ | Code block language + syntax highlighting | decorations; highlighter licence check first |
| P6 ✅ | Source HTML view + preview | F3.1–F3.3; code-editor dependency decision first |
| P7 🟡 | Line height, case change, format painter, styles | small marks/commands (F1.11–F1.13) |
| P8 ✅ | Full screen, autosave hook, status bar with counts | F1.9, F1.10 |
| P9 ✅ | Paste from Word / Google Docs | F1.6 |
| P10 ✅ | Image caption, link on image; table caption and cell properties | |
| P11 | Mentions + slash commands | one suggestion plugin |
| P12 | Markdown in/out | `prosemirror-markdown` (MIT) |
| P13 | Bubble toolbar, drag handle, show blocks, shortcut help | |
| P14 | Page break, details/accordion, footnotes, TOC, anchors | |
| P15 | Math (LaTeX) | KaTeX (MIT) |
| P16 | Keyboard / screen-reader pass | F0.13 |
| P17 | RTL + more shipped locales | |
| P18 | DOCX import/export, print-to-PDF | client-side; licences checked first |

Server-backed features (real-time collaboration, AI) get adapter interfaces, never a bundled
service.
