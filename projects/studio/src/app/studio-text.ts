export type StudioLanguage = 'en' | 'tr';

const LANGUAGE_KEY = 'we-editor-studio:lang';

/** The saved language, else the browser's */
export function studioLanguage(): StudioLanguage {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'en' || saved === 'tr') return saved;
  } catch {
    // storage blocked — fall through to the browser language
  }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

export function saveStudioLanguage(lang: StudioLanguage): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // storage blocked — the choice lasts until the reload only
  }
}

const en = {
  tagline: 'A themeable Angular rich-text editor on ProseMirror — free, MIT, no CSS framework, no icon font.',
  tabEditor: 'Editor',
  tabHtml: 'Safe HTML',
  tabStart: 'Get started',
  editorTitle: 'Field trip report',
  editorIntro: 'Everything below runs in your browser and is editable. Your changes are kept in this browser only.',
  placeholder: 'Start typing… try # , - , 1.  or >',
  readonly: 'Read-only',
  words: 'words',
  characters: 'characters',
  tryTitle: 'Things to try',
  editorTips: [
    'Select text and use the toolbar: bold, font, size, alignment — the colour and highlight buttons open a palette with recent colours, Ω inserts symbols and emoji.',
    'Start a line with # , - , 1. , > or ``` — Markdown shortcuts turn it into a heading, list, quote or code block.',
    'Click the picture and drag its corner to resize it; the image bar sets alt text, width and position. Paste or drop your own picture.',
    'Put the cursor in the table: add rows and columns, select two cells to merge them, drag a column border to resize.',
    'Press Ctrl+F (⌘F) to find and replace — with match case, whole words and replace all.',
    'Paste a YouTube or Vimeo link on an empty line to embed the player; typed and pasted URLs become links.',
    'Put the cursor in the code block and pick a language in the bar under the toolbar — the code is coloured.',
    'Press </> at the end of the toolbar for the HTML source; Split shows code and design side by side, kept in sync.',
    'Format painter: click inside formatted text, press the roller, then select other text. Aa changes case; the line height picker sits next to the font size.',
    'Ctrl+Z undoes everything; Tab and Shift+Tab nest lists and move between table cells.'
  ],
  htmlTitle: 'HTML in, safe HTML out',
  htmlIntro: 'The editor is a form control: its value is HTML. Anything the schema does not know — scripts, event handlers, javascript: links, unknown iframes — is dropped on the way in.',
  htmlOut: 'Form value (HTML out)',
  htmlIn: 'HTML in',
  htmlInPlaceholder: 'Paste HTML here, then load it into the editor',
  htmlLoad: 'Load into the editor',
  htmlSanitized: 'Sanitized by weEditorSanitizeHtml:',
  htmlUnsafe: '<p onclick="alert(1)">Hello <a href="javascript:alert(2)">link</a></p><script>alert(3)</script><iframe src="https://evil.example"></iframe>',
  resetExample: 'Reset the example',
  startTitle: 'Use it in your app',
  install: 'Install',
  themeStep: 'Add the theme to your global styles (angular.json → styles):',
  useStep: 'Use it like any form control:',
  themeLabel: 'Theme',
  light: 'Light',
  dark: 'Dark',
  language: 'Language',
  docs: 'Documentation',
  features: 'Features and comparison',
  sisterProject: 'From the same family: we-grid (data grid and spreadsheet) and we-report (report designer).'
};

const tr: typeof en = {
  tagline: 'ProseMirror üzerinde temalandırılabilir Angular zengin metin editörü — ücretsiz, MIT, CSS framework ve ikon fontu yok.',
  tabEditor: 'Editör',
  tabHtml: 'Güvenli HTML',
  tabStart: 'Başlarken',
  editorTitle: 'Gezi raporu',
  editorIntro: 'Aşağıdaki her şey tarayıcınızda çalışır ve düzenlenebilir. Değişiklikleriniz yalnızca bu tarayıcıda saklanır.',
  placeholder: 'Yazmaya başlayın… # , - , 1.  ya da > deneyin',
  readonly: 'Salt okunur',
  words: 'kelime',
  characters: 'karakter',
  tryTitle: 'Deneyebilecekleriniz',
  editorTips: [
    'Metni seçip araç çubuğunu kullanın: kalın, yazı tipi, boyut, hizalama — renk ve vurgu düğmeleri son kullanılan renklerle bir palet açar, Ω sembol ve emoji ekler.',
    'Satıra # , - , 1. , > ya da ``` ile başlayın — Markdown kısayolları başlık, liste, alıntı ya da kod bloğu yapar.',
    'Resme tıklayıp köşesinden sürükleyerek boyutlandırın; resim çubuğu alternatif metin, genişlik ve konum ayarlar. Kendi resminizi yapıştırın ya da bırakın.',
    'İmleci tabloya koyun: satır ve kolon ekleyin, iki hücre seçip birleştirin, kolon kenarını sürükleyip genişletin.',
    'Ctrl+F (⌘F) ile bulun ve değiştirin — büyük/küçük harf, tam kelime ve tümünü değiştir ile.',
    'Boş bir satıra YouTube ya da Vimeo bağlantısı yapıştırınca oynatıcı gömülür; yazılan ve yapıştırılan adresler bağlantı olur.',
    'İmleci kod bloğuna koyup araç çubuğunun altındaki bardan bir dil seçin — kod renklenir.',
    'Araç çubuğunun sonundaki </> ile HTML kaynağını açın; Bölünmüş görünüm kodu ve tasarımı yan yana, eşzamanlı gösterir.',
    'Biçim boyacısı: biçimli metne tıklayın, rulo düğmesine basın, sonra başka bir metni seçin. Aa büyük/küçük harfi değiştirir; satır aralığı yazı boyutunun yanında.',
    'Ctrl+Z her şeyi geri alır; Tab ve Shift+Tab listeleri iç içe alır, tablo hücreleri arasında gezer.'
  ],
  htmlTitle: 'HTML girer, güvenli HTML çıkar',
  htmlIntro: 'Editör bir form kontrolüdür: değeri HTML’dir. Şemanın tanımadığı her şey — script, olay işleyicileri, javascript: bağlantıları, bilinmeyen iframe’ler — girişte atılır.',
  htmlOut: 'Form değeri (çıkan HTML)',
  htmlIn: 'Giren HTML',
  htmlInPlaceholder: 'HTML’i buraya yapıştırın, sonra editöre yükleyin',
  htmlLoad: 'Editöre yükle',
  htmlSanitized: 'weEditorSanitizeHtml ile temizlenmiş hali:',
  htmlUnsafe: '<p onclick="alert(1)">Merhaba <a href="javascript:alert(2)">bağlantı</a></p><script>alert(3)</script><iframe src="https://evil.example"></iframe>',
  resetExample: 'Örneği sıfırla',
  startTitle: 'Uygulamanızda kullanın',
  install: 'Kurulum',
  themeStep: 'Temayı global stillerinize ekleyin (angular.json → styles):',
  useStep: 'Herhangi bir form kontrolü gibi kullanın:',
  themeLabel: 'Tema',
  light: 'Açık',
  dark: 'Koyu',
  language: 'Dil',
  docs: 'Dokümantasyon',
  features: 'Özellikler ve karşılaştırma',
  sisterProject: 'Aynı aileden: we-grid (veri tablosu ve hesap tablosu) ve we-report (rapor tasarımcısı).'
};

export type StudioText = typeof en;

export const STUDIO_TEXT: Record<StudioLanguage, StudioText> = { en, tr };

const SAMPLE_EN = `
<h1>Field trip report</h1>
<p><img src="sample-landscape.png" alt="Green hills under an evening sun" width="300" style="float: right">Everything you see is editable: <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strike</s>,
H<sub>2</sub>O, x<sup>2</sup>, <code>inline code</code>, <span style="color: #c2255c">colour</span>,
<mark style="background-color: #ffe066">highlight</mark>, <span style="font-family: Georgia, serif">Georgia</span>,
<span style="font-size: 24px">24px</span> and a <a href="https://github.com/emrecirik/we-editor">link</a>.
Click the picture and drag its corner to resize it.</p>
<h2>Checklist</h2>
<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><div><p>Book the bus</p></div></li><li data-type="taskItem" data-checked="false"><div><p>Pack lunch</p></div></li></ul>
<h2>Budget</h2>
<table><tbody><tr><th><p>Item</p></th><th><p>Qty</p></th><th><p>Cost</p></th></tr><tr><td><p>Bus</p></td><td><p>1</p></td><td><p>240.00</p></td></tr><tr><td><p>Tickets</p></td><td><p>28</p></td><td><p>196.00</p></td></tr><tr><td colspan="2"><p><strong>Total</strong></p></td><td><p><strong>436.00</strong></p></td></tr></tbody></table>
<h3 style="text-align: center">Notes</h3>
<ol><li><p>Leave at 8:00</p><ul><li><p>Meet at the main gate</p></li></ul></li><li><p>Back by 17:00</p></li></ol>
<blockquote><p>Type <code># </code>, <code>- </code>, <code>1. </code> or <code>&gt; </code> at the start of a line.</p></blockquote>
<pre><code class="language-javascript">const total = 240 + 196; // 436
console.log('Total:', total);</code></pre>
`;

const SAMPLE_TR = `
<h1>Gezi raporu</h1>
<p><img src="sample-landscape.png" alt="Akşam güneşi altında yeşil tepeler" width="300" style="float: right">Gördüğünüz her şey düzenlenebilir: <strong>kalın</strong>, <em>italik</em>, <u>altı çizili</u>, <s>üstü çizili</s>,
H<sub>2</sub>O, x<sup>2</sup>, <code>satır içi kod</code>, <span style="color: #c2255c">renk</span>,
<mark style="background-color: #ffe066">vurgu</mark>, <span style="font-family: Georgia, serif">Georgia</span>,
<span style="font-size: 24px">24px</span> ve bir <a href="https://github.com/emrecirik/we-editor">bağlantı</a>.
Resme tıklayıp köşesinden sürükleyerek boyutlandırın.</p>
<h2>Kontrol listesi</h2>
<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><div><p>Otobüsü ayarla</p></div></li><li data-type="taskItem" data-checked="false"><div><p>Öğle yemeğini hazırla</p></div></li></ul>
<h2>Bütçe</h2>
<table><tbody><tr><th><p>Kalem</p></th><th><p>Adet</p></th><th><p>Tutar</p></th></tr><tr><td><p>Otobüs</p></td><td><p>1</p></td><td><p>240,00</p></td></tr><tr><td><p>Biletler</p></td><td><p>28</p></td><td><p>196,00</p></td></tr><tr><td colspan="2"><p><strong>Toplam</strong></p></td><td><p><strong>436,00</strong></p></td></tr></tbody></table>
<h3 style="text-align: center">Notlar</h3>
<ol><li><p>8:00’de yola çık</p><ul><li><p>Ana kapıda buluş</p></li></ul></li><li><p>17:00’de dönüş</p></li></ol>
<blockquote><p>Satır başında <code># </code>, <code>- </code>, <code>1. </code> ya da <code>&gt; </code> yazın.</p></blockquote>
<pre><code class="language-javascript">const toplam = 240 + 196; // 436
console.log('Toplam:', toplam);</code></pre>
`;

export const STUDIO_SAMPLE: Record<StudioLanguage, string> = { en: SAMPLE_EN, tr: SAMPLE_TR };
