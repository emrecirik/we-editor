import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { WE_EDITOR_LOCALE, weEditorLocaleEn, weEditorLocaleTr } from 'we-editor-angular';
import { studioLanguage } from './studio-text';

// The editor reads its locale once, when it is created — the language switch saves the choice and reloads
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: WE_EDITOR_LOCALE, useFactory: () => (studioLanguage() === 'tr' ? weEditorLocaleTr : weEditorLocaleEn) }
  ]
};
