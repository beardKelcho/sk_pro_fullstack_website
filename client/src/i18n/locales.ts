export const locales = ['tr', 'en', 'fr', 'es'] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'tr';

export const isLocale = (value: string): value is AppLocale => {
  return (locales as readonly string[]).includes(value);
};

