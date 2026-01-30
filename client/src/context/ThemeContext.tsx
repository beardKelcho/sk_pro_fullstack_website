'use client';

import React from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      storageKey="skpro-theme"
    >
      {children}
    </NextThemeProvider>
  );
}

// next-themes içinde sağlanan useTheme hook'unu kullan
export { useTheme } from 'next-themes';