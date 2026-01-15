'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import logger from '@/utils/logger';

type Language = 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Dil dosyalarını yükle
const translations: Record<Language, Record<string, any>> = {
  tr: {},
  en: {},
};

// Dil dosyalarını dinamik olarak yükle
const loadTranslations = async (lang: Language) => {
  try {
    const translationModule = await import(`@/locales/${lang}.json`);
    translations[lang] = translationModule.default || translationModule;
  } catch (error) {
    logger.error(`Failed to load translations for ${lang}:`, error);
  }
};

// İlk yüklemede dil dosyalarını yükle
loadTranslations('tr');
loadTranslations('en');

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('tr');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localStorage'dan dil tercihini yükle
    try {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
      } else {
        // Tarayıcı dilini algıla
        if (typeof navigator !== 'undefined' && navigator.language) {
          const browserLang = navigator.language.split('-')[0];
          setLanguageState(browserLang === 'en' ? 'en' : 'tr');
        } else {
          // Fallback: varsayılan olarak Türkçe
          setLanguageState('tr');
        }
      }
    } catch (error) {
      // localStorage erişim hatası durumunda varsayılan dil
      logger.error('Language context initialization error:', error);
      setLanguageState('tr');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // HTML lang attribute'unu güncelle
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!key || typeof key !== 'string') {
      return key || '';
    }
    
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Çeviri bulunamadı, key'i döndür
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Parametreleri değiştir
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

