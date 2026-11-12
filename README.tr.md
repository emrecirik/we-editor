# we-editor-angular

[![CI](https://github.com/emrecirik/we-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/emrecirik/we-editor/actions/workflows/ci.yml)
[![MIT Lisansı](https://img.shields.io/badge/lisans-MIT-blue.svg)](LICENSE)
[![Angular 18-22](https://img.shields.io/badge/Angular-18%20%E2%80%93%2022-dd0031.svg)](https://angular.dev)

[English](README.md)

Angular için ücretsiz, temalanabilir zengin metin editörü; [ProseMirror](https://prosemirror.net)
üzerine kurulu. CSS framework'ü, ikon fontu veya ticari bağımlılık yok.
[we-grid-angular](https://github.com/emrecirik/we-grid)'ın kardeş paketi.

> **Durum: 0.1.0 geliştiriliyor (F0).** Henüz npm'de değil. Yol haritası Word düzeyinde belgeler,
> hesap tablosu tabloları, tasarım/kod/bölünmüş HTML editörü ve mail-merge şablonlarına uzanıyor —
> bkz. [docs/ROADMAP.md](docs/ROADMAP.md).

## Özellikler (F0)

- `<we-editor>` standalone bileşeni; değeri HTML string olan bir **form kontrolü**
  (`formControlName`, `[formControl]`, `ngModel`); boşken `''` döner, `Validators.required` çalışır
- Kalın, italik, altı çizili, üstü çizili, alt simge, üst simge, satır içi kod
- Paragraf ve H1–H6 başlıklar, yazı tipi, yazı boyutu, yazı rengi, vurgu rengi
- Sola / ortaya / sağa hizalama, iki yana yaslama, girinti artır / azalt
- Madde işaretli, numaralı ve görev listeleri (Tab / Shift+Tab ile iç içe, tıklanabilir onay kutusu)
- Alıntı, kod bloğu, yatay çizgi, bağlantı ("yeni sekmede aç" seçeneğiyle), biçimlendirmeyi temizle
- Geri al / yinele, klavye kısayolları
- **Güvenli HTML giriş/çıkış:** belge şeması allowlist'tir — script, olay işleyicileri,
  `javascript:` bağlantıları ve güvensiz CSS değerleri atılır; editörsüz kullanım için
  `weEditorSanitizeHtml()` dışa açıktır
- CSS custom property ile açık/koyu tema; Türkçe ve İngilizce arayüz; satır içi SVG ikonlar

## Kurulum

```bash
npm install we-editor-angular
```

`angular.json` → `styles` içine varsayılan temayı ekleyin:

```json
"node_modules/we-editor-angular/styles/we-editor-theme.scss"
```

## Kullanım

```ts
import { WeEditorComponent, WE_EDITOR_LOCALE, weEditorLocaleTr } from 'we-editor-angular';

@Component({
  standalone: true,
  imports: [WeEditorComponent, ReactiveFormsModule],
  providers: [{ provide: WE_EDITOR_LOCALE, useValue: weEditorLocaleTr }],
  template: `<we-editor [formControl]="govde" />`
})
export class EpostaComponent {
  govde = new FormControl('<p>Merhaba</p>', { nonNullable: true });
}
```

## Dokümanlar

[API](docs/api.md) · [Tema](docs/theming.md) · [Yerelleştirme](docs/localization.md) ·
[Mimari](docs/ARCHITECTURE.md) · [Yol haritası](docs/ROADMAP.md) · [Lisanslar](docs/LICENSES.md)

## Lisans

MIT © Emre CIRIK.
