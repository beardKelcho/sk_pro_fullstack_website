'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/common/Icon';
import { useQuery } from '@tanstack/react-query';
import axios from '@/services/api/axios';
import { Instagram, Linkedin, Youtube } from 'lucide-react';

const STATIC_CONTENT = {
  companyDescription: 'Profesyonel görüntü rejisi ve medya server çözümleri ile etkinliklerinize değer katıyoruz.',
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
  // Fetch contact data for footer
  const { data } = useQuery({
    queryKey: ['footer-contact'],
    queryFn: async () => {
      const res = await axios.get('/cms/contact');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const contactData = data?.data;

  return (
    <footer className="relative z-20 bg-[#0A1128] dark:bg-dark-background text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Şirket Bilgileri */}
          <div>
            <h3 className="text-xl font-bold mb-4">SK Production</h3>
            <p className="text-gray-400 mb-4">
              {STATIC_CONTENT.companyDescription}
            </p>

            {/* Social Links - Dynamic from CMS */}
            {contactData?.socialLinks && (
              <div className="flex space-x-4">
                {contactData.socialLinks.instagram && (
                  <a
                    href={contactData.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                )}
                {contactData.socialLinks.linkedin && (
                  <a
                    href={contactData.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-6 w-6" />
                  </a>
                )}
                {contactData.socialLinks.youtube && (
                  <a
                    href={contactData.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-6 w-6" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-xl font-bold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              {STATIC_CONTENT.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim - Dynamic from CMS */}
          <div>
            <h3 className="text-xl font-bold mb-4">İletişim</h3>
            <ul className="space-y-2">
              {contactData?.address && (
                <li className="flex items-start text-gray-400">
                  <Icon name="location" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{contactData.address}</span>
                </li>
              )}
              {contactData?.phone && (
                <li className="flex items-center text-gray-400">
                  <Icon name="phone" className="h-5 w-5 mr-2" />
                  <a href={`tel:${contactData.phone}`} className="hover:text-white transition-colors">
                    {contactData.phone}
                  </a>
                </li>
              )}
              {contactData?.email && (
                <li className="flex items-center text-gray-400">
                  <Icon name="email" className="h-5 w-5 mr-2" />
                  <a href={`mailto:${contactData.email}`} className="hover:text-white transition-colors">
                    {contactData.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Çalışma Saatleri */}
          <div>
            <h3 className="text-xl font-bold mb-4">Çalışma Saatleri</h3>
            <ul className="space-y-2 text-gray-400">
              {STATIC_CONTENT.workingHours.map((hours, index) => (
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