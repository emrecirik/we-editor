import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
  forwardRef,
  inject
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { redo, undo } from 'prosemirror-history';
import { Node as PmNode } from 'prosemirror-model';
import { Command, EditorState, TextSelection, Transaction } from 'prosemirror-state';
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  deleteColumn,
  deleteRow,
  deleteTable,
  isInTable,
  mergeCells,
  splitCell,
  toggleHeaderColumn,
  toggleHeaderRow
} from 'prosemirror-tables';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

import {
  WeEditorStyleMark,
  weEditorAlignAt,
  WeEditorImageAttrs,
  weEditorBlockLevel,
  weEditorImageAt,
  weEditorInsertTable,
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
  weEditorSetImage,
  weEditorSetLink,
  weEditorSetStyle,
  weEditorToggleCodeBlock,
  weEditorToggleList,
  weEditorToggleMark,
  weEditorToggleWrap
} from './core/we-editor-commands';
import { weEditorSerializeHtml } from './core/we-editor-html';
import { WeEditorImageView, WeEditorStats, WeEditorTaskItemView, weEditorCreateState, weEditorStats } from './core/we-editor-plugins';
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

/** A single empty paragraph — what a cleared editor holds. */
const isEmpty = (doc: PmNode): boolean =>
  doc.childCount === 1 && doc.firstChild!.type === s.nodes['paragraph'] && doc.firstChild!.content.size === 0;

// SVG is excluded: it can carry scripts and is rejected by weEditorSafeImageSrc anyway.
const isRasterImage = (file: File): boolean => /^image\/(png|jpe?g|gif|webp|avif)$/i.test(file.type);

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** Actions of the table tools bar, shown while the cursor is in a table. */
const TABLE_ACTIONS = {
  tableAddRowBefore: addRowBefore,
  tableAddRowAfter: addRowAfter,
  tableDeleteRow: deleteRow,
  tableAddColumnBefore: addColumnBefore,
  tableAddColumnAfter: addColumnAfter,
  tableDeleteColumn: deleteColumn,
  tableMergeCells: mergeCells,
  tableSplitCell: splitCell,
  tableToggleHeaderRow: toggleHeaderRow,
  tableToggleHeaderColumn: toggleHeaderColumn,
  tableDelete: deleteTable
} satisfies Partial<Record<keyof WeEditorLocale, Command>>;
type TableAction = keyof typeof TABLE_ACTIONS;

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
  image: WeEditorImageAttrs | null;
  inTable: boolean;
  table: Partial<Record<TableAction, boolean>>;
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

  /** Text shown while the document is empty. */
  @Input()
  set placeholder(value: string) {
    this._placeholder = value ?? '';
    this.view?.setProps({});
  }
  get placeholder(): string {
    return this._placeholder;
  }

  /**
   * Stores an image file (toolbar upload, paste, drop) and resolves to its URL. Without it, files are
   * embedded as base64 `data:` URLs — fine for small documents, heavy for large ones.
   */
  @Input() imageUpload: ((file: File) => Promise<string>) | null = null;

  /** Word and character counts after every edit (not on `writeValue`/`setHtml`; use `getStats()`). */
  @Output() readonly stats = new EventEmitter<WeEditorStats>();

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

  @ViewChild('tableInput')
  private set tableInput(ref: ElementRef<HTMLInputElement> | undefined) {
    ref?.nativeElement.focus();
  }

  @ViewChild('imageInput')
  private set imageInput(ref: ElementRef<HTMLInputElement> | undefined) {
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
  protected imageOpen = false;
  protected imageBusy = false;
  protected imageError: '' | 'invalid' | 'upload' = '';
  protected image: { url: string; alt: string; width: string; align: string } = { url: '', alt: '', width: '', align: '' };
  protected tableOpen = false;
  protected tableSize = { rows: 3, cols: 3, header: true };
  protected readonly tableActions = Object.keys(TABLE_ACTIONS) as TableAction[];
  protected ui: WeEditorUiState = { active: {}, enabled: {}, block: 0, fontFamily: '', fontSize: '', textColor: null, highlight: null, link: null, image: null, inTable: false, table: {} };

  private readonly icons = inject(WE_EDITOR_ICONS);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly iconCache = new Map<string, SafeHtml>();
  private view?: EditorView;
  private pendingHtml: string | null = null;
  private _readonly = false;
  private _placeholder = '';
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
      attributes: (): Record<string, string> => {
        const attrs: Record<string, string> = { class: 'we-editor__prosemirror', role: 'textbox', 'aria-multiline': 'true', 'aria-label': this.locale.content };
        if (this._placeholder) attrs['aria-placeholder'] = this._placeholder;
        return attrs;
      },
      // On the paragraph itself: CSS `attr()` reads the pseudo-element's own element.
      decorations: (state) =>
        this._placeholder && isEmpty(state.doc)
          ? DecorationSet.create(state.doc, [Decoration.node(0, state.doc.firstChild!.nodeSize, { class: 'we-editor__placeholder', 'data-placeholder': this._placeholder })])
          : null,
      nodeViews: {
        task_item: (node, view, getPos) => new WeEditorTaskItemView(node, view, getPos, this.locale.taskItemToggle),
        image: (node, view, getPos) => new WeEditorImageView(node, view, getPos)
      },
      handlePaste: (_view, event) => this.insertImageFiles(event.clipboardData?.files),
      handleDrop: (view, event) => {
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        return this.insertImageFiles(event.dataTransfer?.files, pos);
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

  /** Word and character counts of the current content. */
  getStats(): WeEditorStats {
    return this.view ? weEditorStats(this.view.state.doc) : { words: 0, characters: 0 };
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
    this.imageOpen = this.tableOpen = false;
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

  protected openImage(): void {
    if (!this.view || !this.isEditable()) return;
    const img = this.ui.image;
    this.image = { url: img?.src ?? '', alt: img?.alt ?? '', width: img?.width ? String(img.width) : '', align: img?.align ?? '' };
    this.imageError = '';
    this.linkOpen = this.tableOpen = false;
    this.imageOpen = true;
  }

  protected applyImage(event?: Event): void {
    event?.preventDefault();
    const { url, alt, width, align } = this.image;
    const attrs: WeEditorImageAttrs = { src: url, alt, width: Number(width) || null, align: (align || null) as WeEditorImageAttrs['align'] };
    if (!this.exec(weEditorSetImage(attrs))) {
      this.imageError = 'invalid';
      return;
    }
    this.closeImage();
  }

  protected closeImage(): void {
    this.imageOpen = false;
    this.imageError = '';
    this.view?.focus();
  }

  /** File chosen in the image bar: upload it and put its URL in the address field. */
  protected async pickImageFile(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const url = await this.storeImage(file);
    if (url) this.image = { ...this.image, url };
    this.cdr.markForCheck();
  }

  protected openTable(): void {
    if (!this.view || !this.isEditable()) return;
    this.linkOpen = this.imageOpen = false;
    this.tableOpen = true;
  }

  protected insertTable(event?: Event): void {
    event?.preventDefault();
    const { rows, cols, header } = this.tableSize;
    if (this.exec(weEditorInsertTable(rows, cols, header))) this.tableOpen = false;
  }

  protected closeTable(): void {
    this.tableOpen = false;
    this.view?.focus();
  }

  protected runTable(action: TableAction): void {
    this.exec(TABLE_ACTIONS[action]);
  }

  // ── Internals ───────────────────────────────────────────────────────

  /** Pasted or dropped image files: stored, then inserted at `pos` (or the selection). */
  private insertImageFiles(files: FileList | undefined, pos?: number): boolean {
    const images = Array.from(files ?? []).filter(isRasterImage);
    if (!images.length || !this.isEditable()) return false;
    void (async () => {
      for (const file of images) {
        const src = await this.storeImage(file);
        if (!src || !this.view) continue;
        const { state } = this.view;
        if (pos != null && pos <= state.doc.content.size) this.view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, pos)));
        if (!this.exec(weEditorSetImage({ src }))) this.showImageError('invalid');
        pos = undefined;
      }
    })();
    return true;
  }

  private async storeImage(file: File): Promise<string | null> {
    if (!isRasterImage(file)) {
      this.showImageError('upload');
      return null;
    }
    this.imageBusy = true;
    this.cdr.markForCheck();
    try {
      return this.imageUpload ? await this.imageUpload(file) : await readAsDataUrl(file);
    } catch (error) {
      console.error('we-editor: image upload failed', error);
      this.showImageError('upload');
      return null;
    } finally {
      this.imageBusy = false;
      this.cdr.markForCheck();
    }
  }

  private showImageError(kind: 'invalid' | 'upload'): void {
    if (!this.imageOpen) this.openImage();
    this.imageError = kind;
    this.cdr.markForCheck();
  }

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
    if (tr.docChanged) {
      this.onChange(this.getHtml());
      this.stats.emit(this.getStats());
    }
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
    const inTable = isInTable(state);
    const table: WeEditorUiState['table'] = {};
    if (inTable) for (const a of this.tableActions) table[a] = editable && TABLE_ACTIONS[a](state);
    active.table = inTable;
    enabled.table = editable;
    const image = weEditorImageAt(state);
    active.image = !!image;
    enabled.image = editable;
    this.ui = {
      active,
      enabled,
      block: weEditorBlockLevel(state),
      fontFamily: weEditorMarkAt(state, s.marks['font_family'])?.attrs['value'] ?? '',
      fontSize: weEditorMarkAt(state, s.marks['font_size'])?.attrs['value'] ?? '',
      textColor: weEditorMarkAt(state, s.marks['text_color'])?.attrs['value'] ?? null,
      highlight: weEditorMarkAt(state, s.marks['highlight'])?.attrs['value'] ?? null,
      link: weEditorLinkAt(state),
      image,
      inTable,
      table
    };
    this.cdr.markForCheck();
  }
}
