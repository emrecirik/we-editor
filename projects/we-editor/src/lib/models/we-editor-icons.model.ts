import { InjectionToken } from '@angular/core';

/** Icon-key → raw SVG markup string. Every key the toolbar uses must be present or the icon renders empty. */
export type WeEditorIcons = Record<string, string>;

function svg(path: string): string {
  return `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" xmlns="http://www.w3.org/2000/svg">${path}</svg>`;
}

/**
 * Built-in icon set used when the host application doesn't provide its own `WE_EDITOR_ICONS`.
 * Inline SVG on purpose: the library never depends on an icon font. Icon markup is trusted
 * developer configuration (it is rendered as-is), never user content.
 */
export const weEditorDefaultIcons: WeEditorIcons = {
  undo: svg('<path d="M7.8 7H14a6 6 0 0 1 0 12H6v-2h8a4 4 0 0 0 0-8H7.8l2.6 2.6L9 13 4 8l5-5 1.4 1.4z"/>'),
  redo: svg('<path d="M16.2 7H10a6 6 0 0 0 0 12h8v-2h-8a4 4 0 0 1 0-8h6.2l-2.6 2.6L15 13l5-5-5-5-1.4 1.4z"/>'),
  bold: svg('<path d="M7 4h6a4 4 0 0 1 2.9 6.8A4.5 4.5 0 0 1 14 20H7V4Zm2.5 2.3v4.4H13a2.2 2.2 0 0 0 0-4.4H9.5Zm0 6.6v4.8H14a2.4 2.4 0 0 0 0-4.8H9.5Z"/>'),
  italic: svg('<path d="M10 4h8v2h-2.9l-4 12H14v2H6v-2h2.9l4-12H10z"/>'),
  underline: svg('<path d="M7 3h2v8a3 3 0 0 0 6 0V3h2v8a5 5 0 0 1-10 0V3ZM5 19h14v2H5z"/>'),
  strike: svg('<path d="M3 11h18v2H3zm9-8c2.6 0 4.6 1.3 5 3.5l-2 .4C14.7 5.6 13.5 5 12 5c-1.9 0-3 .9-3 2 0 .8.4 1.4 1.6 1.9H6.9A3.8 3.8 0 0 1 7 4.8C7.9 3.7 9.7 3 12 3Zm2.9 12h2.2c.2.4.3.9.3 1.4C17.4 19.2 15 21 12 21c-2.8 0-5-1.4-5.6-3.8l2-.5C8.8 18.2 10.2 19 12 19c1.9 0 3.4-1 3.4-2.5 0-.6-.2-1.1-.5-1.5Z"/>'),
  subscript: svg('<path d="m5.6 5 4 5.2 4-5.2h2.5l-5.3 7 5.3 7h-2.5l-4-5.2-4 5.2H3l5.3-7L3 5h2.6Zm15.4 16h-4v-1l2-1.6c.6-.5 1-.9 1-1.4 0-.4-.3-.7-.8-.7-.5 0-.9.3-1.2.7l-.9-.7c.5-.7 1.2-1.1 2.1-1.1 1.2 0 2 .7 2 1.7 0 .8-.5 1.4-1.3 2l-.9.7H21V21Z"/>'),
  superscript: svg('<path d="m5.6 7 4 5.2 4-5.2h2.5l-5.3 7 5.3 7h-2.5l-4-5.2-4 5.2H3l5.3-7L3 7h2.6ZM21 9h-4V8l2-1.6c.6-.5 1-.9 1-1.4 0-.4-.3-.7-.8-.7-.5 0-.9.3-1.2.7l-.9-.7c.5-.7 1.2-1.1 2.1-1.1 1.2 0 2 .7 2 1.7 0 .8-.5 1.4-1.3 2l-.9.7H21V9Z"/>'),
  code: svg('<path d="m8.6 16.6-4.6-4.6 4.6-4.6L7.2 6 1.2 12l6 6 1.4-1.4Zm6.8 0 4.6-4.6-4.6-4.6L16.8 6l6 6-6 6-1.4-1.4Z"/>'),
  textColor: svg('<path d="M11 3h2l6 15h-2.2l-1.6-4H8.8l-1.6 4H5L11 3Zm-1.4 9h4.8L12 5.8 9.6 12Z"/><rect x="3" y="20" width="18" height="2" style="fill: var(--we-editor-swatch, currentColor)"/>'),
  highlight: svg('<path d="m15.2 2.8 6 6-9.6 9.6H6.4v-1.4L4 14.6l9.6-9.6 1.6-2.2Zm0 2.9-7.9 7.9 3.1 3.1 7.9-7.9-3.1-3.1Z"/><rect x="2" y="20" width="20" height="2" style="fill: var(--we-editor-swatch, currentColor)"/>'),
  alignLeft: svg('<path d="M3 4h18v2H3zm0 4h12v2H3zm0 4h18v2H3zm0 4h12v2H3zm0 4h18v2H3z"/>'),
  alignCenter: svg('<path d="M3 4h18v2H3zm3 4h12v2H6zm-3 4h18v2H3zm3 4h12v2H6zm-3 4h18v2H3z"/>'),
  alignRight: svg('<path d="M3 4h18v2H3zm6 4h12v2H9zm-6 4h18v2H3zm6 4h12v2H9zm-6 4h18v2H3z"/>'),
  alignJustify: svg('<path d="M3 4h18v2H3zm0 4h18v2H3zm0 4h18v2H3zm0 4h18v2H3zm0 4h18v2H3z"/>'),
  bulletList: svg('<path d="M9 5h12v2H9zm0 6h12v2H9zm0 6h12v2H9z"/><circle cx="4.5" cy="6" r="1.5"/><circle cx="4.5" cy="12" r="1.5"/><circle cx="4.5" cy="18" r="1.5"/>'),
  orderedList: svg('<path d="M9 5h12v2H9zm0 6h12v2H9zm0 6h12v2H9zM4 4h1.5v4H4.5V5.2H4zM3 11.5c0-.8.6-1.5 1.5-1.5S6 10.6 6 11.3c0 .5-.3.9-.8 1.3l-.6.4H6V14H3v-.8l1.4-1.1c.3-.2.4-.4.4-.6 0-.2-.1-.3-.3-.3-.2 0-.4.2-.4.4H3Zm0 5h3V17l-1 .8c.6.1 1 .5 1 1.1 0 .7-.6 1.1-1.5 1.1S3 19.5 3 18.8h1c0 .2.2.3.5.3s.5-.1.5-.3c0-.2-.2-.3-.6-.3h-.3v-.7l.7-.6H3v-.7Z"/>'),
  taskList: svg('<path d="M11 5h10v2H11zm0 12h10v2H11zm0-6h10v2H11zM3 4h5v5H3V4Zm1.5 1.5v2h2v-2h-2ZM3 16h5v5H3v-5Zm1.5 1.5v2h2v-2h-2Zm-.9-7.1 1.1-1.1 1.2 1.2 2.6-2.6 1.1 1.1-3.7 3.7-2.3-2.3Z"/>'),
  indent: svg('<path d="M3 4h18v2H3zm8 4h10v2H11zm0 4h10v2H11zm0 4h10v2H11zm-8 4h18v2H3zM3 8l4 4-4 4V8Z"/>'),
  outdent: svg('<path d="M3 4h18v2H3zm8 4h10v2H11zm0 4h10v2H11zm0 4h10v2H11zm-8 4h18v2H3zM7 8l-4 4 4 4V8Z"/>'),
  blockquote: svg('<path d="M4 6h6v6H7.4c0 2 1 3.2 2.6 3.6V18c-3.4-.4-6-3-6-7V6Zm10 0h6v6h-2.6c0 2 1 3.2 2.6 3.6V18c-3.4-.4-6-3-6-7V6Z"/>'),
  codeBlock: svg('<path d="M3 3h18v18H3V3Zm2 2v14h14V5H5Zm4.3 3.3L10.7 9.7 8.4 12l2.3 2.3-1.4 1.4L5.6 12l3.7-3.7Zm5.4 0 3.7 3.7-3.7 3.7-1.4-1.4 2.3-2.3-2.3-2.3 1.4-1.4Z"/>'),
  horizontalRule: svg('<path d="M3 11h18v2H3z"/><path d="M5 6h14v1.5H5zm0 10.5h14V18H5z" opacity=".35"/>'),
  link: svg('<path d="M10.6 13.4a1 1 0 0 1 0-1.4l4-4a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0Zm2.1-6.4 1.6-1.6a4.5 4.5 0 0 1 6.3 6.3L19 13.3l-1.4-1.4 1.6-1.6a2.5 2.5 0 0 0-3.5-3.5l-1.6 1.6L12.7 7Zm-1.4 10 1.4 1.4-1.6 1.6a4.5 4.5 0 0 1-6.3-6.3L6.4 12l1.4 1.4-1.6 1.6a2.5 2.5 0 0 0 3.5 3.5l1.6-1.5Z"/>'),
  unlink: svg('<path d="M3.3 2 22 20.7 20.7 22l-5.5-5.5-2.4 2.4a4.5 4.5 0 0 1-6.3-6.3l2.4-2.4L2 3.3 3.3 2Zm6.3 8.6-2.4 2.4a2.5 2.5 0 0 0 3.5 3.5l2.4-2.4-3.5-3.5Zm4.7-5.2a4.5 4.5 0 0 1 6.3 6.3l-1.6 1.6-1.4-1.4 1.6-1.6a2.5 2.5 0 0 0-3.5-3.5l-1.6 1.6-1.4-1.4 1.6-1.6Z"/>'),
  image: svg('<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v9.6l4-4 3.5 3.5 2.5-2.5 6 6V6H4Zm11.5 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/>'),
  media: svg('<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2v10h16V7H4Zm6 2 5 3-5 3V9Z"/>'),
  table: svg('<path d="M3 4h18v16H3V4Zm2 2v3h5V6H5Zm7 0v3h7V6h-7Zm7 5h-7v3h7v-3Zm0 5h-7v2h7v-2Zm-9 2v-2H5v2h5Zm-5-4h5v-3H5v3Z"/>'),
  findReplace: svg('<path d="M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/>'),
  findPrevious: svg('<path d="m12 8 6 6-1.4 1.4-4.6-4.6-4.6 4.6L6 14z"/>'),
  findNext: svg('<path d="m12 16-6-6 1.4-1.4 4.6 4.6 4.6-4.6L18 10z"/>'),
  specialChars: svg('<path d="M12 4a7 7 0 0 1 4.2 12.6V18H20v2h-6v-4.6a5 5 0 1 0-4 0V20H4v-2h3.8v-1.4A7 7 0 0 1 12 4Z"/>'),
  source: svg('<path d="m7.4 16.6-4.6-4.6 4.6-4.6L6 6 0 12l6 6 1.4-1.4Zm9.2 0 4.6-4.6-4.6-4.6L18 6l6 6-6 6-1.4-1.4ZM13.6 4l1.9.5-5.1 15.5-1.9-.5L13.6 4Z"/>'),
  formatPainter: svg('<path d="M4 3h13a1 1 0 0 1 1 1v1h2v6h-8v2h1v8h-4v-8h1v-4h8V7h-2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm1 2v2h11V5H5Z"/>'),
  close: svg('<path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6 10.6 12 5 6.4z"/>'),
  clearFormatting: svg('<path d="M6 4h13v2.5h-5.3L12.5 10l-2-2 .7-1.5H6V4Zm-2.7.3L19.7 20.7l-1.4 1.4-6.1-6.1L10.6 20H8l2.4-5.8-8.5-8.5 1.4-1.4Z"/>')
};

export const WE_EDITOR_ICONS = new InjectionToken<WeEditorIcons>('WE_EDITOR_ICONS', {
  providedIn: 'root',
  factory: () => weEditorDefaultIcons
});
