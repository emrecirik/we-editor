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
| orderedmap (transitive) | 2.1.1 | MIT | |
| rope-sequence (transitive) | 1.3.4 | MIT | |
| w3c-keyname (transitive) | 2.2.8 | MIT | |
| tslib | ^2.3.0 | 0BSD | TypeScript helpers |

Rules: only MIT/BSD/ISC/Apache-2.0-class licences ship. CKEditor (GPL/commercial) and TipTap "Pro"
extensions are never added. A new dependency gets a row here in the same change.

Candidates for later phases (not installed):
`prosemirror-dropcursor`, `prosemirror-gapcursor` (MIT). The HTML code
view (F3) needs a code editor — CodeMirror 6 is MIT; decide in a `decisions/` note before adding.
