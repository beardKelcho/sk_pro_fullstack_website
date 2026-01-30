'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/common/Icon';
import { useQuery } from '@tanstack/react-query';
import axios from '@/services/api/axios';
import { Instagram, Linkedin } from 'lucide-react';

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
    <footer className="relative z-20 bg-black/80 backdrop-blur-lg border-t border-white/10 text-gray-300 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Şirket Bilgileri */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white tracking-wide">SK Production</h3>
            <p className="text-gray-400 leading-relaxed">
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
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-cyan-400 transition-all border border-white/5"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {contactData.socialLinks.linkedin && (
                  <a
                    href={contactData.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-cyan-400 transition-all border border-white/5"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 tracking-wide">Hızlı Linkler</h3>
            <ul className="space-y-3">
              {STATIC_CONTENT.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-cyan-500 transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim - Dynamic from CMS */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 tracking-wide">İletişim</h3>
            <ul className="space-y-4">
              {contactData?.address && (
                <li className="flex items-start gap-3 text-gray-400 group">
                  <div className="mt-1 flex-shrink-0 text-cyan-500/80 group-hover:text-cyan-400 transition-colors">
                    <Icon name="location" className="h-5 w-5" />
                  </div>
                  <span className="leading-relaxed group-hover:text-gray-300 transition-colors">{contactData.address}</span>
                </li>
              )}
              {contactData?.phone && (
                <li className="flex items-center gap-3 text-gray-400 group">
                  <div className="flex-shrink-0 text-cyan-500/80 group-hover:text-cyan-400 transition-colors">
                    <Icon name="phone" className="h-5 w-5" />
                  </div>
                  <a href={`tel:${contactData.phone.replace(/\s/g, '')}`} className="hover:text-cyan-400 transition-colors">
                    {contactData.phone}
                  </a>
                </li>
              )}
              {contactData?.email && (
                <li className="flex items-center gap-3 text-gray-400 group">
                  <div className="flex-shrink-0 text-cyan-500/80 group-hover:text-cyan-400 transition-colors">
                    <Icon name="email" className="h-5 w-5" />
                  </div>
                  <a href={`mailto:${contactData.email}`} className="hover:text-cyan-400 transition-colors">
                    {contactData.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Çalışma Saatleri */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 tracking-wide">Çalışma Saatleri</h3>
            <ul className="space-y-3 text-gray-400">
              {STATIC_CONTENT.workingHours.map((hours, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50"></span>
                  {hours}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>&copy; 2017-{new Date().getFullYear()} SK Production. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;