'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeaderAuthButton from './HeaderAuthButton';
import HeaderMobileMenu from './HeaderMobileMenu';

const MENU_ITEMS = [
  { href: '/#projects', label: 'Projeler' },
  { href: '/#services', label: 'Hizmetler & Ekipmanlar' },
  { href: '/#about', label: 'Hakkımızda' },
  { href: '/#contact', label: 'İletişim' },
] as const;

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      data-testid="site-header"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 shadow-lg backdrop-blur-md dark:bg-dark-background/90' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/sk-logo.png"
              alt="SK Production Logo"
              width={40}
              height={40}
              priority
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold text-[#0A1128] dark:text-white">SK Production</span>
          </Link>

          <nav data-testid="site-navigation" role="navigation" className="hidden md:flex items-center space-x-8">
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <HeaderAuthButton />
          </nav>

          <HeaderMobileMenu items={MENU_ITEMS} />
        </div>
      </div>
    </header>
  );
};

export default Header;
