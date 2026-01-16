'use client';

import type { AppLocale } from '@/i18n/locales';

type Props = {
  locale: AppLocale;
  className?: string;
  title?: string;
};

export default function FlagIcon({ locale, className = 'h-7 w-7', title }: Props) {
  // Minimal, self-contained SVG flags (no external assets).
  // Not 1:1 perfect; optimized for UI clarity at small sizes.
  if (locale === 'tr') {
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        role="img"
        aria-label={title || 'Türkçe'}
      >
        <defs>
          <clipPath id="flag-circle">
            <circle cx="32" cy="32" r="30" />
          </clipPath>
        </defs>
        <g clipPath="url(#flag-circle)">
          <rect width="64" height="64" fill="#E30A17" />
          <circle cx="26" cy="32" r="12" fill="#fff" />
          <circle cx="29" cy="32" r="10" fill="#E30A17" />
          <polygon
            fill="#fff"
            points="40,32 35.9,33.6 36.5,38 33.6,34.6 29.3,35.8 31.6,32 29.3,28.2 33.6,29.4 36.5,26 35.9,30.4"
          />
        </g>
        <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      </svg>
    );
  }

  if (locale === 'en') {
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        role="img"
        aria-label={title || 'English'}
      >
        <defs>
          <clipPath id="flag-circle-en">
            <circle cx="32" cy="32" r="30" />
          </clipPath>
        </defs>
        <g clipPath="url(#flag-circle-en)">
          <rect width="64" height="64" fill="#012169" />
          <path d="M0 0 L64 64 M64 0 L0 64" stroke="#fff" strokeWidth="12" />
          <path d="M0 0 L64 64 M64 0 L0 64" stroke="#C8102E" strokeWidth="6" />
          <rect x="26" y="0" width="12" height="64" fill="#fff" />
          <rect x="0" y="26" width="64" height="12" fill="#fff" />
          <rect x="28.5" y="0" width="7" height="64" fill="#C8102E" />
          <rect x="0" y="28.5" width="64" height="7" fill="#C8102E" />
        </g>
        <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      </svg>
    );
  }

  if (locale === 'fr') {
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        role="img"
        aria-label={title || 'Français'}
      >
        <defs>
          <clipPath id="flag-circle-fr">
            <circle cx="32" cy="32" r="30" />
          </clipPath>
        </defs>
        <g clipPath="url(#flag-circle-fr)">
          <rect width="64" height="64" fill="#fff" />
          <rect x="0" y="0" width="21.34" height="64" fill="#0055A4" />
          <rect x="42.66" y="0" width="21.34" height="64" fill="#EF4135" />
        </g>
        <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      </svg>
    );
  }

  // es
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title || 'Español'}
    >
      <defs>
        <clipPath id="flag-circle-es">
          <circle cx="32" cy="32" r="30" />
        </clipPath>
      </defs>
      <g clipPath="url(#flag-circle-es)">
        <rect width="64" height="64" fill="#AA151B" />
        <rect y="16" width="64" height="32" fill="#F1BF00" />
        <rect x="14" y="24" width="10" height="16" rx="2" fill="#AA151B" opacity="0.9" />
      </g>
      <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
    </svg>
  );
}

