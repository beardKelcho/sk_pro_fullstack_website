'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/common/Icon';

// STATIC TURKISH CONTENT
const FOOTER_CONTENT = {
  companyDescription: 'Profesyonel görüntü rejisi ve medya server çözümleri ile etkinliklerinize değer katıyoruz.',
  contact: {
    address: 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
    phone: '+90 (212) 123 45 67',
    email: 'info@skproduction.com.tr'
  },
  social: [
    { platform: 'Facebook', url: 'https://facebook.com/skproduction', icon: 'facebook' as const },
    { platform: 'Instagram', url: 'https://instagram.com/skproduction', icon: 'instagram' as const },
    { platform: 'LinkedIn', url: 'https://linkedin.com/company/skproduction', icon: 'linkedin' as const }
  ],
  quickLinks: [
    { label: 'Projeler', href: '/#projects' },
    { label: 'Hizmetler & Ekipmanlar', href: '/#services' },
    { label: 'Hakkımızda', href: '/#about' },
    { label: 'İletişim', href: '/#contact' }
  ],
  workingHours: [
    'Pazartesi - Cuma: 09:00 - 18:00',
    'Cumartesi: 10:00 - 14:00',
    'Pazar: Kapalı'
  ]
};

const Footer: React.FC = () => {
  return (
    <footer className="relative z-20 bg-[#0A1128] dark:bg-dark-background text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Şirket Bilgileri */}
          <div>
            <h3 className="text-xl font-bold mb-4">SK Production</h3>
            <p className="text-gray-400 mb-4">
              {FOOTER_CONTENT.companyDescription}
            </p>
            <div className="flex space-x-4">
              {FOOTER_CONTENT.social.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.platform}
                >
                  <Icon name={social.icon} className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-xl font-bold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              {FOOTER_CONTENT.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="text-xl font-bold mb-4">İletişim</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <Icon name="location" className="h-5 w-5 mr-2" />
                <span>{FOOTER_CONTENT.contact.address}</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Icon name="phone" className="h-5 w-5 mr-2" />
                <span>{FOOTER_CONTENT.contact.phone}</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Icon name="email" className="h-5 w-5 mr-2" />
                <span>{FOOTER_CONTENT.contact.email}</span>
              </li>
            </ul>
          </div>

          {/* Çalışma Saatleri */}
          <div>
            <h3 className="text-xl font-bold mb-4">Çalışma Saatleri</h3>
            <ul className="space-y-2 text-gray-400">
              {FOOTER_CONTENT.workingHours.map((hours, index) => (
                <li key={index}>{hours}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} SK Production. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;