/** A code editor for the HTML source view. Created by `weEditorCreateSourceEditor`. */
export interface WeEditorSourceEditor {
  getText(): string;
  /** Replaces the text without reporting it through `onChange`. */
  setText(text: string): void;
  setReadOnly(readOnly: boolean): void;
  focus(): void;
  destroy(): void;
}

export interface WeEditorSourceEditorOptions {
  text: string;
  readOnly: boolean;
  /** Accessible name of the code area. */
  label: string;
  /** Called after every edit made in the code editor (not for `setText`). */
  onChange: (text: string) => void;
  onBlur?: () => void;
}

/**
 * Mounts a CodeMirror 6 HTML editor in `parent`. CodeMirror is loaded with dynamic `import()`, so an
 * application only downloads it when a source view is first opened. Colours come from the
 * `--we-editor-*` theme variables (syntax colours share the code block ones).
 */
export async function weEditorCreateSourceEditor(parent: HTMLElement, options: WeEditorSourceEditorOptions): Promise<WeEditorSourceEditor> {
  const [view, state, commands, language, langHtml, highlight] = await Promise.all([
    import('@codemirror/view'),
    import('@codemirror/state'),
    import('@codemirror/commands'),
    import('@codemirror/language'),
    import('@codemirror/lang-html'),
    import('@lezer/highlight')
  ]);
  const { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } = view;
  const { tags: t } = highlight;
  const readOnly = new state.Compartment();
  let external = false;

  const theme = EditorView.theme({
    '&': {
      height: '100%',
      color: 'var(--we-editor-font-color, #212529)',
      backgroundColor: 'var(--we-editor-bg, #fff)',
      fontSize: '0.8125rem'
    },
    '&.cm-focused': { outline: 'none' },
    '.cm-scroller': { fontFamily: 'var(--we-editor-code-font-family, monospace)', lineHeight: '1.55' },
    '.cm-content': { caretColor: 'var(--we-editor-font-color, #212529)' },
    '.cm-cursor': { borderLeftColor: 'var(--we-editor-font-color, #212529)' },
    '.cm-gutters': {
      backgroundColor: 'var(--we-editor-toolbar-bg, #f3f6f9)',
      color: 'var(--we-editor-muted-color, #878a99)',
      border: 'none',
      borderRight: '1px solid var(--we-editor-border-color, #dee2e6)'
    },
    '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--we-editor-btn-hover-bg, rgba(0, 0, 0, 0.06))' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: 'var(--we-editor-focus-ring, rgba(64, 81, 137, 0.35))'
    }
  });

  const colours = language.HighlightStyle.define([
    { tag: [t.tagName, t.typeName], color: 'var(--we-editor-code-title, #4078f2)' },
    { tag: [t.attributeName, t.propertyName], color: 'var(--we-editor-code-attr, #b76b01)' },
    { tag: [t.attributeValue, t.string], color: 'var(--we-editor-code-string, #50a14f)' },
    { tag: [t.comment, t.meta], color: 'var(--we-editor-code-comment, #8a8c93)', fontStyle: 'italic' },
    { tag: [t.keyword, t.atom, t.bool], color: 'var(--we-editor-code-keyword, #a626a4)' },
    { tag: [t.number, t.unit], color: 'var(--we-editor-code-number, #986801)' },
    { tag: [t.angleBracket, t.character], color: 'var(--we-editor-muted-color, #878a99)' }
  ]);

  const editor = new EditorView({
    parent,
    state: state.EditorState.create({
      doc: options.text,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        commands.history(),
        // No Tab binding on purpose: Tab keeps moving focus out of the code area (no keyboard trap).
        keymap.of([...commands.defaultKeymap, ...commands.historyKeymap]),
        langHtml.html(),
        language.syntaxHighlighting(colours),
        theme,
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({ 'aria-label': options.label }),
        readOnly.of(state.EditorState.readOnly.of(options.readOnly)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !external) options.onChange(update.state.doc.toString());
        }),
        EditorView.domEventHandlers({ blur: () => void options.onBlur?.() })
      ]
    })
  });

  return {
    getText: () => editor.state.doc.toString(),
    setText: (text) => {
      if (text === editor.state.doc.toString()) return;
      external = true;
      try {
        editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: text } });
      } finally {
        external = false;
      }
    },
    setReadOnly: (value) => editor.dispatch({ effects: readOnly.reconfigure(state.EditorState.readOnly.of(value)) }),
    focus: () => editor.focus(),
    destroy: () => editor.destroy()
  };
}
