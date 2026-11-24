import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { WE_EDITOR_DEFAULT_TOOLBAR, WeEditorComment, WeEditorComponent, WeEditorToolbarItem, weEditorSanitizeHtml } from 'we-editor-angular';
import { STUDIO_SAMPLE, STUDIO_TEXT, StudioLanguage, saveStudioLanguage, studioLanguage } from './studio-text';

type Tab = 'editor' | 'html' | 'start';
type Theme = 'light' | 'dark';

const THEME_KEY = 'we-editor-studio:theme';
const TABS: readonly Tab[] = ['editor', 'html', 'start'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WeEditorComponent, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  readonly lang: StudioLanguage = studioLanguage();
  readonly text = STUDIO_TEXT[this.lang];
  private readonly docKey = `we-editor-studio:doc-${this.lang}`;
  private readonly commentsKey = `we-editor-studio:comments-${this.lang}`;
  /** The default toolbar plus the review buttons: track changes and comments */
  readonly toolbar: WeEditorToolbarItem[] = [...WE_EDITOR_DEFAULT_TOOLBAR, '|', 'trackChanges', 'acceptChange', 'rejectChange', 'acceptAllChanges', 'rejectAllChanges', '|', 'comment', 'comments'];
  /** Comment threads live next to the document, not in its HTML — kept in this browser like the document */
  comments: WeEditorComment[] = this.readComments();
  readonly control = new FormControl(this.read(this.docKey) ?? STUDIO_SAMPLE[this.lang], { nonNullable: true });
  readonly = false;
  htmlDraft = this.text.htmlUnsafe;
  tab: Tab = 'editor';
  theme: Theme = 'light';

  /** The editor's autosave hook keeps the document in this browser. */
  readonly save = (html: string): void => this.write(this.docKey, html);

  readonly installSnippet = 'npm install we-editor-angular';
  readonly themeSnippet = '"styles": ["node_modules/we-editor-angular/styles/we-editor-theme.scss"]';
  readonly usageSnippet = `import { WeEditorComponent } from 'we-editor-angular';

@Component({
  standalone: true,
  imports: [WeEditorComponent, ReactiveFormsModule],
  template: \`<we-editor [formControl]="body" placeholder="Write something…" />\`
})
export class PostFormComponent {
  body = new FormControl('<p>Hello</p>', { nonNullable: true });
}`;
  readonly localeSnippet = `// app.config.ts — Turkish labels; pass your own object for any other language
providers: [{ provide: WE_EDITOR_LOCALE, useValue: weEditorLocaleTr }]`;

  ngOnInit(): void {
    // Screen readers and the editor's case rules (Turkish İ/ı) follow the page language.
    document.documentElement.lang = this.lang;
    const hash = location.hash.replace('#', '') as Tab;
    if (TABS.includes(hash)) this.tab = hash;
    const saved = this.read(THEME_KEY);
    this.theme = saved === 'dark' || saved === 'light' ? saved : matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    this.applyTheme();
  }

  select(tab: Tab): void {
    this.tab = tab;
    history.replaceState(null, '', `#${tab}`);
  }

  setLanguage(lang: StudioLanguage): void {
    if (lang === this.lang) return;
    saveStudioLanguage(lang);
    location.reload();
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    this.write(THEME_KEY, theme);
    this.applyTheme();
  }

  saveComments(list: WeEditorComment[]): void {
    this.comments = list;
    this.write(this.commentsKey, JSON.stringify(list));
  }

  resetExample(): void {
    this.comments = [];
    try {
      localStorage.removeItem(this.docKey);
      localStorage.removeItem(this.commentsKey);
    } catch {
      // storage blocked — nothing was saved either
    }
    this.control.setValue(STUDIO_SAMPLE[this.lang], { emitEvent: false });
  }

  loadHtml(): void {
    this.control.setValue(this.htmlDraft);
    this.save(this.htmlDraft);
    this.select('editor');
  }

  sanitized(): string {
    return weEditorSanitizeHtml(this.htmlDraft);
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // storage blocked — the choice lasts for this visit
    }
  }

  private readComments(): WeEditorComment[] {
    try {
      const list: unknown = JSON.parse(this.read(this.commentsKey) ?? '[]');
      // Stored data is checked, not trusted: only well-formed threads come back
      return Array.isArray(list)
        ? list.filter((c): c is WeEditorComment => !!c && typeof c === 'object' && typeof c.id === 'string' && typeof c.text === 'string' && typeof c.createdAt === 'string')
        : [];
    } catch {
      return [];
    }
  }
}
