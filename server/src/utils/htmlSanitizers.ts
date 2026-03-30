import sanitizeHtml from 'sanitize-html';

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{3,6}$/;
const SAFE_LINK_SCHEMES = ['http', 'https', 'mailto'];

export const sanitizeCommentHtml = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3',
      'ul', 'ol', 'li', 'a', 'span',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      span: ['style'],
    },
    allowedStyles: {
      '*': {
        color: [HEX_COLOR_PATTERN],
        'background-color': [HEX_COLOR_PATTERN],
      },
    },
    allowedSchemes: SAFE_LINK_SCHEMES,
    allowedSchemesByTag: {
      a: SAFE_LINK_SCHEMES,
    },
    transformTags: {
      a: (tagName, attribs) => {
        const nextAttribs: Record<string, string> = {
          ...attribs,
          rel: 'noopener noreferrer nofollow',
        };

        if (attribs.target !== '_blank') {
          delete nextAttribs.target;
        }

        return { tagName, attribs: nextAttribs };
      },
    },
  });

export const stripHtmlToPlainText = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
