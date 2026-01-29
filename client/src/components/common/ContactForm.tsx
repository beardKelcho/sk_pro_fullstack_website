import React from 'react';
import { useTranslations } from 'next-intl';

/**
 * Contact form component - TEMPORARILY DISABLED
 * Form functionality will be restored when Site Management is rebuilt
 */
const ContactForm: React.FC = () => {
  const t = useTranslations('site.contactForm');

  return (
    <div className="space-y-4">
      {/* Geçici Bilgilendirme */}
      <div className="p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-white/10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">İletişim Formu Güncelleniyor</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Şu anda iletişim formumuz güncelleme aşamasında. Bize aşağıdaki yollarla ulaşabilirsiniz:
        </p>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            <a href="mailto:info@skproduction.com.tr" className="hover:text-[#0066CC] transition-colors">
              info@skproduction.com.tr
            </a>
          </div>
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href="tel:+902121234567" className="hover:text-[#0066CC] transition-colors">
              +90 (212) 123 45 67
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;