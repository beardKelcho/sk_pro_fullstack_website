import { sanitizeCommentHtml, stripHtmlToPlainText } from '../../utils/htmlSanitizers';

describe('htmlSanitizers', () => {
  it('script taglerini ve unsafe linkleri temizlemeli', () => {
    const sanitized = sanitizeCommentHtml(
      '<p>Merhaba</p><script>alert(1)</script><a href="javascript:alert(1)" target="_blank">kotu</a>'
    );

    expect(sanitized).toContain('<p>Merhaba</p>');
    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('javascript:');
  });

  it('guvenli linklerde rel attribute zorlamali', () => {
    const sanitized = sanitizeCommentHtml('<a href="https://example.com" target="_blank">ornek</a>');

    expect(sanitized).toContain('href="https://example.com"');
    expect(sanitized).toContain('rel="noopener noreferrer nofollow"');
    expect(sanitized).toContain('target="_blank"');
  });

  it('html icerigini plain texte cevirmeli', () => {
    expect(stripHtmlToPlainText('<p>Merhaba <strong>dunya</strong></p>')).toBe('Merhaba dunya');
  });
});
