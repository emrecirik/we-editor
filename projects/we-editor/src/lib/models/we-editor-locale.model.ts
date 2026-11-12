import { InjectionToken } from '@angular/core';

/** Every user-facing string the editor renders. Provide `WE_EDITOR_LOCALE` to translate. */
export interface WeEditorLocale {
  toolbar: string;
  content: string;
  undo: string;
  redo: string;
  blockType: string;
  paragraph: string;
  /** Prefix for heading options; rendered as `${heading} ${level}`. */
  heading: string;
  fontFamily: string;
  fontFamilyDefault: string;
  fontSize: string;
  fontSizeDefault: string;
  bold: string;
  italic: string;
  underline: string;
  strike: string;
  subscript: string;
  superscript: string;
  code: string;
  textColor: string;
  highlight: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  alignJustify: string;
  bulletList: string;
  orderedList: string;
  taskList: string;
  taskItemToggle: string;
  indent: string;
  outdent: string;
  blockquote: string;
  codeBlock: string;
  horizontalRule: string;
  link: string;
  unlink: string;
  linkUrl: string;
  linkUrlPlaceholder: string;
  linkNewTab: string;
  linkApply: string;
  linkCancel: string;
  linkInvalid: string;
  clearFormatting: string;
  image: string;
  imageUrl: string;
  imageUrlPlaceholder: string;
  imageUpload: string;
  imageAlt: string;
  imageAltPlaceholder: string;
  imageWidth: string;
  imageAlign: string;
  imageAlignInline: string;
  imageAlignLeft: string;
  imageAlignCenter: string;
  imageAlignRight: string;
  imageApply: string;
  imageCancel: string;
  imageInvalid: string;
  imageUploadFailed: string;
  table: string;
  tableRows: string;
  tableColumns: string;
  tableHeaderRow: string;
  tableInsert: string;
  tableCancel: string;
  tableTools: string;
  tableAddRowBefore: string;
  tableAddRowAfter: string;
  tableDeleteRow: string;
  tableAddColumnBefore: string;
  tableAddColumnAfter: string;
  tableDeleteColumn: string;
  tableMergeCells: string;
  tableSplitCell: string;
  tableToggleHeaderRow: string;
  tableToggleHeaderColumn: string;
  tableDelete: string;
  findReplace: string;
  findPlaceholder: string;
  replacePlaceholder: string;
  findCaseSensitive: string;
  findWholeWord: string;
  findPrevious: string;
  findNext: string;
  replaceOne: string;
  replaceAll: string;
  findClose: string;
  /** `{current}` and `{total}` are replaced with numbers. */
  findCount: string;
  findNoResults: string;
  media: string;
  mediaUrl: string;
  mediaUrlPlaceholder: string;
  mediaInsert: string;
  mediaCancel: string;
  mediaInvalid: string;
  colorRemove: string;
  colorCustom: string;
  colorRecent: string;
  specialChars: string;
}

export const weEditorLocaleEn: WeEditorLocale = {
  toolbar: 'Editor toolbar',
  content: 'Rich text editor',
  undo: 'Undo',
  redo: 'Redo',
  blockType: 'Text style',
  paragraph: 'Paragraph',
  heading: 'Heading',
  fontFamily: 'Font',
  fontFamilyDefault: 'Default font',
  fontSize: 'Font size',
  fontSizeDefault: 'Default size',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strike: 'Strikethrough',
  subscript: 'Subscript',
  superscript: 'Superscript',
  code: 'Inline code',
  textColor: 'Text colour',
  highlight: 'Highlight',
  alignLeft: 'Align left',
  alignCenter: 'Align centre',
  alignRight: 'Align right',
  alignJustify: 'Justify',
  bulletList: 'Bulleted list',
  orderedList: 'Numbered list',
  taskList: 'Task list',
  taskItemToggle: 'Mark task as done',
  indent: 'Increase indent',
  outdent: 'Decrease indent',
  blockquote: 'Quote',
  codeBlock: 'Code block',
  horizontalRule: 'Horizontal line',
  link: 'Insert link',
  unlink: 'Remove link',
  linkUrl: 'Link address',
  linkUrlPlaceholder: 'https://example.com',
  linkNewTab: 'Open in new tab',
  linkApply: 'Apply',
  linkCancel: 'Cancel',
  linkInvalid: 'This link address is not allowed.',
  clearFormatting: 'Clear formatting',
  image: 'Insert image',
  imageUrl: 'Image address',
  imageUrlPlaceholder: 'https://example.com/picture.png',
  imageUpload: 'Upload from computer',
  imageAlt: 'Alternative text',
  imageAltPlaceholder: 'Describe the image for screen readers',
  imageWidth: 'Width (px)',
  imageAlign: 'Position',
  imageAlignInline: 'In line with text',
  imageAlignLeft: 'Left, text wraps',
  imageAlignCenter: 'Centred',
  imageAlignRight: 'Right, text wraps',
  imageApply: 'Apply',
  imageCancel: 'Cancel',
  imageInvalid: 'This image address is not allowed.',
  imageUploadFailed: 'The image could not be added.',
  table: 'Insert table',
  tableRows: 'Rows',
  tableColumns: 'Columns',
  tableHeaderRow: 'Header row',
  tableInsert: 'Insert',
  tableCancel: 'Cancel',
  tableTools: 'Table tools',
  tableAddRowBefore: 'Row above',
  tableAddRowAfter: 'Row below',
  tableDeleteRow: 'Delete row',
  tableAddColumnBefore: 'Column left',
  tableAddColumnAfter: 'Column right',
  tableDeleteColumn: 'Delete column',
  tableMergeCells: 'Merge cells',
  tableSplitCell: 'Split cell',
  tableToggleHeaderRow: 'Header row',
  tableToggleHeaderColumn: 'Header column',
  tableDelete: 'Delete table',
  findReplace: 'Find and replace',
  findPlaceholder: 'Find',
  replacePlaceholder: 'Replace with',
  findCaseSensitive: 'Match case',
  findWholeWord: 'Whole words',
  findPrevious: 'Previous match',
  findNext: 'Next match',
  replaceOne: 'Replace',
  replaceAll: 'Replace all',
  findClose: 'Close',
  findCount: '{current} of {total}',
  findNoResults: 'No results',
  media: 'Insert video',
  mediaUrl: 'Video address',
  mediaUrlPlaceholder: 'YouTube or Vimeo link',
  mediaInsert: 'Insert',
  mediaCancel: 'Cancel',
  mediaInvalid: 'Only YouTube and Vimeo links can be embedded.',
  colorRemove: 'Remove colour',
  colorCustom: 'Custom colour…',
  colorRecent: 'Recent',
  specialChars: 'Special characters'
};

export const weEditorLocaleTr: WeEditorLocale = {
  toolbar: 'Editör araç çubuğu',
  content: 'Zengin metin editörü',
  undo: 'Geri al',
  redo: 'Yinele',
  blockType: 'Metin stili',
  paragraph: 'Paragraf',
  heading: 'Başlık',
  fontFamily: 'Yazı tipi',
  fontFamilyDefault: 'Varsayılan yazı tipi',
  fontSize: 'Yazı boyutu',
  fontSizeDefault: 'Varsayılan boyut',
  bold: 'Kalın',
  italic: 'İtalik',
  underline: 'Altı çizili',
  strike: 'Üstü çizili',
  subscript: 'Alt simge',
  superscript: 'Üst simge',
  code: 'Satır içi kod',
  textColor: 'Yazı rengi',
  highlight: 'Vurgu rengi',
  alignLeft: 'Sola hizala',
  alignCenter: 'Ortala',
  alignRight: 'Sağa hizala',
  alignJustify: 'İki yana yasla',
  bulletList: 'Madde işaretli liste',
  orderedList: 'Numaralı liste',
  taskList: 'Görev listesi',
  taskItemToggle: 'Görevi tamamlandı işaretle',
  indent: 'Girintiyi artır',
  outdent: 'Girintiyi azalt',
  blockquote: 'Alıntı',
  codeBlock: 'Kod bloğu',
  horizontalRule: 'Yatay çizgi',
  link: 'Bağlantı ekle',
  unlink: 'Bağlantıyı kaldır',
  linkUrl: 'Bağlantı adresi',
  linkUrlPlaceholder: 'https://ornek.com',
  linkNewTab: 'Yeni sekmede aç',
  linkApply: 'Uygula',
  linkCancel: 'Vazgeç',
  linkInvalid: 'Bu bağlantı adresine izin verilmiyor.',
  clearFormatting: 'Biçimlendirmeyi temizle',
  image: 'Resim ekle',
  imageUrl: 'Resim adresi',
  imageUrlPlaceholder: 'https://ornek.com/resim.png',
  imageUpload: 'Bilgisayardan yükle',
  imageAlt: 'Alternatif metin',
  imageAltPlaceholder: 'Resmi ekran okuyucular için tanımlayın',
  imageWidth: 'Genişlik (px)',
  imageAlign: 'Konum',
  imageAlignInline: 'Metinle aynı satırda',
  imageAlignLeft: 'Solda, metin çevresinde',
  imageAlignCenter: 'Ortada',
  imageAlignRight: 'Sağda, metin çevresinde',
  imageApply: 'Uygula',
  imageCancel: 'Vazgeç',
  imageInvalid: 'Bu resim adresine izin verilmiyor.',
  imageUploadFailed: 'Resim eklenemedi.',
  table: 'Tablo ekle',
  tableRows: 'Satır',
  tableColumns: 'Sütun',
  tableHeaderRow: 'Başlık satırı',
  tableInsert: 'Ekle',
  tableCancel: 'Vazgeç',
  tableTools: 'Tablo araçları',
  tableAddRowBefore: 'Üste satır',
  tableAddRowAfter: 'Alta satır',
  tableDeleteRow: 'Satırı sil',
  tableAddColumnBefore: 'Sola sütun',
  tableAddColumnAfter: 'Sağa sütun',
  tableDeleteColumn: 'Sütunu sil',
  tableMergeCells: 'Hücreleri birleştir',
  tableSplitCell: 'Hücreyi böl',
  tableToggleHeaderRow: 'Başlık satırı',
  tableToggleHeaderColumn: 'Başlık sütunu',
  tableDelete: 'Tabloyu sil',
  findReplace: 'Bul ve değiştir',
  findPlaceholder: 'Bul',
  replacePlaceholder: 'Şununla değiştir',
  findCaseSensitive: 'Büyük/küçük harf',
  findWholeWord: 'Tam kelime',
  findPrevious: 'Önceki eşleşme',
  findNext: 'Sonraki eşleşme',
  replaceOne: 'Değiştir',
  replaceAll: 'Tümünü değiştir',
  findClose: 'Kapat',
  findCount: '{current} / {total}',
  findNoResults: 'Sonuç yok',
  media: 'Video ekle',
  mediaUrl: 'Video adresi',
  mediaUrlPlaceholder: 'YouTube veya Vimeo bağlantısı',
  mediaInsert: 'Ekle',
  mediaCancel: 'Vazgeç',
  mediaInvalid: 'Yalnızca YouTube ve Vimeo bağlantıları eklenebilir.',
  colorRemove: 'Rengi kaldır',
  colorCustom: 'Özel renk…',
  colorRecent: 'Son kullanılanlar',
  specialChars: 'Özel karakterler'
};

export const WE_EDITOR_LOCALE = new InjectionToken<WeEditorLocale>('WE_EDITOR_LOCALE', {
  providedIn: 'root',
  factory: () => weEditorLocaleEn
});
