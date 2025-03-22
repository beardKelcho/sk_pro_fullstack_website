'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-[#0A1128] dark:bg-dark-surface text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo ve Kısa Açıklama */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/images/sk-logo.png"
                alt="SK Production Logo"
                width={50}
                height={50}
                className="mr-2"
              />
              <span className="font-bold text-xl">SK Production</span>
            </Link>
            <p className="text-gray-300 dark:text-dark-secondary text-sm mb-4">
              Profesyonel etkinlikler için görüntü rejisi ve medya server çözümleri sunan uzmanlık merkezi.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/company/skpro/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="text-gray-300 dark:text-dark-secondary hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-.88-.018-2.013-1.227-2.013-1.227 0-1.415.957-1.415 1.949v5.668h-3v-11h2.85v1.026h.041c.345-.666 1.19-1.369 2.45-1.369 2.619 0 3.065 1.724 3.065 3.966v6.376z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/skprotr/" target="_blank" rel="noopener noreferrer" className="text-gray-300 dark:text-dark-secondary hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Hızlı Bağlantılar */}
          <div>
            <h3 className="text-[#0066CC] dark:text-primary-light font-bold text-lg mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#services" className="text-gray-300 dark:text-dark-secondary hover:text-white">Hizmetler</Link>
              </li>
              <li>
                <Link href="/#projects" className="text-gray-300 dark:text-dark-secondary hover:text-white">Projeler</Link>
              </li>
              <li>
                <Link href="/#equipment" className="text-gray-300 dark:text-dark-secondary hover:text-white">Ekipmanlar</Link>
              </li>
              <li>
                <Link href="/#about" className="text-gray-300 dark:text-dark-secondary hover:text-white">Hakkımızda</Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-300 dark:text-dark-secondary hover:text-white">İletişim</Link>
              </li>
            </ul>
          </div>

          {/* Hizmetler */}
          <div>
            <h3 className="text-[#0066CC] dark:text-primary-light font-bold text-lg mb-4">Hizmetlerimiz</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#services" className="text-gray-300 dark:text-dark-secondary hover:text-white">Görüntü Rejisi</Link>
              </li>
              <li>
                <Link href="/#services" className="text-gray-300 dark:text-dark-secondary hover:text-white">Medya Server Sistemleri</Link>
              </li>
              <li>
                <Link href="/#services" className="text-gray-300 dark:text-dark-secondary hover:text-white">LED Ekran Yönetimi</Link>
              </li>
              <li>
                <Link href="/#services" className="text-gray-300 dark:text-dark-secondary hover:text-white">Teknik Danışmanlık</Link>
              </li>
              <li>
                <Link href="/#services" className="text-gray-300 dark:text-dark-secondary hover:text-white">Ekipman Kiralama</Link>
              </li>
            </ul>
          </div>

          {/* İletişim Bilgileri */}
          <div>
            <h3 className="text-[#0066CC] dark:text-primary-light font-bold text-lg mb-4">İletişim</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-300 dark:text-dark-secondary">Zincirlidere Caddesi No:52/C Şişli/İstanbul</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-300 dark:text-dark-secondary">+90 532 123 4567</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-300 dark:text-dark-secondary">info@skpro.com.tr</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 dark:border-dark-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 dark:text-dark-secondary text-sm">&copy; {new Date().getFullYear()} SK Production. Tüm hakları saklıdır.</p>
          <div className="mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 dark:text-dark-secondary text-sm mx-2 hover:text-white">Gizlilik Politikası</Link>
            <span className="text-gray-500">|</span>
            <Link href="/terms" className="text-gray-400 dark:text-dark-secondary text-sm mx-2 hover:text-white">Kullanım Şartları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 