# 0001 — Editor core: ProseMirror, used directly

- **Status:** accepted (2026-11-11)
- **Deciders:** Emre Çırık

## Context

`we-editor-angular` needs a document model and an editing engine that can grow from a rich-text
field (F0) to Word-level documents (F1), spreadsheet tables (F2), a design/code/split HTML editor
(F3) and mail-merge templates (F4). Hard constraints: MIT-compatible licence for everything that
ships, Angular 18–22 from one build, no CSS framework or icon font, every HTML input and output
passes an allowlist.

CKEditor 5 is excluded (GPL-2.0-or-later or a commercial licence) and none of its code is copied.

## Options

| | ProseMirror directly | TipTap core (`@tiptap/core` + `@tiptap/pm`) |
|---|---|---|
| Licence | MIT (all `prosemirror-*` packages and their deps `orderedmap`, `rope-sequence`, `w3c-keyname`) | MIT for core and the open extensions; several "Pro"/cloud extensions are commercial, so every extension must be checked one by one |
| What ships | Only the modules we import (8 in F0) | `@tiptap/pm` 3.33.1 depends on 13 ProseMirror packages (tables, inputrules, gapcursor, dropcursor, changeset …) whether used or not, plus the TipTap layer (`@tiptap/core` unpacked 3.3 MB on npm vs 0.9 MB for `prosemirror-view`) |
| Angular integration | Neither has an official Angular binding. We write the `EditorView` host, `ControlValueAccessor` and toolbar either way | Same; TipTap's React/Vue bindings do not help |
| Extension system | Plugins, node views, schema specs, commands — the primitives TipTap itself is built on | Nicer authoring API (`Extension.create`, chained commands), but one more abstraction to learn and to follow across TipTap major versions (v2 → v3 already broke APIs) |
| Tables | `prosemirror-tables` (MIT, maintained by the ProseMirror org): merge/split, column resize, cell selection | `@tiptap/extension-table` wraps the same `prosemirror-tables` |
| Schema control | We own the schema, which *is* the HTML allowlist (security requirement) | Schema is assembled from extensions; achievable but indirect |
| Docs / longevity | Reference manual + forum by the author, stable 1.x APIs for years | Good docs, VC-backed company, faster churn |

## Decision

Use **ProseMirror directly**. The package owns its schema (the sanitizer), its commands and its
plugins; only the `prosemirror-*` modules a phase needs are added as `dependencies` of the library.

Reasons, in order: (1) the schema-as-allowlist security model is first-class instead of mediated by
an extension layer; (2) smallest dependency and licence surface — no risk of a commercial extension
creeping in; (3) TipTap's main benefit (Angular-agnostic extension ergonomics) does not offset the
extra layer for a library that must design its own Angular API anyway; (4) tables (F1/F2) come from
`prosemirror-tables` in both options.

## Consequences

- We write more glue (toolbar state, list toggling, link range) ourselves — see
  `projects/we-editor/src/lib/core/we-editor-commands.ts`. The upside is that each command is
  unit-tested against our own schema.
- Inline `style` values are re-serialized by the browser's CSSOM (ProseMirror writes `style` through
  `cssText`): output reads `color: rgb(255, 0, 0);` even when input said `#ff0000`. The specs pin
  this; e-mail-safe output (F3) may need its own serializer.
- If TipTap is reconsidered later, the migration path is cheap at the model level: TipTap documents
  are ProseMirror documents.
