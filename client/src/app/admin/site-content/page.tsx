'use client';

import React, { useState } from 'react';
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
import { LayoutDashboard, Home, Settings, Info, Phone, FileText, Share2, ChevronRight } from 'lucide-react';

export default function SiteContentPage() {
  const { useAllContents, updateContent, isUpdating } = useSiteContent();
  const { data: contentsResponse, isLoading } = useAllContents();

  const [activeSection, setActiveSection] = useState<string>('hero');
  const contents = (contentsResponse?.contents || []) as SiteContent[];

  const sections = [
    { key: 'hero', name: 'Hero (Anasayfa)', icon: <Home size={18} />, desc: 'Ana başlık, video ve giriş metni' },
    { key: 'services-equipment', name: 'Hizmetler & Ekipman', icon: <Settings size={18} />, desc: 'Sunduğunuz hizmetler ve ekipman listesi' },
    { key: 'about', name: 'Hakkımızda', icon: <Info size={18} />, desc: 'Şirket tarihçesi ve vizyon' },
    { key: 'contact', name: 'İletişim', icon: <Phone size={18} />, desc: 'Adres, telefon ve harita bilgileri' },
    { key: 'footer', name: 'Footer', icon: <FileText size={18} />, desc: 'Alt bilgi ve copyright metinleri' },
    { key: 'social', name: 'Sosyal Medya', icon: <Share2 size={18} />, desc: 'Sosyal medya hesap bağlantıları' },
  ];

  const getContentBySection = (section: string) => {
    return contents.find(c => c.section === section)?.content;
  };

  const handleSave = async (section: string, data: any) => {
    try {
      // Backend expects { content: ... } wrapper
      await updateContent({ section, data: { content: data } });
    } catch (error) {
      console.error(error);
    }
  };

  const renderContentForm = () => {
    const currentContent = getContentBySection(activeSection);
    const activeSectionInfo = sections.find(s => s.key === activeSection);

    // Common props wrapper could be used here
    const content = (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            {activeSectionInfo?.icon}
            {activeSectionInfo?.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{activeSectionInfo?.desc}</p>
        </div>

        {(() => {
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
        })()}
      </div>
    );

    return content;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Site İçerik Yönetimi</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Web sitenizin tüm metin ve medya içeriklerini buradan yönetebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3">
          <nav className="space-y-1 sticky top-8">
            {sections.map((section) => {
              const isActive = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full group flex items-center justify-between px-4 py-4 rounded-xl text-left transition-all duration-200 border
                        ${isActive
                      ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                      : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600'} transition-colors`}>
                      {section.icon}
                    </div>
                    <span className="font-medium">{section.name}</span>
                  </div>
                  {isActive && <ChevronRight size={16} className="text-blue-500" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 min-h-[600px]">
            {renderContentForm()}
          </div>
        </div>
      </div>
    </div>
  );
}
