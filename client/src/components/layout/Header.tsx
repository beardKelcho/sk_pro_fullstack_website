import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/common/Icon';
import { useTheme } from 'next-themes';
import { getStoredUser } from '@/utils/authStorage';

// STATIC TURKISH MENU
const MENU_ITEMS = {
  projects: 'Projeler',
  servicesEquipment: 'Hizmetler & Ekipmanlar',
  about: 'Hakkımızda',
  contact: 'İletişim'
};

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { theme, setTheme } = useTheme();

  // Kullanıcı giriş kontrolü
  useEffect(() => {
    const checkAuth = () => {
      const user = getStoredUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'accessToken') {
        checkAuth();
      }
    };

    const handleAuthChange = () => {
      checkAuth();
    };

    const handleFocus = () => {
      checkAuth();
    };

    const interval = setInterval(checkAuth, 2000);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:login', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:login', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Scroll olayını dinle
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-dark-background/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
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
            <Link href="/#projects" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors">
              {MENU_ITEMS.projects}
            </Link>
            <Link href="/#services" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors">
              {MENU_ITEMS.servicesEquipment}
            </Link>
            <Link href="/#about" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors">
              {MENU_ITEMS.about}
            </Link>
            <Link href="/#contact" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors">
              {MENU_ITEMS.contact}
            </Link>

            {/* Admin Paneli Butonu */}
            {(isAuthenticated || (typeof window !== 'undefined' && !!getStoredUser())) && (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-lg hover:bg-[#0055AA] dark:hover:bg-primary transition-colors font-medium text-sm shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin Paneli
              </Link>
            )}

            {/* Mobile Theme Toggle Removed */}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Desktop Menu - Theme Toggle Removed */}
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
              <Link href="/#projects" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors" onClick={closeMobileMenu}>
                {MENU_ITEMS.projects}
              </Link>
              <Link href="/#services" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors" onClick={closeMobileMenu}>
                {MENU_ITEMS.servicesEquipment}
              </Link>
              <Link href="/#about" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors" onClick={closeMobileMenu}>
                {MENU_ITEMS.about}
              </Link>
              <Link href="/#contact" className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors" onClick={closeMobileMenu}>
                {MENU_ITEMS.contact}
              </Link>
              {/* Admin Paneli Butonu */}
              {(isAuthenticated || (typeof window !== 'undefined' && !!getStoredUser())) && (
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-lg hover:bg-[#0055AA] dark:hover:bg-primary transition-colors font-medium text-sm shadow-sm"
                  onClick={closeMobileMenu}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Admin Paneli
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;