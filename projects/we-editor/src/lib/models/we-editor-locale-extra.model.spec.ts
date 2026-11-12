import { weEditorLocaleEn } from './we-editor-locale.model';
import { weEditorLocaleDe, weEditorLocaleEs, weEditorLocaleFr } from './we-editor-locale-extra.model';

describe('extra locales', () => {
  for (const [name, locale] of Object.entries({ de: weEditorLocaleDe, fr: weEditorLocaleFr, es: weEditorLocaleEs })) {
    it(`${name} has every key of weEditorLocaleEn, filled, with the same placeholders`, () => {
      expect(Object.keys(locale).sort()).toEqual(Object.keys(weEditorLocaleEn).sort());
      for (const [key, en] of Object.entries(weEditorLocaleEn)) {
        const text = (locale as unknown as Record<string, string>)[key];
        expect(text).withContext(key).toBeTruthy();
        expect(text.match(/\{\w+\}/g)?.sort()).withContext(key).toEqual(en.match(/\{\w+\}/g)?.sort());
      }
    });
  }
});
