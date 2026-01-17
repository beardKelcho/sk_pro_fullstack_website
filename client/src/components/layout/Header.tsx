import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/common/Icon';
import FlagIcon from '@/components/common/FlagIcon';
import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from 'next-intl';
import { locales, type AppLocale } from '@/i18n/locales';
import { usePathname } from 'next/navigation';
import { getStoredUser } from '@/utils/authStorage';

const getLocaleLabel = (tCommon: ReturnType<typeof useTranslations>, l: AppLocale) => {
  return tCommon(`languages.${l}`);
};

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = useTranslations('site.header');
  const tCommon = useTranslations('common');
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();

  const prefix = `/${locale}`;

  // Kullanıcı giriş kontrolü - Storage değişikliklerini anında algıla
  useEffect(() => {
    const checkAuth = () => {
      const user = getStoredUser();
      setIsAuthenticated(!!user);
    };
    
    // İlk kontrol
    checkAuth();
    
    // Storage değişikliklerini dinle (localStorage/sessionStorage değiştiğinde)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'accessToken') {
        checkAuth();
      }
    };
    
    // Custom event dinle (login başarılı olduğunda dispatch edilir)
    const handleAuthChange = () => {
      checkAuth();
    };
    
    // Event listener'ları ekle
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:login', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:login', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
    };
  }, []);

  const localeOptions = useMemo(
    () =>
      locales.map((l) => ({
        value: l,
        label: getLocaleLabel(tCommon, l),
      })),
    [tCommon]
  );

  const buildLocalePath = (currentPathname: string, nextLocale: AppLocale) => {
    const segments = currentPathname.split('/').filter(Boolean);
    if (segments.length === 0) return `/${nextLocale}`;
    const first = segments[0];
    if ((locales as readonly string[]).includes(first)) {
      segments[0] = nextLocale;
      return '/' + segments.join('/');
    }
    return `/${nextLocale}${currentPathname.startsWith('/') ? currentPathname : `/${currentPathname}`}`;
  };

  const handleLocaleChange = (nextLocale: AppLocale) => {
    // En güvenilir yöntem: URL'i değiştir + hard reload
    // (RootLayout cache/shared layout edge-case'lerini sıfırlar, dil kesin değişir)
    if (typeof window === 'undefined') return;
    const nextPath = buildLocalePath(pathname, nextLocale);
    window.location.assign(`${nextPath}${window.location.search}${window.location.hash}`);
  };

  const LanguageSwitcher = ({ compact }: { compact?: boolean }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (!ref.current) return;
        if (!ref.current.contains(e.target as Node)) setOpen(false);
      };
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEsc);
      };
    }, []);

    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="group inline-flex items-center gap-2 rounded-full border border-gray-200/70 dark:border-gray-700/80 bg-white/70 dark:bg-dark-surface/70 backdrop-blur px-3 py-2 text-sm text-gray-800 dark:text-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <span className="inline-flex items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]">
            <FlagIcon locale={locale} className="h-7 w-7" title={getLocaleLabel(tCommon, locale)} />
          </span>
          <span className="sr-only">{getLocaleLabel(tCommon, locale)}</span>
          <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
            <svg
              className={`h-4 w-4 ${open ? 'rotate-180' : ''} transition-transform`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {open && (
          <div
            role="listbox"
            aria-label={tCommon('language')}
            className="absolute right-0 z-50 mt-3 w-32 rounded-2xl border border-gray-200/70 dark:border-gray-700/80 bg-white/90 dark:bg-dark-surface/90 backdrop-blur shadow-2xl"
          >
            <div className="grid grid-cols-2 gap-2 p-2">
              {localeOptions.map((opt) => {
                const active = opt.value === locale;
                return (
                  <button
                    key={opt.value}
                    role="option"
                    aria-selected={active}
                    aria-label={opt.label}
                    type="button"
                    onClick={() => handleLocaleChange(opt.value)}
                    className={`inline-flex items-center justify-center rounded-xl p-2 transition-all hover:bg-gray-100/70 dark:hover:bg-dark-card/60 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/60 dark:focus:ring-primary-light/70 ${
                      active
                        ? 'ring-2 ring-[#0066CC]/70 ring-offset-2 ring-offset-white/70 dark:ring-primary-light/80 dark:ring-offset-dark-surface/70'
                        : 'ring-1 ring-gray-200/40 dark:ring-gray-700/40'
                    }`}
                  >
                    <span className="inline-flex items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]">
                      <FlagIcon locale={opt.value} className="h-7 w-7" title={opt.label} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

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
          <Link href={prefix} className="flex items-center space-x-2">
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
            <Link href={`${prefix}#projects`} className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors">
              {t('projects')}
            </Link>
            <Link href={`${prefix}#services`} className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors">
              {t('servicesEquipment')}
            </Link>
            <Link href={`${prefix}#about`} className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors">
              {t('about')}
            </Link>
            <Link href={`${prefix}#contact`} className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors">
              {t('contact')}
            </Link>

            {/* Admin Paneli Butonu (sadece giriş yapmış kullanıcılar için) */}
            {isAuthenticated && (
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
            {/* Language */}
            <LanguageSwitcher />
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
            {/* Language */}
            <LanguageSwitcher compact />
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
              <Link href={`${prefix}#projects`} className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors" onClick={closeMobileMenu}>
                {t('projects')}
              </Link>
              <Link href={`${prefix}#services`} className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors" onClick={closeMobileMenu}>
                {t('servicesEquipment')}
              </Link>
              <Link href={`${prefix}#about`} className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors" onClick={closeMobileMenu}>
                {t('about')}
              </Link>
              <Link href={`${prefix}#contact`} className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors" onClick={closeMobileMenu}>
                {t('contact')}
              </Link>
              {/* Admin Paneli Butonu (mobil, sadece giriş yapmış kullanıcılar için) */}
              {isAuthenticated && (
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