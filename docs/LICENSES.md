# Third-party licences

Runtime dependencies of the published package `we-editor-angular`, verified from each package's own
`package.json` in `node_modules` (2026-11-11). Peer dependencies (`@angular/*`) are the consumer's.

| Package | Version | Licence | Why |
|---|---|---|---|
| prosemirror-model | 1.25.13 | MIT | Document model, schema, DOM parse/serialize |
| prosemirror-state | 1.4.4 | MIT | Editor state, transactions, plugins |
| prosemirror-view | 1.42.9 | MIT | contenteditable view |
| prosemirror-transform | 1.12.5 | MIT | Document steps |
| prosemirror-commands | 1.7.2 | MIT | Base editing commands |
| prosemirror-history | 1.5.1 | MIT | Undo/redo |
| prosemirror-inputrules | 1.5.1 | MIT | Markdown-style input rules |
| prosemirror-tables | 1.8.5 | MIT | Tables: cell selection, merge/split, column resize |
| prosemirror-search | 1.1.1 | MIT | Find & replace: query, match highlights, replace |
| prosemirror-keymap | 1.2.3 | MIT | Keyboard shortcuts |
| prosemirror-schema-list | 1.6.0 | MIT | List commands |
| lowlight | 3.3.0 | MIT | Code block syntax highlighting (token tree from highlight.js) |
| highlight.js | 11.11.2 | BSD-3-Clause | Language grammars for code highlighting (23 ids, 22 grammars; `html` uses the XML grammar) |
| @codemirror/state | 6.7.6 | MIT | HTML source view: editor state (loaded on first use via dynamic import) |
| @codemirror/view | 6.43.15 | MIT | HTML source view: editor view, line numbers |
| @codemirror/commands | 6.11.1 | MIT | HTML source view: keymap, history |
| @codemirror/language | 6.13.1 | MIT | HTML source view: syntax highlighting |
| @codemirror/lang-html | 6.4.12 | MIT | HTML source view: HTML language, auto-close tags |
| @lezer/highlight | 1.2.5 | MIT | HTML source view: highlight tags |
| @codemirror/autocomplete (transitive) | 6.20.4 | MIT | |
| @codemirror/lang-css (transitive) | 6.3.1 | MIT | |
| @codemirror/lang-javascript (transitive) | 6.2.5 | MIT | |
| @codemirror/lint (transitive) | 6.9.7 | MIT | |
| @lezer/common (transitive) | 1.5.5 | MIT | |
| @lezer/css (transitive) | 1.3.9 | MIT | |
| @lezer/html (transitive) | 1.3.13 | MIT | |
| @lezer/javascript (transitive) | 1.5.6 | MIT | |
| @lezer/lr (transitive) | 1.4.12 | MIT | |
| style-mod (transitive) | 4.1.4 | MIT | |
| crelt (transitive) | 1.0.7 | MIT | |
| devlop (transitive) | 1.1.0 | MIT | |
| @types/hast (transitive, types only) | 3.0.5 | MIT | |
| orderedmap (transitive) | 2.1.1 | MIT | |
| rope-sequence (transitive) | 1.3.4 | MIT | |
| w3c-keyname (transitive) | 2.2.8 | MIT | |
| tslib | ^2.3.0 | 0BSD | TypeScript helpers |

Rules: only MIT/BSD/ISC/Apache-2.0-class licences ship. CKEditor (GPL/commercial) and TipTap "Pro"
extensions are never added. A new dependency gets a row here in the same change.

Candidates for later phases (not installed):
`prosemirror-dropcursor`, `prosemirror-gapcursor` (MIT). The HTML code
view (F3) needs a code editor — CodeMirror 6 is MIT; decide in a `decisions/` note before adding.
