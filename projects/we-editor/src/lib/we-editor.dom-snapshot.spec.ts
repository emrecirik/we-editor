import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { WE_EDITOR_DOM_BASELINE } from './testing/we-editor-dom-baseline';
import { WeEditorComponent } from './we-editor.component';

@Component({
  standalone: true,
  imports: [WeEditorComponent],
  template: `<we-editor />`
})
class DefaultHostComponent {}

/** Comparable markup: Angular's generated attributes and comments removed. */
function normalize(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;
  return clone.innerHTML
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s(_ngcontent|_nghost|ng-reflect)[\w-]*="[^"]*"/g, '')
    .replace(/\s(_ngcontent|_nghost)[\w-]*(?=[\s>])/g, '')
    .replace(/>\s+</g, '><')
    .trim();
}

// Guards the default markup. When a markup change is deliberate, run the tests, copy the "actual"
// value printed by the failure into testing/we-editor-dom-baseline.ts, and say so in the changelog.
describe('WeEditorComponent DOM baseline', () => {
  it('renders the default toolbar and content markup unchanged', () => {
    const fixture = TestBed.createComponent(DefaultHostComponent);
    fixture.detectChanges();
    const actual = normalize(fixture.nativeElement as HTMLElement);
    expect(actual).withContext(`actual:\n${JSON.stringify(actual)}`).toBe(WE_EDITOR_DOM_BASELINE['default']);
  });
});
