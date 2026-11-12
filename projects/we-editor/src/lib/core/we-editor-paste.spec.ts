import { weEditorSanitizeHtml } from './we-editor-html';
import { weEditorCleanOfficeHtml } from './we-editor-paste';

/** Clean, then pass through the schema — what the editor ends up with. */
const paste = (html: string): string => weEditorSanitizeHtml(weEditorCleanOfficeHtml(html));

const WORD = `<html xmlns:o="urn:schemas-microsoft-com:office:office"><head><style>p.MsoNormal{font-family:Calibri}</style></head><body>
<!--StartFragment-->
<p class=MsoNormal style='margin-bottom:8.0pt;line-height:107%'><span style='font-family:"Calibri",sans-serif;font-size:11.0pt;color:black'>Plain <b>bold</b> and <span style='color:#C00000'>red</span></span><o:p></o:p></p>
<p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'><span style='font-family:Symbol;mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp; </span></span>One</p>
<p class=MsoListParagraphCxSpMiddle style='margin-left:72.0pt;mso-list:l0 level2 lfo1'><span style='font-family:"Courier New";mso-list:Ignore'>o<span>&nbsp; </span></span>One A</p>
<p class=MsoListParagraphCxSpLast style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'><span style='mso-list:Ignore'>·<span>&nbsp;</span></span>Two</p>
<p class=MsoNormal>Between</p>
<p class=MsoListParagraph style='mso-list:l1 level1 lfo2'><span style='mso-list:Ignore'>1.<span>&nbsp;</span></span>First</p>
<p class=MsoListParagraph style='mso-list:l1 level1 lfo2'><span style='mso-list:Ignore'>2.<span>&nbsp;</span></span>Second</p>
<!--EndFragment--></body></html>`;

const DOCS =
  '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-1a2b"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;">' +
  '<span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:700;font-style:normal;text-decoration:none;vertical-align:baseline;">Bold</span>' +
  '<span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:italic;">italic</span>' +
  '<span style="font-size:11pt;font-family:Arial,sans-serif;color:#1155cc;text-decoration:underline;"> link-ish</span></p></b>';

describe('weEditorCleanOfficeHtml', () => {
  it('turns Word marker paragraphs into nested bullet and numbered lists', () => {
    expect(paste(WORD)).toBe(
      '<p>Plain <strong>bold</strong> and <span style="color: rgb(192, 0, 0);">red</span></p>' +
        '<ul><li><p>One</p><ul><li><p>One A</p></li></ul></li><li><p>Two</p></li></ul>' +
        '<p>Between</p>' +
        '<ol><li><p>First</p></li><li><p>Second</p></li></ol>'
    );
  });

  it('drops Google Docs font, size, spacing and default-colour noise but keeps real formatting', () => {
    expect(paste(DOCS)).toBe('<p><strong>Bold</strong><em>italic</em><u><span style="color: rgb(17, 85, 204);"> link-ish</span></u></p>');
  });

  it('leaves other HTML untouched', () => {
    const html = '<p style="line-height: 2; font-size: 18px">mine</p>';
    expect(weEditorCleanOfficeHtml(html)).toBe(html);
  });
});
