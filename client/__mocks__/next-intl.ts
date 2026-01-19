// Jest test ortamında next-intl'in ESM build'ini parse problemleri nedeniyle mock'luyoruz.
// Uygulama runtime'ını etkilemez; sadece unit testleri stabil tutar.

import React from 'react';

export const NextIntlClientProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children);
};

export const useTranslations = () => (key: string) => key;
export const useLocale = () => 'tr';
export const useMessages = () => ({});
export const useNow = () => new Date();
export const useTimeZone = () => 'Europe/Istanbul';

