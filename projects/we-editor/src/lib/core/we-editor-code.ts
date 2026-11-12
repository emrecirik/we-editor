import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import diff from 'highlight.js/lib/languages/diff';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import kotlin from 'highlight.js/lib/languages/kotlin';
import markdown from 'highlight.js/lib/languages/markdown';
import php from 'highlight.js/lib/languages/php';
import python from 'highlight.js/lib/languages/python';
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
import scss from 'highlight.js/lib/languages/scss';
import sql from 'highlight.js/lib/languages/sql';
import swift from 'highlight.js/lib/languages/swift';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import { createLowlight } from 'lowlight';
import { Node as PmNode } from 'prosemirror-model';
import { Command, EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

import { WeEditorOption } from '../models/we-editor-toolbar.model';
import { weEditorSafeCodeLanguage, weEditorSchema } from './we-editor-schema';

const s = weEditorSchema;

/** Grammars the highlighter knows, keyed by the language id written as `class="language-<id>"`. */
const lowlight = createLowlight({
  bash, c, cpp, csharp, css, diff, go, html: xml, java, javascript, json, kotlin, markdown, php,
  python, ruby, rust, scss, sql, swift, typescript, xml, yaml
});

/** Entries of the code language picker. A language without a bundled grammar is kept, just not coloured. */
export const WE_EDITOR_DEFAULT_CODE_LANGUAGES: readonly WeEditorOption[] = [
  ['bash', 'Bash'], ['c', 'C'], ['cpp', 'C++'], ['csharp', 'C#'], ['css', 'CSS'], ['diff', 'Diff'],
  ['go', 'Go'], ['html', 'HTML'], ['java', 'Java'], ['javascript', 'JavaScript'], ['json', 'JSON'],
  ['kotlin', 'Kotlin'], ['markdown', 'Markdown'], ['php', 'PHP'], ['python', 'Python'], ['ruby', 'Ruby'],
  ['rust', 'Rust'], ['scss', 'SCSS'], ['sql', 'SQL'], ['swift', 'Swift'], ['typescript', 'TypeScript'],
  ['xml', 'XML'], ['yaml', 'YAML']
].map(([value, label]) => ({ value, label }));

/** The language of the code block holding the selection: `null` = plain text, `undefined` = not in a code block. */
export function weEditorCodeLanguageAt(state: EditorState): string | null | undefined {
  const parent = state.selection.$from.parent;
  return parent.type === s.nodes['code_block'] ? (parent.attrs['language'] as string | null) : undefined;
}

/** Sets (or with `null` clears) the language of the code block holding the selection. */
export function weEditorSetCodeLanguage(language: string | null): Command {
  return (state, dispatch) => {
    const safe = language ? weEditorSafeCodeLanguage(language) : null;
    if (language && !safe) return false;
    const { $from } = state.selection;
    if ($from.parent.type !== s.nodes['code_block']) return false;
    dispatch?.(state.tr.setNodeAttribute($from.before(), 'language', safe));
    return true;
  };
}

interface HastNode {
  type: string;
  value?: string;
  properties?: { className?: string[] };
  children?: HastNode[];
}

/** Inline decorations for the highlighted tokens of one code block starting at `start` (its content position). */
function tokenDecorations(nodes: HastNode[], start: number, out: Decoration[]): number {
  let pos = start;
  for (const node of nodes) {
    if (node.type === 'text') {
      pos += node.value!.length;
      continue;
    }
    const from = pos;
    pos = tokenDecorations(node.children ?? [], pos, out);
    const cls = node.properties?.className?.join(' ');
    if (cls && pos > from) out.push(Decoration.inline(from, pos, { class: cls }));
  }
  return pos;
}

function highlight(doc: PmNode): DecorationSet {
  const out: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (node.type !== s.nodes['code_block']) return true;
    const language = node.attrs['language'] as string | null;
    if (language && lowlight.registered(language)) {
      tokenDecorations(lowlight.highlight(language, node.textContent).children as HastNode[], pos + 1, out);
    }
    return false;
  });
  return DecorationSet.create(doc, out);
}

const codeHighlightKey = new PluginKey<DecorationSet>('weEditorCodeHighlight');

/** Colours code blocks that have a language, with `hljs-*` classes styled by the theme. */
export function weEditorCodeHighlight(): Plugin<DecorationSet> {
  return new Plugin<DecorationSet>({
    key: codeHighlightKey,
    state: {
      init: (_, state) => highlight(state.doc),
      // shortcut: re-highlights every code block on each document change; track changed ranges if long code documents get slow.
      apply: (tr, old) => (tr.docChanged ? highlight(tr.doc) : old)
    },
    props: {
      decorations: (state) => codeHighlightKey.getState(state)
    }
  });
}
