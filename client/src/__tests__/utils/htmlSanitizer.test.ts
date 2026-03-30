import { extractPlainTextFromHtml, sanitizeCommentHtmlForDisplay } from '@/utils/htmlSanitizer';

describe('htmlSanitizer', () => {
  it('comments icin tehlikeli tag ve attribute temizlemeli', () => {
    const sanitized = sanitizeCommentHtmlForDisplay(
      '<p onclick="alert(1)">Merhaba</p><script>alert(1)</script><img src=x onerror=alert(1) />'
    );

    expect(sanitized).toContain('<p>Merhaba</p>');
    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('onclick');
    expect(sanitized).not.toContain('<img');
  });

  it('unsafe href degerlerini kaldirip guvenli linkleri korumali', () => {
    const sanitized = sanitizeCommentHtmlForDisplay(
      '<a href="javascript:alert(1)" target="_blank">kotu</a><a href="https://example.com" target="_blank">iyi</a>'
    );

    expect(sanitized).not.toContain('javascript:');
    expect(sanitized).toContain('href="https://example.com"');
    expect(sanitized).toContain('rel="noopener noreferrer nofollow"');
  });

  it('html iceriginden plain text cikarmali', () => {
    expect(extractPlainTextFromHtml('<p>Merhaba <strong>dunya</strong></p>')).toBe('Merhaba dunya');
  });
});
