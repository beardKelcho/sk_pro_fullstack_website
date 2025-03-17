'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Context'in varsayılan değeri - Karanlık mod olarak başlat
const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Varsayılan temayı 'dark' olarak ayarla
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // İstemci tarafında çalıştığından emin olmak için
    setMounted(true);
    
    // localStorage'dan kayıtlı temayı kontrol et
    const savedTheme = localStorage?.getItem('theme') as Theme | null;
    
    // localStorage'da tema varsa onu kullan, yoksa varsayılan olarak 'dark' kullan
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    
    // HTML elementine dark sınıfını ekle (varsayılan olarak)
    if (initialTheme === 'dark' || !savedTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // İlk ziyarette localStorage'a 'dark' değerini kaydet
    if (!savedTheme) {
      localStorage.setItem('theme', 'dark');
    }
  }, []);

  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // localStorage'a kaydet
    localStorage.setItem('theme', newTheme);
    
    // HTML elementine dark sınıfını ekle/kaldır
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Hydration hatalarından kaçınmak için
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme hook, ThemeProvider içinde kullanılmalıdır');
  }
  return context;
} 