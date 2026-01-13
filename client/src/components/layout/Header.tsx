import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/common/Icon';
import { useTheme } from 'next-themes';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Scroll olayını dinle
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobil menüyü kapat
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 dark:bg-dark-background/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/sk-logo.png"
              alt="SK Production Logo"
              width={40}
              height={40}
              className="w-10 h-10"
              style={{ width: 'auto', height: 'auto' }}
            />
            <span className="text-xl font-bold text-[#0A1128] dark:text-white">SK Production</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#projects" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors">
              Projeler
            </Link>
            <Link href="#services" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors">
              Hizmetler
            </Link>
            <Link href="#equipment" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors">
              Ekipmanlar
            </Link>
            <Link href="#about" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors">
              Hakkımızda
            </Link>
            <Link href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors">
              İletişim
            </Link>
            {/* Karanlık Mod Butonu */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-card transition-colors"
              suppressHydrationWarning
            >
              {theme === 'dark' ? (
                <Icon name="sun" className="h-5 w-5 text-yellow-500" />
              ) : (
                <Icon name="moon" className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Karanlık Mod Butonu */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-card transition-colors"
              suppressHydrationWarning
            >
              {theme === 'dark' ? (
                <Icon name="sun" className="h-5 w-5 text-yellow-500" />
              ) : (
                <Icon name="moon" className="h-5 w-5 text-gray-700" />
              )}
            </button>
            <button
              className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Icon name={isMobileMenuOpen ? 'close' : 'menu'} className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="#projects" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors" onClick={closeMobileMenu}>
                Projeler
              </Link>
              <Link href="#services" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors" onClick={closeMobileMenu}>
                Hizmetler
              </Link>
              <Link href="#equipment" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors" onClick={closeMobileMenu}>
                Ekipmanlar
              </Link>
              <Link href="#about" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors" onClick={closeMobileMenu}>
                Hakkımızda
              </Link>
              <Link href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors" onClick={closeMobileMenu}>
                İletişim
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 