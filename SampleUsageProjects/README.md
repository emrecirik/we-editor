# Sample usage projects

Realistic apps that use `we-editor-angular` the way consumers will, mirroring we-grid's
`SampleUsageProjects/`. Each becomes an Angular application registered in `angular.json`
(`start:<name>` script) and is built by CI. All sample content is fictional.

| Folder | Shows | Needs roadmap items |
|---|---|---|
| `email-template-designer/` | Designing a marketing/notification e-mail: blocks, variables (`{{customer.name}}`), e-mail-safe HTML output, preview in device widths | F3.3, F3.6, F3.8, F4.1 |
| `document-editor/` | A Word-like letter/contract editor: page view, tables, images, page breaks, print/PDF, find/replace | F1.1–F1.7 |
| `cms-page-builder/` | A CMS page editor: Design / Code / Split views, element inspector, DOM path bar, drag-and-drop sections | F3.1–F3.7 |

Status: empty folders (planned). Start one only when the features it needs exist; until then the
`projects/playground` app is the demo.
