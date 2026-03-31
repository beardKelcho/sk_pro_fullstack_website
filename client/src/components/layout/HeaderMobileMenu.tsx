'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/common/Icon';
import useStoredAuthPresence from '@/hooks/useStoredAuthPresence';

type HeaderMenuItem = {
  href: string;
  label: string;
};

interface HeaderMobileMenuProps {
  items: readonly HeaderMenuItem[];
}

export default function HeaderMobileMenu({ items }: HeaderMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = useStoredAuthPresence();

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden flex items-center space-x-4">
      <button
        type="button"
        className="text-gray-600 transition-colors hover:text-[#0066CC] dark:text-gray-300 dark:hover:text-primary-light"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
        aria-expanded={isOpen}
      >
        <Icon name={isOpen ? 'close' : 'menu'} className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-20 border-b border-white/40 bg-white/95 px-4 py-4 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-dark-background/95">
          <nav role="navigation" className="flex flex-col space-y-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 transition-colors hover:text-[#0066CC] dark:text-gray-300 dark:hover:text-primary-light"
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated && (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0066CC] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0055AA] dark:bg-primary-light dark:hover:bg-primary"
                onClick={closeMenu}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin Paneli
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
