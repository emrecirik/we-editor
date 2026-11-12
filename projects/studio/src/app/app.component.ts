import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { WeEditorComponent, WeEditorStats, weEditorSanitizeHtml } from 'we-editor-angular';
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
  readonly control = new FormControl(this.read(this.docKey) ?? STUDIO_SAMPLE[this.lang], { nonNullable: true });
  stats: WeEditorStats | null = null;
  readonly = false;
  htmlDraft = this.text.htmlUnsafe;
  tab: Tab = 'editor';
  theme: Theme = 'light';

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

  constructor() {
    this.control.valueChanges.subscribe((html) => this.write(this.docKey, html));
  }

  ngOnInit(): void {
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

  resetExample(): void {
    try {
      localStorage.removeItem(this.docKey);
    } catch {
      // storage blocked — nothing was saved either
    }
    this.control.setValue(STUDIO_SAMPLE[this.lang], { emitEvent: false });
  }

  loadHtml(): void {
    this.control.setValue(this.htmlDraft);
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
}
