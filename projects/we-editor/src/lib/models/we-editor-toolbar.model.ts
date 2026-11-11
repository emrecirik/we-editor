/** A toolbar entry. `'|'` draws a separator. */
export type WeEditorToolbarItem =
  | '|'
  | 'undo'
  | 'redo'
  | 'blockType'
  | 'fontFamily'
  | 'fontSize'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'subscript'
  | 'superscript'
  | 'code'
  | 'textColor'
  | 'highlight'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'alignJustify'
  | 'bulletList'
  | 'orderedList'
  | 'taskList'
  | 'outdent'
  | 'indent'
  | 'blockquote'
  | 'codeBlock'
  | 'horizontalRule'
  | 'link'
  | 'unlink'
  | 'clearFormatting';

export const WE_EDITOR_DEFAULT_TOOLBAR: readonly WeEditorToolbarItem[] = [
  'undo', 'redo', '|',
  'blockType', 'fontFamily', 'fontSize', '|',
  'bold', 'italic', 'underline', 'strike', 'subscript', 'superscript', 'code', '|',
  'textColor', 'highlight', '|',
  'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', '|',
  'bulletList', 'orderedList', 'taskList', 'outdent', 'indent', '|',
  'blockquote', 'codeBlock', 'horizontalRule', '|',
  'link', 'unlink', '|',
  'clearFormatting'
];

/** An entry of the font family / font size pickers. `value` is the CSS value written to the text. */
export interface WeEditorOption {
  label: string;
  value: string;
}

export const WE_EDITOR_DEFAULT_FONT_FAMILIES: readonly WeEditorOption[] = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" }
];

export const WE_EDITOR_DEFAULT_FONT_SIZES: readonly WeEditorOption[] = ['10px', '12px', '14px', '16px', '18px', '24px', '32px'].map(
  (v) => ({ label: v.replace('px', ''), value: v })
);
