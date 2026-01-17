'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/common/Icon';
import { SocialMedia } from '@/services/siteContentService';
import logger from '@/utils/logger';
import { useLocale, useTranslations } from 'next-intl';

const Footer: React.FC = () => {
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const tFooter = useTranslations('site.footer');
  const tHeader = useTranslations('site.header');
  const locale = useLocale();
  const prefix = `/${locale}`;

  useEffect(() => {
    const fetchSocialMedia = async () => {
      try {
        // Relative path kullan - Next.js rewrites proxy eder (farklı bilgisayarlardan erişim için)
        const response = await fetch(`/api/site-content/public/social?_t=${Date.now()}`, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            setSocialMedia(data.content.content as SocialMedia[]);
          }
        }
      } catch (error) {
        logger.error('Sosyal medya verileri yüklenirken hata:', error);
      }
    };

    fetchSocialMedia();
  }, []);

  const getIconName = (platform: string): React.ComponentProps<typeof Icon>['name'] => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('facebook')) return 'facebook';
    if (platformLower.includes('instagram')) return 'instagram';
    if (platformLower.includes('linkedin')) return 'linkedin';
    if (platformLower.includes('twitter') || platformLower.includes('x')) return 'twitter';
    if (platformLower.includes('youtube')) return 'youtube';
    return 'link';
  };

  return (
    <footer className="relative z-20 bg-[#0A1128] dark:bg-dark-background text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Şirket Bilgileri */}
          <div>
            <h3 className="text-xl font-bold mb-4">SK Production</h3>
            <p className="text-gray-400 mb-4">
              {tFooter('companyDescription')}
            </p>
            <div className="flex space-x-4">
              {socialMedia.length > 0 ? (
                socialMedia.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={(e) => {
                      if (!social.url || social.url === '#' || social.url.trim() === '') {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Icon name={getIconName(social.platform)} className="h-6 w-6" />
                  </a>
                ))
              ) : (
                <>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Icon name="facebook" className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Icon name="instagram" className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Icon name="linkedin" className="h-6 w-6" />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-xl font-bold mb-4">{tFooter('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`${prefix}#projects`} className="text-gray-400 hover:text-white transition-colors">
                  {tHeader('projects')}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}#services`} className="text-gray-400 hover:text-white transition-colors">
                  {tHeader('servicesEquipment')}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}#about`} className="text-gray-400 hover:text-white transition-colors">
                  {tHeader('about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="text-xl font-bold mb-4">{tFooter('contact')}</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <Icon name="location" className="h-5 w-5 mr-2" />
                <span>Zincirlidere Caddesi No:52/C Şişli/İstanbul</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Icon name="phone" className="h-5 w-5 mr-2" />
                <span>+90 532 123 4567</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Icon name="email" className="h-5 w-5 mr-2" />
                <span>info@skpro.com.tr</span>
              </li>
            </ul>
          </div>

          {/* Çalışma Saatleri */}
          <div>
            <h3 className="text-xl font-bold mb-4">{tFooter('workingHours')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li>{tFooter('workingHoursItems.weekday')}</li>
              <li>{tFooter('workingHoursItems.saturday')}</li>
              <li>{tFooter('workingHoursItems.sunday')}</li>
            </ul>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} SK Production. {tFooter('copyright')}
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href={`${prefix}/privacy`} className="hover:text-white transition-colors">
                {tFooter('privacy')}
              </Link>
              <Link href={`${prefix}/terms`} className="hover:text-white transition-colors">
                {tFooter('terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 