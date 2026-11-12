# Localization

Every string the editor renders is a key of `WeEditorLocale`. English (`weEditorLocaleEn`) is the
default; Turkish (`weEditorLocaleTr`), German (`weEditorLocaleDe`), French (`weEditorLocaleFr`) and
Spanish (`weEditorLocaleEs`) ship too.

```ts
import { WE_EDITOR_LOCALE, weEditorLocaleTr } from 'we-editor-angular';

providers: [{ provide: WE_EDITOR_LOCALE, useValue: weEditorLocaleTr }]
```

Partial overrides: `{ ...weEditorLocaleEn, bold: 'Strong' }`. The token is resolved per component
injector, so different editors on one page can use different languages (put the provider on a
wrapping component).

## Keys

`toolbar`, `content`, `undo`, `redo`, `blockType`, `paragraph`, `heading` (rendered as
`heading + ' ' + level`), `fontFamily`, `fontFamilyDefault`, `fontSize`, `fontSizeDefault`, `bold`,
`italic`, `underline`, `strike`, `subscript`, `superscript`, `code`, `textColor`, `highlight`,
`alignLeft`, `alignCenter`, `alignRight`, `alignJustify`, `bulletList`, `orderedList`, `taskList`,
`taskItemToggle`, `indent`, `outdent`, `blockquote`, `codeBlock`, `horizontalRule`, `link`,
`unlink`, `linkUrl`, `linkUrlPlaceholder`, `linkNewTab`, `linkApply`, `linkCancel`, `linkInvalid`,
`clearFormatting`, `image`, `imageUrl`, `imageUrlPlaceholder`, `imageUpload`, `imageAlt`,
`imageAltPlaceholder`, `imageWidth`, `imageAlign`, `imageAlignInline`, `imageAlignLeft`,
`imageAlignCenter`, `imageAlignRight`, `imageApply`, `imageCancel`, `imageInvalid`,
`imageUploadFailed`, `table`, `tableRows`, `tableColumns`, `tableHeaderRow`, `tableInsert`,
`tableCancel`, `tableTools`, `tableAddRowBefore`, `tableAddRowAfter`, `tableDeleteRow`,
`tableAddColumnBefore`, `tableAddColumnAfter`, `tableDeleteColumn`, `tableMergeCells`,
`tableSplitCell`, `tableToggleHeaderRow`, `tableToggleHeaderColumn`, `tableDelete`, `findReplace`,
`findPlaceholder`, `replacePlaceholder`, `findCaseSensitive`, `findWholeWord`, `findPrevious`,
`findNext`, `replaceOne`, `replaceAll`, `findClose`, `findCount` (`{current}` and `{total}` are
replaced), `findNoResults`, `media`, `mediaUrl`, `mediaUrlPlaceholder`, `mediaInsert`, `mediaCancel`,
`mediaInvalid`, `colorRemove`, `colorCustom`, `colorRecent`, `specialChars`, `codeLanguage`, `codeLanguagePlain`, `source`, `sourceCode`, `sourceSplit`, `sourceFormat`, `lineHeight`, `lineHeightDefault`, `textCase`, `caseUpper`, `caseLower`,
`caseTitle`, `caseSentence`, `formatPainter`, `fullscreen`, `statusPath`, `statusWords`, `statusCharacters`,
`autosaveSaving`, `autosaveSaved`, `autosaveFailed`.

Adding a key: interface + every shipped locale (En, Tr, De, Fr, Es) in the same change (specs fail
when a shipped locale misses a key), and a line here. A new key is a breaking change for
consumers with a hand-written full locale object — say so in the changelog.
