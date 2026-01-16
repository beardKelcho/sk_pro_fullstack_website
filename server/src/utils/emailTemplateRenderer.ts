import EmailTemplate from '../models/EmailTemplate';
import logger from './logger';

type RenderInput = {
  key: string;
  locale?: string;
  variantName?: string;
  data?: Record<string, any>;
};

type RenderOutput = {
  subject: string;
  html: string;
  used: {
    templateKey: string;
    variantName: string;
    locale: string;
  };
};

const escapeHtml = (value: any): string => {
  const str = value === null || value === undefined ? '' : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const getByPath = (obj: any, path: string): any => {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.').filter(Boolean);
  let cur: any = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) {
      cur = cur[p];
    } else {
      return undefined;
    }
  }
  return cur;
};

const pickVariant = (variants: Array<{ name: string; weight?: number }>, variantName?: string) => {
  if (variantName) {
    const found = variants.find((v) => v.name === variantName);
    if (found) return found.name;
  }
  const normalized = variants.map((v) => ({ name: v.name, weight: typeof v.weight === 'number' ? v.weight : 100 }));
  const total = normalized.reduce((sum, v) => sum + Math.max(0, v.weight), 0);
  if (total <= 0) return normalized[0]?.name;
  const r = Math.random() * total;
  let acc = 0;
  for (const v of normalized) {
    acc += Math.max(0, v.weight);
    if (r <= acc) return v.name;
  }
  return normalized[0]?.name;
};

const pickLocale = (locales: string[], locale?: string) => {
  if (locale && locales.includes(locale)) return locale;
  if (locales.includes('tr')) return 'tr';
  return locales[0] || 'tr';
};

export const renderInlineTemplate = (
  input: { subject: string; html: string },
  data: Record<string, any>
): { subject: string; html: string } => {
  const render = (tmpl: string) => {
    // {{{var}}} raw
    const withRaw = tmpl.replace(/{{{\s*([\w.]+)\s*}}}/g, (_m, key) => {
      const val = getByPath(data, key);
      return val === null || val === undefined ? '' : String(val);
    });
    // {{var}} escaped
    return withRaw.replace(/{{\s*([\w.]+)\s*}}/g, (_m, key) => {
      const val = getByPath(data, key);
      return escapeHtml(val);
    });
  };
  return {
    subject: render(input.subject),
    html: render(input.html),
  };
};

export const renderEmailTemplate = async (input: RenderInput): Promise<RenderOutput | null> => {
  const templateKey = input.key.trim();
  if (!templateKey) return null;

  try {
    const template = await EmailTemplate.findOne({ key: templateKey, enabled: true }).lean();
    if (!template) return null;
    if (!Array.isArray(template.variants) || template.variants.length === 0) return null;

    const chosenVariantName = pickVariant(template.variants, input.variantName);
    const variant = template.variants.find((v: any) => v.name === chosenVariantName) || template.variants[0];
    const localeKeys = variant?.locales ? Object.keys(variant.locales) : [];
    const chosenLocale = pickLocale(localeKeys, input.locale);

    const localized = (variant.locales && variant.locales[chosenLocale]) || (variant.locales && variant.locales['tr']) || variant.locales?.[localeKeys[0]];
    if (!localized || !localized.subject || !localized.html) return null;

    const data = input.data || {};
    const rendered = renderInlineTemplate({ subject: localized.subject, html: localized.html }, data);

    return {
      subject: rendered.subject,
      html: rendered.html,
      used: {
        templateKey,
        variantName: variant.name,
        locale: chosenLocale,
      },
    };
  } catch (e) {
    logger.error('Email template render hatası', e);
    return null;
  }
};

