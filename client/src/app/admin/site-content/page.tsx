'use client';

import React, { useState, useEffect } from 'react';
import {
  useSiteContent,
  SiteContent,
  HeroContent,
  ServicesEquipmentContent,
  AboutContent,
  ContactInfo,
  FooterContent,
  SocialMedia
} from '@/hooks/useSiteContent';

// Components
import HeroForm from './components/HeroForm';
import ServicesEquipmentForm from './components/ServicesEquipmentForm';
import AboutForm from './components/AboutForm';
import ContactForm from './components/ContactForm';
import FooterForm from './components/FooterForm';
import SocialForm from './components/SocialForm';

export default function SiteContentPage() {
  const { useAllContents, updateContent, isUpdating } = useSiteContent();
  const { data: contentsResponse, isLoading } = useAllContents();

  const [activeSection, setActiveSection] = useState<string>('hero');
  const contents = (contentsResponse?.contents || []) as SiteContent[];

  const sections = [
    { key: 'hero', name: 'Hero Bölümü', icon: '🏠' },
    { key: 'services-equipment', name: 'Hizmetler & Ekipmanlar', icon: '⚙️' },
    { key: 'about', name: 'Hakkımızda', icon: 'ℹ️' },
    { key: 'contact', name: 'İletişim', icon: '📞' },
    { key: 'footer', name: 'Footer', icon: '📄' },
    { key: 'social', name: 'Sosyal Medya', icon: '📱' },
  ];

  const getContentBySection = (section: string) => {
    return contents.find(c => c.section === section)?.content;
  };

  const handleSave = async (section: string, data: any) => {
    try {
      await updateContent({ section, data });
    } catch (error) {
      console.error(error);
    }
  };

  const renderContentForm = () => {
    const currentContent = getContentBySection(activeSection);

    switch (activeSection) {
      case 'hero':
        return <HeroForm
          content={currentContent as HeroContent}
          onSave={(data: any) => handleSave('hero', data)}
          saving={isUpdating}
        />;
      case 'services-equipment':
        return <ServicesEquipmentForm
          content={currentContent as ServicesEquipmentContent}
          onSave={(data: any) => handleSave('services-equipment', data)}
          saving={isUpdating}
        />;
      case 'about':
        return <AboutForm
          content={currentContent as AboutContent}
          onSave={(data: any) => handleSave('about', data)}
          saving={isUpdating}
        />;
      case 'contact':
        return <ContactForm
          content={currentContent as ContactInfo}
          onSave={(data: any) => handleSave('contact', data)}
          saving={isUpdating}
        />;
      case 'footer':
        return <FooterForm
          content={currentContent as FooterContent}
          onSave={(data: any) => handleSave('footer', data)}
          saving={isUpdating}
        />;
      case 'social':
        return <SocialForm
          content={currentContent as SocialMedia[]}
          onSave={(data: any) => handleSave('social', data)}
          saving={isUpdating}
        />;
      default:
        return <div>Bölüm bulunamadı</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Site İçerik Yönetimi</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-300">Anasayfadaki tüm bölümlerin içeriklerini yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bölümler</h2>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeSection === section.key
                    ? 'bg-[#0066CC] dark:bg-primary-light text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {renderContentForm()}
          </div>
        </div>
      </div>
    </div>
  );
}
