/**
 * Accessibility utility functions
 * WCAG 2.1 AA uyumluluğu için yardımcı fonksiyonlar
 */

import React from 'react';

/**
 * Klavye ile erişilebilir buton props'ları oluşturur
 * WCAG 2.1 AA uyumluluğu için gerekli ARIA özelliklerini ekler
 * @param onClick - Buton tıklama handler'ı
 * @param label - Buton etiketi (aria-label için)
 * @returns Erişilebilir buton props'ları
 * @example
 * <div {...getAccessibleButtonProps(() => handleClick(), 'Kapat')}>X</div>
 */
export const getAccessibleButtonProps = (onClick: () => void, label: string) => {
  return {
    role: 'button',
    tabIndex: 0,
    'aria-label': label,
    onClick,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
  };
};

/**
 * Modal için accessibility props oluşturur
 * WCAG 2.1 AA uyumluluğu için gerekli ARIA özelliklerini ekler
 * @param isOpen - Modal açık mı?
 * @param title - Modal başlığı
 * @param onClose - Modal kapatma handler'ı
 * @returns Erişilebilir modal props'ları
 * @example
 * <div {...getAccessibleModalProps(true, 'Başlık', () => setOpen(false))}>
 */
export const getAccessibleModalProps = (isOpen: boolean, title: string, onClose: () => void) => {
  return {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': 'modal-title',
    'aria-describedby': 'modal-description',
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
  };
};

/**
 * Form field için accessibility props oluşturur
 * WCAG 2.1 AA uyumluluğu için gerekli ARIA özelliklerini ekler
 * @param id - Field ID
 * @param label - Field etiketi
 * @param required - Zorunlu mu?
 * @param error - Hata mesajı (varsa)
 * @returns Erişilebilir form field props'ları
 * @example
 * <input {...getAccessibleFieldProps('email', 'E-posta', true, errors.email)} />
 */
export const getAccessibleFieldProps = (
  id: string,
  label: string,
  required: boolean = false,
  error?: string
) => {
  return {
    id,
    'aria-label': label,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : undefined,
  };
};

/**
 * Skip to main content link (WCAG 2.1 AA)
 */
export const SkipToContent = () => {
  return React.createElement(
    'a',
    {
      href: '#main-content',
      className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md',
      'aria-label': 'Ana içeriğe geç',
    },
    'Ana içeriğe geç'
  );
};

/**
 * Screen reader için gizli text (visually hidden)
 */
export const VisuallyHidden = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    'span',
    {
      className: 'sr-only',
      'aria-hidden': 'false',
    },
    children
  );
};

/**
 * Focus trap utility (modal'lar için)
 * Modal açıkken focus'un modal içinde kalmasını sağlar
 * @param element - Focus trap uygulanacak element
 * @returns Cleanup fonksiyonu (focus trap'i kaldırmak için)
 * @example
 * const cleanup = trapFocus(modalRef.current);
 * // Modal kapandığında: cleanup();
 */
export const trapFocus = (element: HTMLElement | null) => {
  if (!element) return;

  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);
  firstElement?.focus();

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Color contrast kontrolü (WCAG AA için minimum 4.5:1)
 * @param color1 - İlk renk
 * @param color2 - İkinci renk
 * @returns Kontrast oranı (placeholder: 4.5)
 * @note Bu basit bir placeholder implementasyon, production'da daha gelişmiş algoritma gerekir
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  // Basit kontrast hesaplama (gerçek implementasyon için daha gelişmiş algoritma gerekir)
  // Bu basit bir örnek, production'da daha detaylı olmalı
  return 4.5; // Placeholder
};

