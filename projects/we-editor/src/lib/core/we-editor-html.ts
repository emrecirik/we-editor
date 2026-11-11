import { DOMParser as PmDOMParser, DOMSerializer, Node as PmNode, Schema } from 'prosemirror-model';

import { weEditorSchema } from './we-editor-schema';

/**
 * Parses an HTML string into a document of `schema`.
 *
 * The string is parsed with the browser's `DOMParser` into a detached, inert document — scripts do
 * not run and images do not load there, so `onerror=` style payloads never fire — and then mapped
 * onto the schema, which drops every element, attribute and style the schema does not know. The
 * live page's `innerHTML` is never touched.
 */
export function weEditorParseHtml(html: string | null | undefined, schema: Schema = weEditorSchema): PmNode {
  const doc = new DOMParser().parseFromString(html ?? '', 'text/html');
  return PmDOMParser.fromSchema(schema).parse(doc.body);
}

/**
 * Serializes a document back to HTML. Only schema-defined markup is produced. A document that is a
 * single empty paragraph serializes to `''`, so `Validators.required` works on the form control.
 */
export function weEditorSerializeHtml(doc: PmNode, schema: Schema = weEditorSchema): string {
  if (doc.childCount === 1 && doc.firstChild!.type === schema.topNodeType.contentMatch.defaultType && doc.firstChild!.content.size === 0) {
    return '';
  }
  const target = document.implementation.createHTMLDocument('');
  const container = target.createElement('div');
  container.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document: target }));
  return container.innerHTML;
}

/** Round-trips HTML through the schema: the allowlist sanitizer on its own, without an editor. */
export function weEditorSanitizeHtml(html: string | null | undefined, schema: Schema = weEditorSchema): string {
  return weEditorSerializeHtml(weEditorParseHtml(html, schema), schema);
}
