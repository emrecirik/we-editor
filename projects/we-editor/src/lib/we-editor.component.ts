import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  forwardRef,
  inject
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { redo, undo } from 'prosemirror-history';
import { Command, EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import {
  WeEditorStyleMark,
  weEditorAlignAt,
  weEditorBlockLevel,
  weEditorClearFormatting,
  weEditorIndent,
  weEditorInsertHorizontalRule,
  weEditorLinkAt,
  weEditorListAt,
  weEditorMarkActive,
  weEditorMarkAt,
  weEditorOutdent,
  weEditorRemoveLink,
  weEditorSetAlign,
  weEditorSetBlock,
  weEditorSetLink,
  weEditorSetStyle,
  weEditorToggleCodeBlock,
  weEditorToggleList,
  weEditorToggleMark,
  weEditorToggleWrap
} from './core/we-editor-commands';
import { weEditorSerializeHtml } from './core/we-editor-html';
import { WeEditorTaskItemView, weEditorCreateState } from './core/we-editor-plugins';
import { weEditorSchema } from './core/we-editor-schema';
import { WE_EDITOR_ICONS } from './models/we-editor-icons.model';
import { WE_EDITOR_LOCALE, WeEditorLocale } from './models/we-editor-locale.model';
import {
  WE_EDITOR_DEFAULT_FONT_FAMILIES,
  WE_EDITOR_DEFAULT_FONT_SIZES,
  WE_EDITOR_DEFAULT_TOOLBAR,
  WeEditorOption,
  WeEditorToolbarItem
} from './models/we-editor-toolbar.model';

const s = weEditorSchema;

interface ButtonDef {
  icon: string;
  label: keyof WeEditorLocale;
  run: Command;
  /** Toggle buttons expose `aria-pressed`. */
  active?: (state: EditorState) => boolean;
}

const mark = (name: string): Pick<ButtonDef, 'run' | 'active'> => ({
  run: weEditorToggleMark(s.marks[name]),
  active: (state) => weEditorMarkActive(state, s.marks[name])
});

const inside = (state: EditorState, name: string): boolean => {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) if ($from.node(d).type === s.nodes[name]) return true;
  return false;
};

const BUTTONS: Partial<Record<WeEditorToolbarItem, ButtonDef>> = {
  undo: { icon: 'undo', label: 'undo', run: undo },
  redo: { icon: 'redo', label: 'redo', run: redo },
  bold: { icon: 'bold', label: 'bold', ...mark('bold') },
  italic: { icon: 'italic', label: 'italic', ...mark('italic') },
  underline: { icon: 'underline', label: 'underline', ...mark('underline') },
  strike: { icon: 'strike', label: 'strike', ...mark('strike') },
  subscript: { icon: 'subscript', label: 'subscript', ...mark('subscript') },
  superscript: { icon: 'superscript', label: 'superscript', ...mark('superscript') },
  code: { icon: 'code', label: 'code', ...mark('code') },
  alignLeft: { icon: 'alignLeft', label: 'alignLeft', run: weEditorSetAlign('left'), active: (st) => weEditorAlignAt(st) === 'left' },
  alignCenter: { icon: 'alignCenter', label: 'alignCenter', run: weEditorSetAlign('center'), active: (st) => weEditorAlignAt(st) === 'center' },
  alignRight: { icon: 'alignRight', label: 'alignRight', run: weEditorSetAlign('right'), active: (st) => weEditorAlignAt(st) === 'right' },
  alignJustify: { icon: 'alignJustify', label: 'alignJustify', run: weEditorSetAlign('justify'), active: (st) => weEditorAlignAt(st) === 'justify' },
  bulletList: { icon: 'bulletList', label: 'bulletList', run: weEditorToggleList('bullet_list'), active: (st) => weEditorListAt(st) === 'bullet_list' },
  orderedList: { icon: 'orderedList', label: 'orderedList', run: weEditorToggleList('ordered_list'), active: (st) => weEditorListAt(st) === 'ordered_list' },
  taskList: { icon: 'taskList', label: 'taskList', run: weEditorToggleList('task_list'), active: (st) => weEditorListAt(st) === 'task_list' },
  outdent: { icon: 'outdent', label: 'outdent', run: weEditorOutdent },
  indent: { icon: 'indent', label: 'indent', run: weEditorIndent },
  blockquote: { icon: 'blockquote', label: 'blockquote', run: weEditorToggleWrap(s.nodes['blockquote']), active: (st) => inside(st, 'blockquote') },
  codeBlock: { icon: 'codeBlock', label: 'codeBlock', run: weEditorToggleCodeBlock, active: (st) => st.selection.$from.parent.type === s.nodes['code_block'] },
  horizontalRule: { icon: 'horizontalRule', label: 'horizontalRule', run: weEditorInsertHorizontalRule },
  unlink: { icon: 'unlink', label: 'unlink', run: weEditorRemoveLink },
  clearFormatting: { icon: 'clearFormatting', label: 'clearFormatting', run: weEditorClearFormatting }
};

/** Toolbar state recomputed after every transaction. */
interface WeEditorUiState {
  active: Partial<Record<WeEditorToolbarItem, boolean>>;
  enabled: Partial<Record<WeEditorToolbarItem, boolean>>;
  block: number;
  fontFamily: string;
  fontSize: string;
  textColor: string | null;
  highlight: string | null;
  link: string | null;
}

/**
 * A rich-text editor on ProseMirror. Works as a form control (`formControlName`, `[formControl]`,
 * `ngModel`): the value is an HTML string, sanitized through the editor schema on the way in and
 * produced from it on the way out.
 */
@Component({
  selector: 'we-editor',
  standalone: true,
  templateUrl: './we-editor.component.html',
  styleUrl: './we-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ProseMirror renders the content DOM itself, outside Angular's emulated encapsulation; every rule is
  // scoped under `.we-editor` instead.
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => WeEditorComponent), multi: true }]
})
export class WeEditorComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
  /** Toolbar entries in display order; `[]` hides the toolbar. */
  @Input() toolbar: readonly WeEditorToolbarItem[] = WE_EDITOR_DEFAULT_TOOLBAR;
  @Input() fontFamilies: readonly WeEditorOption[] = WE_EDITOR_DEFAULT_FONT_FAMILIES;
  @Input() fontSizes: readonly WeEditorOption[] = WE_EDITOR_DEFAULT_FONT_SIZES;

  @Input()
  set readonly(value: boolean) {
    this._readonly = value;
    this.updateEditable();
  }
  get readonly(): boolean {
    return this._readonly;
  }

  @ViewChild('content', { static: true }) private readonly contentRef!: ElementRef<HTMLElement>;

  @ViewChild('linkInput')
  private set linkInput(ref: ElementRef<HTMLInputElement> | undefined) {
    ref?.nativeElement.focus();
  }

  protected readonly locale = inject(WE_EDITOR_LOCALE);
  protected readonly headingLevels = [1, 2, 3, 4, 5, 6];
  protected disabled = false;
  protected focused = false;
  protected linkOpen = false;
  protected linkUrl = '';
  protected linkNewTab = false;
  protected linkError = false;
  protected ui: WeEditorUiState = { active: {}, enabled: {}, block: 0, fontFamily: '', fontSize: '', textColor: null, highlight: null, link: null };

  private readonly icons = inject(WE_EDITOR_ICONS);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly iconCache = new Map<string, SafeHtml>();
  private view?: EditorView;
  private pendingHtml: string | null = null;
  private _readonly = false;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  /** The underlying ProseMirror view, for advanced integrations. Undefined before init. */
  get editorView(): EditorView | undefined {
    return this.view;
  }

  ngOnInit(): void {
    this.view = new EditorView(this.contentRef.nativeElement, {
      state: weEditorCreateState(this.pendingHtml),
      editable: () => !this.disabled && !this._readonly,
      attributes: { class: 'we-editor__prosemirror', role: 'textbox', 'aria-multiline': 'true', 'aria-label': this.locale.content },
      nodeViews: {
        task_item: (node, view, getPos) => new WeEditorTaskItemView(node, view, getPos, this.locale.taskItemToggle)
      },
      dispatchTransaction: (tr) => this.apply(tr),
      handleDOMEvents: {
        focus: () => this.setFocused(true),
        blur: () => {
          this.setFocused(false);
          this.onTouched();
          return false;
        }
      }
    });
    this.pendingHtml = null;
    this.refreshUi();
  }

  ngOnChanges(): void {
    this.refreshUi();
  }

  ngOnDestroy(): void {
    this.view?.destroy();
  }

  /** Current content as sanitized HTML (`''` when empty). */
  getHtml(): string {
    return this.view ? weEditorSerializeHtml(this.view.state.doc) : this.pendingHtml ?? '';
  }

  /** Replaces the content (and resets undo history) without emitting a change. */
  setHtml(html: string | null | undefined): void {
    if (!this.view) {
      this.pendingHtml = html ?? '';
      return;
    }
    this.view.updateState(weEditorCreateState(html));
    this.refreshUi();
  }

  focus(): void {
    this.view?.focus();
  }

  // ── ControlValueAccessor ────────────────────────────────────────────

  writeValue(value: string | null): void {
    this.setHtml(value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.updateEditable();
    this.cdr.markForCheck();
  }

  // ── Template API ────────────────────────────────────────────────────

  protected button(item: WeEditorToolbarItem): ButtonDef | undefined {
    return BUTTONS[item];
  }

  protected icon(key: string): SafeHtml {
    let html = this.iconCache.get(key);
    // Icons are developer-provided configuration (WE_EDITOR_ICONS), never document content.
    if (!html) this.iconCache.set(key, (html = this.sanitizer.bypassSecurityTrustHtml(this.icons[key] ?? '')));
    return html;
  }

  protected run(item: WeEditorToolbarItem): void {
    const def = BUTTONS[item];
    if (def) this.exec(def.run);
  }

  protected setBlock(value: string): void {
    this.exec(weEditorSetBlock(Number(value)));
  }

  protected setStyle(markName: WeEditorStyleMark, value: string): void {
    this.exec(weEditorSetStyle(markName, value || null));
  }

  /** Keeps the editor's selection when a toolbar button is pressed. Selects and inputs still get focus. */
  protected onToolbarMouseDown(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button')) event.preventDefault();
  }

  protected openLink(): void {
    if (!this.view || !this.isEditable()) return;
    this.linkUrl = this.ui.link ?? '';
    this.linkNewTab = false;
    this.linkError = false;
    this.linkOpen = true;
  }

  protected applyLink(event?: Event): void {
    event?.preventDefault();
    const url = this.linkUrl.trim();
    if (!url) {
      this.exec(weEditorRemoveLink);
      this.closeLink();
      return;
    }
    if (!this.exec(weEditorSetLink(url, this.linkNewTab ? '_blank' : null))) {
      this.linkError = true;
      return;
    }
    this.closeLink();
  }

  protected closeLink(): void {
    this.linkOpen = false;
    this.linkError = false;
    this.view?.focus();
  }

  // ── Internals ───────────────────────────────────────────────────────

  private exec(command: Command): boolean {
    if (!this.view || !this.isEditable()) return false;
    const done = command(this.view.state, this.view.dispatch, this.view);
    this.view.focus();
    return done;
  }

  private apply(tr: Transaction): void {
    if (!this.view) return;
    this.view.updateState(this.view.state.apply(tr));
    // shortcut: serializes the whole document on every change; debounce if very large documents get slow.
    if (tr.docChanged) this.onChange(this.getHtml());
    this.refreshUi();
  }

  private isEditable(): boolean {
    return !this.disabled && !this._readonly;
  }

  private updateEditable(): void {
    // Re-evaluates the `editable` prop function.
    this.view?.setProps({});
    this.refreshUi();
  }

  private setFocused(value: boolean): boolean {
    this.focused = value;
    this.cdr.markForCheck();
    return false;
  }

  private refreshUi(): void {
    const view = this.view;
    if (!view) return;
    const state = view.state;
    const editable = this.isEditable();
    const active: WeEditorUiState['active'] = {};
    const enabled: WeEditorUiState['enabled'] = {};
    for (const item of this.toolbar) {
      const def = BUTTONS[item];
      if (!def) continue;
      enabled[item] = editable && def.run(state, undefined, view);
      if (def.active) active[item] = def.active(state);
    }
    active.link = weEditorMarkActive(state, s.marks['link']);
    enabled.link = editable;
    this.ui = {
      active,
      enabled,
      block: weEditorBlockLevel(state),
      fontFamily: weEditorMarkAt(state, s.marks['font_family'])?.attrs['value'] ?? '',
      fontSize: weEditorMarkAt(state, s.marks['font_size'])?.attrs['value'] ?? '',
      textColor: weEditorMarkAt(state, s.marks['text_color'])?.attrs['value'] ?? null,
      highlight: weEditorMarkAt(state, s.marks['highlight'])?.attrs['value'] ?? null,
      link: weEditorLinkAt(state)
    };
    this.cdr.markForCheck();
  }
}
