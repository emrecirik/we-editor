# 0002 — Code block highlighting: lowlight + highlight.js, own ProseMirror plugin

- **Status:** accepted (2026-11-12)
- **Deciders:** Emre CIRIK

## Context

Roadmap item P5: code blocks get a language and syntax colours, as in CKEditor 5, TinyMCE, TipTap,
Froala, Quill and Lexical. The licence must be MIT-class, the HTML output must stay plain
(`<pre><code class="language-x">`), and colours must come from theme variables.

## Options

| | lowlight + highlight.js | Prism (refractor) | Shiki |
|---|---|---|---|
| Licence | MIT + BSD-3-Clause | MIT | MIT |
| Output | token tree (hast), no HTML strings | token tree via refractor (hast) | HTML or tokens; themes are VS Code JSON |
| Loading | synchronous, grammars imported one by one | synchronous | async (WASM regex engine or JS engine), large grammars |
| Used by | TipTap `extension-code-block-lowlight` | Lexical, Quill (Prism) | — |
| Theme | CSS classes `hljs-*` → our CSS variables | CSS classes → our CSS variables | inline colours from its own themes (fights our variables) |

`prosemirror-highlight` (MIT) would wrap any of them, but the glue is ~40 lines and one less
dependency.

## Decision

**lowlight 3.3 + highlight.js 11.11**, with our own plugin (`core/we-editor-code.ts`) that turns the
token tree into inline decorations. 22 grammars are bundled (23 ids; `html` uses the XML grammar).
The `language` attribute is validated by `weEditorSafeCodeLanguage` (identifier characters only)
before it reaches `class`. Token colours are six `--we-editor-code-*` variables.

## Consequences

- Bundle grows by the grammars (highlight.js core + 22 languages). A consumer who needs fewer or
  more languages cannot swap grammars yet — `codeLanguages` only changes the picker; a language
  without a grammar is kept but not coloured. A registration hook can come later if asked for.
- Decorations are recomputed for every code block on each change (marked `shortcut:`).
- `lowlight` pins `highlight.js` to `~11.11`; both move together.
