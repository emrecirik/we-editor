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
  | 'image'
  | 'media'
  | 'table'
  | 'specialChars'
  | 'findReplace'
  | 'clearFormatting';

export const WE_EDITOR_DEFAULT_TOOLBAR: readonly WeEditorToolbarItem[] = [
  'undo', 'redo', '|',
  'blockType', 'fontFamily', 'fontSize', '|',
  'bold', 'italic', 'underline', 'strike', 'subscript', 'superscript', 'code', '|',
  'textColor', 'highlight', '|',
  'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', '|',
  'bulletList', 'orderedList', 'taskList', 'outdent', 'indent', '|',
  'blockquote', 'codeBlock', 'horizontalRule', '|',
  'link', 'unlink', 'image', 'media', 'table', 'specialChars', '|',
  'findReplace', 'clearFormatting'
];

/** Swatches of the text colour and highlight palettes — document colours, written into the HTML as-is. */
export const WE_EDITOR_DEFAULT_COLORS: readonly string[] = [
  '#000000', '#495057', '#868e96', '#ced4da', '#ffffff',
  '#c92a2a', '#e8590c', '#f08c00', '#2b8a3e', '#0b7285',
  '#1864ab', '#5f3dc4', '#a61e4d', '#ffe066', '#b2f2bb',
  '#a5d8ff', '#d0bfff', '#fcc2d7', '#ffd8a8', '#99e9f2'
];

/** Characters offered by the special-characters picker; each entry is inserted as typed text. */
export const WE_EDITOR_DEFAULT_SPECIAL_CHARACTERS: readonly string[] = [
  ...'©®™§¶†‡•…–—‘’“”«»‹›°±×÷≠≤≥≈∞√∑∏πµ∆Ω½¼¾¹²³€£¥¢₺₹₽←→↑↓↔⇒⇔✓✗★☆♥♦♣♠αβγδελσφ',
  '😀', '😂', '😊', '😍', '🤔', '😎', '😢', '👍', '👎', '👏', '🙏', '🎉', '❤️', '🔥', '✅', '❌', '⭐', '💡', '📌', '📎', '⚠️', '🚀'
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
