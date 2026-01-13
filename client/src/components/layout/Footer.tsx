'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/common/Icon';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A1128] dark:bg-dark-background text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Şirket Bilgileri */}
          <div>
            <h3 className="text-xl font-bold mb-4">SK Production</h3>
            <p className="text-gray-400 mb-4">
              Profesyonel görüntü rejisi ve medya server çözümleri ile etkinliklerinize değer katıyoruz.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Icon name="facebook" className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Icon name="instagram" className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Icon name="linkedin" className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-xl font-bold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#projects" className="text-gray-400 hover:text-white transition-colors">
                  Projeler
                </Link>
              </li>
              <li>
                <Link href="#services" className="text-gray-400 hover:text-white transition-colors">
                  Hizmetler
                </Link>
              </li>
              <li>
                <Link href="#equipment" className="text-gray-400 hover:text-white transition-colors">
                  Ekipmanlar
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-gray-400 hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="text-xl font-bold mb-4">İletişim</h3>
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
            <h3 className="text-xl font-bold mb-4">Çalışma Saatleri</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Pazartesi - Cuma: 09:00 - 18:00</li>
              <li>Cumartesi: 10:00 - 14:00</li>
              <li>Pazar: Kapalı</li>
            </ul>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} SK Production. Tüm hakları saklıdır.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Gizlilik Politikası
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Kullanım Şartları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 