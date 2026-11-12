import { baseKeymap, chainCommands, toggleMark } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { InputRule, inputRules, textblockTypeInputRule, undoInputRule, wrappingInputRule } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { Node as PmNode } from 'prosemirror-model';
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView, NodeView } from 'prosemirror-view';

import { weEditorInsertHardBreak } from './we-editor-commands';
import { weEditorParseHtml } from './we-editor-html';
import { weEditorSchema } from './we-editor-schema';

const s = weEditorSchema;

/** Markdown-style shortcuts typed at the start of a block: `# `…`###### `, `- `/`* `, `1. `, `> `, ```` ``` ````. */
export function weEditorInputRules(): InputRule[] {
  return [
    textblockTypeInputRule(/^(#{1,6})\s$/, s.nodes['heading'], (m) => ({ level: m[1].length })),
    wrappingInputRule(/^\s*([-*])\s$/, s.nodes['bullet_list']),
    wrappingInputRule(
      /^(\d+)\.\s$/,
      s.nodes['ordered_list'],
      (m) => ({ order: +m[1] }),
      (m, node) => node.childCount + node.attrs['order'] === +m[1]
    ),
    wrappingInputRule(/^\s*>\s$/, s.nodes['blockquote']),
    textblockTypeInputRule(/^```$/, s.nodes['code_block'])
  ];
}

/** The F0 plugin set: undo history, input rules and the keyboard shortcuts. */
export function weEditorPlugins(): Plugin[] {
  const listItems = [s.nodes['list_item'], s.nodes['task_item']];
  return [
    history(),
    inputRules({ rules: weEditorInputRules() }),
    keymap({
      // Backspace right after an input rule fired restores the typed characters.
      Backspace: undoInputRule,
      'Mod-z': undo,
      'Mod-y': redo,
      'Shift-Mod-z': redo,
      'Mod-b': toggleMark(s.marks['bold']),
      'Mod-i': toggleMark(s.marks['italic']),
      'Mod-u': toggleMark(s.marks['underline']),
      'Mod-Shift-x': toggleMark(s.marks['strike']),
      'Mod-e': toggleMark(s.marks['code']),
      'Mod-,': toggleMark(s.marks['subscript']),
      'Mod-.': toggleMark(s.marks['superscript']),
      'Shift-Enter': weEditorInsertHardBreak,
      Enter: chainCommands(...listItems.map((t) => splitListItem(t))),
      // Tab only nests list items; elsewhere it keeps moving focus, so keyboard users are not trapped.
      Tab: chainCommands(...listItems.map((t) => sinkListItem(t))),
      'Shift-Tab': chainCommands(...listItems.map((t) => liftListItem(t)))
    }),
    keymap(baseKeymap)
  ];
}

/** Word and character counts of a document. */
export interface WeEditorStats {
  words: number;
  /** Unicode code points, block breaks not counted. */
  characters: number;
}

export function weEditorStats(doc: PmNode): WeEditorStats {
  const text = doc.textBetween(0, doc.content.size, ' ', ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return { words, characters: [...doc.textContent].length };
}

/** A fresh editor state for `html` (sanitized through the schema). */
export function weEditorCreateState(html: string | null | undefined, plugins: Plugin[] = weEditorPlugins()): EditorState {
  return EditorState.create({ doc: weEditorParseHtml(html), plugins });
}

/** Renders task items with a real, clickable checkbox that toggles the `checked` attribute. */
export class WeEditorTaskItemView implements NodeView {
  readonly dom: HTMLLIElement;
  readonly contentDOM: HTMLDivElement;
  private readonly checkbox: HTMLInputElement;

  constructor(
    private node: PmNode,
    private readonly view: EditorView,
    private readonly getPos: () => number | undefined,
    checkboxLabel: string
  ) {
    this.dom = document.createElement('li');
    this.dom.setAttribute('data-type', 'taskItem');
    const label = document.createElement('label');
    label.contentEditable = 'false';
    this.checkbox = document.createElement('input');
    this.checkbox.type = 'checkbox';
    this.checkbox.setAttribute('aria-label', checkboxLabel);
    this.checkbox.addEventListener('change', () => this.toggle());
    label.appendChild(this.checkbox);
    this.contentDOM = document.createElement('div');
    this.dom.append(label, this.contentDOM);
    this.render();
  }

  update(node: PmNode): boolean {
    if (node.type !== this.node.type) return false;
    this.node = node;
    this.render();
    return true;
  }

  stopEvent(event: Event): boolean {
    return event.target === this.checkbox;
  }

  ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Node }): boolean {
    return mutation.type !== 'selection' && !this.contentDOM.contains(mutation.target);
  }

  private render(): void {
    const checked = !!this.node.attrs['checked'];
    this.dom.setAttribute('data-checked', String(checked));
    this.checkbox.checked = checked;
  }

  private toggle(): void {
    const pos = this.getPos();
    if (pos == null || !this.view.editable) {
      this.render();
      return;
    }
    this.view.dispatch(this.view.state.tr.setNodeMarkup(pos, undefined, { ...this.node.attrs, checked: this.checkbox.checked }));
  }
}
