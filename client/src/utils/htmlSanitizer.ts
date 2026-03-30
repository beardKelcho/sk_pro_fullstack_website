const ALLOWED_COMMENT_TAGS = new Set([
  'A',
  'BR',
  'EM',
  'H1',
  'H2',
  'H3',
  'LI',
  'OL',
  'P',
  'S',
  'SPAN',
  'STRONG',
  'U',
  'UL',
]);

const BLOCKED_TAGS = new Set([
  'BUTTON',
  'EMBED',
  'FORM',
  'IFRAME',
  'INPUT',
  'LINK',
  'META',
  'OBJECT',
  'SCRIPT',
  'SELECT',
  'STYLE',
  'TEXTAREA',
]);

const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const SAFE_STYLE_PATTERN = /^#[0-9a-fA-F]{3,6}$/;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const createDocument = (html: string): Document | null => {
  if (typeof DOMParser === 'undefined') {
    return null;
  }

  return new DOMParser().parseFromString(html, 'text/html');
};

const unwrapElement = (element: Element) => {
  const parent = element.parentNode;
  if (!parent) return;

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }

  parent.removeChild(element);
};

const sanitizeStyle = (value: string): string | null => {
  const safeDeclarations = value
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const [property, rawValue] = declaration.split(':');
      const normalizedProperty = property?.trim().toLowerCase();
      const normalizedValue = rawValue?.trim();

      if (!normalizedProperty || !normalizedValue) {
        return null;
      }

      if (
        (normalizedProperty === 'color' || normalizedProperty === 'background-color') &&
        SAFE_STYLE_PATTERN.test(normalizedValue)
      ) {
        return `${normalizedProperty}: ${normalizedValue}`;
      }

      return null;
    })
    .filter((declaration): declaration is string => Boolean(declaration));

  return safeDeclarations.length > 0 ? safeDeclarations.join('; ') : null;
};

export const extractPlainTextFromHtml = (html: string): string => {
  if (!html) return '';

  const doc = createDocument(html);
  if (!doc) {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};

export const sanitizeCommentHtmlForDisplay = (html: string): string => {
  if (!html) return '';

  const doc = createDocument(html);
  if (!doc) {
    return escapeHtml(html);
  }

  const elements = Array.from(doc.body.querySelectorAll('*')).reverse();

  for (const element of elements) {
    const tagName = element.tagName.toUpperCase();

    if (BLOCKED_TAGS.has(tagName)) {
      element.remove();
      continue;
    }

    if (!ALLOWED_COMMENT_TAGS.has(tagName)) {
      unwrapElement(element);
      continue;
    }

    const attributes = Array.from(element.attributes);
    for (const attribute of attributes) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value;

      if (name.startsWith('on')) {
        element.removeAttribute(attribute.name);
        continue;
      }

      if (tagName === 'A') {
        if (name === 'href') {
          try {
            const url = new URL(value, 'https://skpro.local');
            if (!SAFE_LINK_PROTOCOLS.has(url.protocol)) {
              element.removeAttribute(attribute.name);
            }
          } catch {
            element.removeAttribute(attribute.name);
          }
          continue;
        }

        if (name === 'target') {
          if (value !== '_blank') {
            element.removeAttribute(attribute.name);
          }
          continue;
        }

        element.removeAttribute(attribute.name);
        continue;
      }

      if (tagName === 'SPAN' && name === 'style') {
        const safeStyle = sanitizeStyle(value);
        if (safeStyle) {
          element.setAttribute('style', safeStyle);
        } else {
          element.removeAttribute('style');
        }
        continue;
      }

      element.removeAttribute(attribute.name);
    }

    if (tagName === 'A') {
      element.setAttribute('rel', 'noopener noreferrer nofollow');
      if (element.getAttribute('target') !== '_blank') {
        element.removeAttribute('target');
      }
    }
  }

  return doc.body.innerHTML;
};
