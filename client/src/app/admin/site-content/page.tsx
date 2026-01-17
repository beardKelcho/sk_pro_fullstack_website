'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAllImages, createImage, deleteImage, SiteImage } from '@/services/siteImageService';
import { 
  getAllContents, 
  updateContentBySection, 
  createContent,
  SiteContent,
  HeroContent,
  ServiceItem,
  EquipmentCategory,
  ServicesEquipmentContent,
  AboutContent,
  ContactInfo,
  FooterContent,
  SocialMedia
} from '@/services/siteContentService';
import { toast } from 'react-toastify';
import { getImageUrl } from '@/utils/imageUrl';
import LazyImage from '@/components/common/LazyImage';
import Image from 'next/image';
import logger from '@/utils/logger';

export default function SiteContentPage() {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [saving, setSaving] = useState(false);

  const sections = [
    { key: 'hero', name: 'Hero Bölümü', icon: '🏠' },
    { key: 'services-equipment', name: 'Hizmetler & Ekipmanlar', icon: '⚙️' },
    { key: 'about', name: 'Hakkımızda', icon: 'ℹ️' },
    { key: 'contact', name: 'İletişim', icon: '📞' },
    { key: 'footer', name: 'Footer', icon: '📄' },
    { key: 'social', name: 'Sosyal Medya', icon: '📱' },
  ];

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await getAllContents();
      setContents(response.contents || []);
    } catch (error) {
      logger.error('İçerik yükleme hatası:', error);
      toast.error('İçerikler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getContentBySection = (section: string): SiteContent | null => {
    return contents.find(c => c.section === section) || null;
  };

  const handleSave = async (section: string, contentData: any) => {
    setSaving(true);
    try {
      const existing = getContentBySection(section);
      
      if (existing) {
        await updateContentBySection(section, {
          content: contentData,
          isActive: true,
        });
      } else {
        await createContent({
          section: section as any,
          content: contentData,
          isActive: true,
          order: 0,
        });
      }
      
      toast.success(`${sections.find(s => s.key === section)?.name} başarıyla kaydedildi`);
      fetchContents();
    } catch (error: any) {
      logger.error('Kaydetme hatası:', error);
      toast.error(error.response?.data?.message || 'İçerik kaydedilirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const renderContentForm = () => {
    const currentContent = getContentBySection(activeSection);
    
    switch (activeSection) {
      case 'hero':
        return <HeroForm 
          content={currentContent?.content as HeroContent} 
          onSave={(data) => handleSave('hero', data)} 
          saving={saving}
        />;
      case 'services-equipment':
        return <ServicesEquipmentForm 
          content={currentContent?.content as ServicesEquipmentContent} 
          onSave={(data) => handleSave('services-equipment', data)} 
          saving={saving}
        />;
      case 'about':
        return <AboutForm 
          content={currentContent?.content as AboutContent} 
          onSave={(data) => handleSave('about', data)} 
          saving={saving}
        />;
      case 'contact':
        return <ContactForm 
          content={currentContent?.content as ContactInfo} 
          onSave={(data) => handleSave('contact', data)} 
          saving={saving}
        />;
      case 'footer':
        return <FooterForm 
          content={currentContent?.content as FooterContent} 
          onSave={(data) => handleSave('footer', data)} 
          saving={saving}
        />;
      case 'social':
        return <SocialForm 
          content={currentContent?.content as SocialMedia[]} 
          onSave={(data) => handleSave('social', data)} 
          saving={saving}
        />;
      default:
        return <div>Bölüm bulunamadı</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Site İçerik Yönetimi</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-300">
          Anasayfadaki tüm bölümlerin içeriklerini yönetin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol Menü */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bölümler</h2>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeSection === section.key
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

        {/* Sağ İçerik Formu */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {renderContentForm()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hero Form Bileşeni
function HeroForm({ content, onSave, saving }: { 
  content?: HeroContent; 
  onSave: (data: HeroContent) => void; 
  saving: boolean;
}) {
  const [formData, setFormData] = useState<HeroContent>({
    title: content?.title || '',
    subtitle: content?.subtitle || '',
    description: content?.description || '',
    buttonText: content?.buttonText || 'İletişime Geçin',
    buttonLink: content?.buttonLink || '#contact',
    backgroundVideo: content?.selectedVideo || content?.backgroundVideo || '',
    selectedVideo: content?.selectedVideo || content?.backgroundVideo || '',
    availableVideos: content?.availableVideos || [],
    backgroundImage: content?.backgroundImage || '',
    rotatingTexts: content?.rotatingTexts || [],
  });

  const [images, setImages] = useState<SiteImage[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (showImageModal) {
      fetchImages();
    }
  }, [showImageModal]);

  const fetchImages = async () => {
    try {
      const response = await getAllImages({ category: 'hero' });
      setImages(response.images || []);
    } catch (error) {
      logger.error('Resim yükleme hatası:', error);
    }
  };

  const handleImageSelect = (imageId: string) => {
    setFormData({ ...formData, backgroundImage: imageId });
    setShowImageModal(false);
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, backgroundImage: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hero Bölümü</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Başlık
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          placeholder="Ana başlık"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Alt Başlık
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          placeholder="Alt başlık"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Açıklama
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          placeholder="Açıklama metni"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Buton Metni
          </label>
          <input
            type="text"
            value={formData.buttonText}
            onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Buton Linki
          </label>
          <input
            type="text"
            value={formData.buttonLink}
            onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="#contact"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Arkaplan Video
        </label>
        <VideoSelector
          selectedVideo={formData.selectedVideo || formData.backgroundVideo}
          availableVideos={formData.availableVideos || []}
          onVideoSelect={(videoUrl, videoList) => {
            setFormData({ 
              ...formData, 
              selectedVideo: videoUrl,
              backgroundVideo: videoUrl, // Backward compatibility
              availableVideos: videoList || formData.availableVideos || []
            });
          }}
        />
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Veya Manuel URL Girin
          </label>
          <input
            type="text"
            value={formData.selectedVideo || formData.backgroundVideo || ''}
            onChange={(e) => {
              const url = e.target.value;
              setFormData({ 
                ...formData, 
                selectedVideo: url,
                backgroundVideo: url // Backward compatibility
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-transparent"
            placeholder="http://example.com/video.mp4 veya /videos/hero-background.mp4"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Arkaplan Görsel (Video yoksa kullanılır)
        </label>
        <div className="flex gap-3 items-start">
          {formData.backgroundImage && (
            <div className="relative w-32 h-20 rounded border border-gray-300 dark:border-gray-600 overflow-hidden flex-shrink-0">
              <LazyImage
                src={getImageUrl(formData.backgroundImage)}
                alt="Hero background"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex gap-2 flex-1">
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              {formData.backgroundImage ? 'Değiştir' : 'Görsel Seç'}
            </button>
            {formData.backgroundImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Kaldır
              </button>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary transition-colors disabled:opacity-50"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>

      {/* Image Selection Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Hero Görseli Seç</h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image._id || image.id || image.filename}
                    onClick={() => {
                      if (image._id) handleImageSelect(image._id);
                    }}
                    className="relative aspect-square rounded border-2 border-gray-300 dark:border-gray-600 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <LazyImage
                      src={getImageUrl(image._id)}
                      alt={image.filename || 'Image'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              {images.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Henüz hero kategorisinde görsel yok. Lütfen önce görsel yükleyin.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

// Services Form Bileşeni
function ServicesForm({ content, onSave, saving }: { 
  content?: ServiceItem[]; 
  onSave: (data: ServiceItem[]) => void; 
  saving: boolean;
}) {
  const [services, setServices] = useState<ServiceItem[]>(content || [
    { title: 'Görüntü Rejisi', description: '', icon: 'video', order: 0 },
    { title: 'Medya Server Sistemleri', description: '', icon: 'screen', order: 1 },
    { title: 'LED Ekran Yönetimi', description: '', icon: 'led', order: 2 },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(services);
  };

  const addService = () => {
    setServices([...services, { title: '', description: '', icon: 'video', order: services.length }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })));
  };

  const updateService = (index: number, field: keyof ServiceItem, value: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hizmetler</h2>
        <button
          type="button"
          onClick={addService}
          className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          + Hizmet Ekle
        </button>
      </div>

      {services.map((service, index) => (
        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900 dark:text-white">Hizmet {index + 1}</h3>
            {services.length > 1 && (
              <button
                type="button"
                onClick={() => removeService(index)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Sil
              </button>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Başlık
            </label>
            <input
              type="text"
              value={service.title}
              onChange={(e) => updateService(index, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Hizmet başlığı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Açıklama
            </label>
            <textarea
              value={service.description}
              onChange={(e) => updateService(index, 'description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Hizmet açıklaması"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              İkon
            </label>
            <select
              value={service.icon}
              onChange={(e) => updateService(index, 'icon', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="video">Video</option>
              <option value="screen">Ekran</option>
              <option value="led">LED</option>
              <option value="audio">Ses</option>
              <option value="camera">Kamera</option>
            </select>
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary transition-colors disabled:opacity-50"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </form>
  );
}

// Services & Equipment Combined Form Bileşeni
function ServicesEquipmentForm({ content, onSave, saving }: { 
  content?: ServicesEquipmentContent; 
  onSave: (data: ServicesEquipmentContent) => void; 
  saving: boolean;
}) {
  const [formData, setFormData] = useState<ServicesEquipmentContent>(content || {
    title: 'Hizmetlerimiz & Ekipmanlarımız',
    subtitle: 'Etkinlikleriniz için profesyonel çözümler ve son teknoloji ekipmanlar',
    services: [
      { title: 'Görüntü Rejisi', description: '', icon: 'video', order: 0 },
      { title: 'Medya Server Sistemleri', description: '', icon: 'screen', order: 1 },
      { title: 'LED Ekran Yönetimi', description: '', icon: 'led', order: 2 },
    ],
    equipment: [
      {
        title: 'Görüntü Rejisi Sistemleri',
        items: [
          { name: 'Analog Way Aquilon RS4', description: '4K/8K çözünürlük desteği ile görüntü işleme' },
          { name: 'Barco E2 Gen 2', description: 'Gerçek 4K çözünürlük, genişletilebilir giriş/çıkış' },
        ],
        order: 0,
      },
    ],
    order: 0,
  });

  const [images, setImages] = useState<SiteImage[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalType, setImageModalType] = useState<'background' | 'service' | 'equipment' | 'equipmentItem' | null>(null);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number | null>(null);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  useEffect(() => {
    if (showImageModal) {
      fetchImages();
    }
  }, [showImageModal]);

  const fetchImages = async () => {
    try {
      const response = await getAllImages({ category: 'general' });
      setImages(response.images || []);
    } catch (error) {
      logger.error('Resim yükleme hatası:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field: keyof ServicesEquipmentContent, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Services functions
  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { title: '', description: '', icon: 'video', order: formData.services.length }],
    });
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })),
    });
  };

  const updateService = (index: number, field: keyof ServiceItem, value: any) => {
    const updated = [...formData.services];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, services: updated });
  };

  // Equipment functions
  const addCategory = () => {
    setFormData({
      ...formData,
      equipment: [...formData.equipment, { title: '', items: [], order: formData.equipment.length }],
    });
  };

  const removeCategory = (index: number) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.filter((_, i) => i !== index).map((c, i) => ({ ...c, order: i })),
    });
  };

  const updateCategory = (index: number, field: keyof EquipmentCategory, value: any) => {
    const updated = [...formData.equipment];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, equipment: updated });
  };

  const addEquipmentItem = (categoryIndex: number) => {
    const updated = [...formData.equipment];
    updated[categoryIndex].items.push({ name: '', description: '' });
    setFormData({ ...formData, equipment: updated });
  };

  const removeEquipmentItem = (categoryIndex: number, itemIndex: number) => {
    const updated = [...formData.equipment];
    updated[categoryIndex].items = updated[categoryIndex].items.filter((_, i) => i !== itemIndex);
    setFormData({ ...formData, equipment: updated });
  };

  const updateEquipmentItem = (categoryIndex: number, itemIndex: number, field: string, value: string) => {
    const updated = [...formData.equipment];
    updated[categoryIndex].items[itemIndex] = { ...updated[categoryIndex].items[itemIndex], [field]: value };
    setFormData({ ...formData, equipment: updated });
  };

  const handleImageSelect = (imageId: string) => {
    if (imageModalType === 'background') {
      updateField('backgroundImage', imageId);
    } else if (imageModalType === 'service' && selectedServiceIndex !== null) {
      updateService(selectedServiceIndex, 'image', imageId);
    } else if (imageModalType === 'equipment' && selectedCategoryIndex !== null) {
      updateCategory(selectedCategoryIndex, 'image', imageId);
    } else if (imageModalType === 'equipmentItem' && selectedCategoryIndex !== null && selectedItemIndex !== null) {
      updateEquipmentItem(selectedCategoryIndex, selectedItemIndex, 'image', imageId);
    }
    setShowImageModal(false);
    setImageModalType(null);
    setSelectedServiceIndex(null);
    setSelectedCategoryIndex(null);
    setSelectedItemIndex(null);
  };

  const openImageModal = (type: 'background' | 'service' | 'equipment' | 'equipmentItem', serviceIndex?: number, categoryIndex?: number, itemIndex?: number) => {
    setImageModalType(type);
    setSelectedServiceIndex(serviceIndex ?? null);
    setSelectedCategoryIndex(categoryIndex ?? null);
    setSelectedItemIndex(itemIndex ?? null);
    setShowImageModal(true);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bölüm Başlığı
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Bölüm başlığı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alt Başlık
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Alt başlık"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Arka Plan Görseli
            </label>
            <div className="flex gap-2">
              {formData.backgroundImage && (
                <div className="relative w-24 h-24 rounded border border-gray-300 dark:border-gray-600 overflow-hidden">
                  <LazyImage
                    src={getImageUrl(formData.backgroundImage)}
                    alt="Background"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => openImageModal('background')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                {formData.backgroundImage ? 'Değiştir' : 'Görsel Seç'}
              </button>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hizmetler</h3>
            <button
              type="button"
              onClick={addService}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              + Hizmet Ekle
            </button>
          </div>

          {formData.services.map((service, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900 dark:text-white">Hizmet {index + 1}</h4>
                {formData.services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Sil
                  </button>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => updateService(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Hizmet başlığı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={service.description}
                  onChange={(e) => updateService(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Hizmet açıklaması"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  İkon
                </label>
                <select
                  value={service.icon}
                  onChange={(e) => updateService(index, 'icon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="video">Video</option>
                  <option value="screen">Ekran</option>
                  <option value="led">LED</option>
                  <option value="audio">Ses</option>
                  <option value="camera">Kamera</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Görsel
                </label>
                <div className="flex gap-2">
                  {(service as any).image && (
                    <div className="relative w-24 h-24 rounded border border-gray-300 dark:border-gray-600 overflow-hidden">
                      <LazyImage
                        src={getImageUrl((service as any).image)}
                        alt={service.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => openImageModal('service', index)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    {(service as any).image ? 'Değiştir' : 'Görsel Seç'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Equipment Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ekipmanlar</h3>
            <button
              type="button"
              onClick={addCategory}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              + Kategori Ekle
            </button>
          </div>

          {formData.equipment.map((category, catIndex) => (
            <div key={catIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900 dark:text-white">Kategori {catIndex + 1}</h4>
                {formData.equipment.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCategory(catIndex)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Sil
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori Başlığı
                </label>
                <input
                  type="text"
                  value={category.title}
                  onChange={(e) => updateCategory(catIndex, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Kategori adı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori Görseli
                </label>
                <div className="flex gap-2">
                  {category.image && (
                    <div className="relative w-24 h-24 rounded border border-gray-300 dark:border-gray-600 overflow-hidden">
                      <LazyImage
                        src={getImageUrl(category.image)}
                        alt={category.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => openImageModal('equipment', undefined, catIndex)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    {category.image ? 'Değiştir' : 'Görsel Seç'}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ekipmanlar
                  </label>
                  <button
                    type="button"
                    onClick={() => addEquipmentItem(catIndex)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Ekipman Ekle
                  </button>
                </div>
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ekipman {itemIndex + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeEquipmentItem(catIndex, itemIndex)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Sil
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateEquipmentItem(catIndex, itemIndex, 'name', e.target.value)}
                      className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      placeholder="Ekipman adı"
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateEquipmentItem(catIndex, itemIndex, 'description', e.target.value)}
                      className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      placeholder="Açıklama"
                    />
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ekipman Görseli
                      </label>
                      <div className="flex gap-2">
                        {item.image && (
                          <div className="relative w-20 h-20 rounded border border-gray-300 dark:border-gray-600 overflow-hidden">
                            <LazyImage
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => openImageModal('equipmentItem', undefined, catIndex, itemIndex)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
                        >
                          {item.image ? 'Değiştir' : 'Görsel Seç'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary transition-colors disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>

      {/* Image Selection Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Görsel Seç</h3>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setImageModalType(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image._id || image.id || image.filename}
                    onClick={() => {
                      if (image._id) handleImageSelect(image._id);
                    }}
                    className="relative aspect-square rounded border-2 border-gray-300 dark:border-gray-600 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <LazyImage
                      src={getImageUrl(image._id)}
                      alt={image.filename || 'Image'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Equipment Form Bileşeni
function EquipmentForm({ content, onSave, saving }: { 
  content?: EquipmentCategory[]; 
  onSave: (data: EquipmentCategory[]) => void; 
  saving: boolean;
}) {
  const [categories, setCategories] = useState<EquipmentCategory[]>(content || [
    {
      title: 'Görüntü Rejisi Sistemleri',
      items: [
        { name: 'Analog Way Aquilon RS4', description: '4K/8K çözünürlük desteği ile görüntü işleme' },
        { name: 'Barco E2 Gen 2', description: 'Gerçek 4K çözünürlük, genişletilebilir giriş/çıkış' },
      ],
      order: 0,
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(categories);
  };

  const addCategory = () => {
    setCategories([...categories, { title: '', items: [], order: categories.length }]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index).map((c, i) => ({ ...c, order: i })));
  };

  const updateCategory = (index: number, field: keyof EquipmentCategory, value: any) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const addEquipmentItem = (categoryIndex: number) => {
    const updated = [...categories];
    updated[categoryIndex].items.push({ name: '', description: '' });
    setCategories(updated);
  };

  const removeEquipmentItem = (categoryIndex: number, itemIndex: number) => {
    const updated = [...categories];
    updated[categoryIndex].items = updated[categoryIndex].items.filter((_, i) => i !== itemIndex);
    setCategories(updated);
  };

  const updateEquipmentItem = (categoryIndex: number, itemIndex: number, field: string, value: string) => {
    const updated = [...categories];
    updated[categoryIndex].items[itemIndex] = { ...updated[categoryIndex].items[itemIndex], [field]: value };
    setCategories(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ekipmanlar</h2>
        <button
          type="button"
          onClick={addCategory}
          className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          + Kategori Ekle
        </button>
      </div>

      {categories.map((category, catIndex) => (
        <div key={catIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900 dark:text-white">Kategori {catIndex + 1}</h3>
            {categories.length > 1 && (
              <button
                type="button"
                onClick={() => removeCategory(catIndex)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Sil
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategori Başlığı
            </label>
            <input
              type="text"
              value={category.title}
              onChange={(e) => updateCategory(catIndex, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Kategori adı"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ekipmanlar
              </label>
              <button
                type="button"
                onClick={() => addEquipmentItem(catIndex)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Ekipman Ekle
              </button>
            </div>
            {category.items.map((item, itemIndex) => (
              <div key={itemIndex} className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ekipman {itemIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeEquipmentItem(catIndex, itemIndex)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Sil
                  </button>
                </div>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateEquipmentItem(catIndex, itemIndex, 'name', e.target.value)}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="Ekipman adı"
                />
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateEquipmentItem(catIndex, itemIndex, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="Açıklama"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary transition-colors disabled:opacity-50"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </form>
  );
}

// Video Thumbnail Component - Video'dan frame çekerek thumbnail oluştur
const VideoThumbnail = ({ 
  video, 
  videoUrl, 
  baseUrl, 
  isSelected, 
  onSelect,
  onDelete
}: { 
  video: SiteImage; 
  videoUrl: string; 
  baseUrl: string; 
  isSelected: boolean; 
  onSelect: () => void;
  onDelete?: () => void;
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setLoading(true);
    setThumbnail(null);
    setFailed(false);

    const videoEl = videoRef.current;
    const canvas = canvasRef.current;
    if (!videoEl || !canvas) {
      setLoading(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      // Bazı tarayıcılarda medya yükleme olayları hiç gelmeyebilir; UI kilitlenmesin.
      setLoading(false);
    }, 5000);

    const handleLoadedMetadata = () => {
      try {
        // display:none (tailwind `hidden`) video yüklemeyi engelleyebiliyor; bu yüzden element görünmez ama DOM'da.
        // İlk kareyi yakalamak için güvenli bir saniyeye seek et.
        const d = videoEl.duration;
        const safeTime =
          Number.isFinite(d) && d > 0 ? (d <= 0.1 ? 0 : Math.min(0.1, d - 0.1)) : 0.1;
        videoEl.currentTime = safeTime;
      } catch (err) {
        logger.error('Video metadata yükleme hatası:', err);
        setLoading(false);
      }
    };

    const handleSeeked = () => {
      try {
        canvas.width = videoEl.videoWidth || 320;
        canvas.height = videoEl.videoHeight || 180;

        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setThumbnail(dataUrl);
        setLoading(false);
      } catch (err) {
        logger.error('Thumbnail oluşturma hatası:', err);
        setLoading(false);
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    const handleError = () => {
      window.clearTimeout(timeoutId);
      setFailed(true);
      setLoading(false);
    };

    videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoEl.addEventListener('seeked', handleSeeked);
    videoEl.addEventListener('error', handleError);

    // Bazı tarayıcılarda otomatik yükleme tetiklenmeyebiliyor
    try {
      videoEl.load();
    } catch {
      // no-op
    }

    return () => {
      window.clearTimeout(timeoutId);
      videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoEl.removeEventListener('seeked', handleSeeked);
      videoEl.removeEventListener('error', handleError);
    };
  }, [videoUrl]);

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect();
      }}
      className={`
        relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all modern-card
        ${isSelected 
          ? 'border-[#0066CC] dark:border-primary-light shadow-xl scale-105 ring-2 ring-[#0066CC] dark:ring-primary-light' 
          : 'border-gray-200 dark:border-gray-700 hover:border-[#0066CC]/50 dark:hover:border-primary-light/50 hover:shadow-lg'
        }
      `}
    >
      {/* Thumbnail veya Loading */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-[#0066CC] dark:text-primary-light mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-xs text-gray-500 dark:text-gray-400">Yükleniyor...</p>
            </div>
          </div>
        ) : thumbnail ? (
          <Image
            src={thumbnail}
            alt={video.originalName || video.filename}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">{failed ? 'Video bulunamadı' : 'Önizleme yok'}</p>
          </div>
        )}
        
        {/* Video element (gizli, sadece thumbnail için) */}
        {!failed && (
          <video
            ref={videoRef}
            src={videoUrl}
            // `hidden` (display:none) bazı tarayıcılarda video yüklemeyi engelleyebiliyor.
            // Görünmez ama DOM'da kalsın ki `loadedmetadata/seeked` event'leri çalışsın.
            className="absolute left-0 top-0 w-px h-px opacity-0 pointer-events-none"
            preload="metadata"
            muted
            playsInline
            crossOrigin="anonymous"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="w-14 h-14 rounded-full bg-white/95 dark:bg-gray-800/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
            <svg className="w-8 h-8 text-[#0066CC] dark:text-primary-light ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        
        {/* Sil butonu */}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete();
            }}
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity shadow-lg z-10"
          >
            Sil
          </button>
        )}
        
        {/* Seçili badge */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-[#0066CC] to-[#00C49F] dark:from-primary-light dark:to-primary text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg z-10">
            ✓ Seçili
          </div>
        )}
      </div>
      
      {/* Video bilgisi */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate mb-1">
          {video.originalName || video.filename}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Video
        </p>
      </div>
    </div>
  );
};

// Video Selector Bileşeni
function VideoSelector({
  selectedVideo,
  availableVideos = [],
  onVideoSelect
}: {
  selectedVideo?: string;
  availableVideos?: Array<{ url: string; filename: string; uploadedAt?: string }>;
  onVideoSelect: (videoUrl: string, videoList?: Array<{ url: string; filename: string; uploadedAt?: string }>) => void;
}) {
  const [videos, setVideos] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewFailedUrl, setPreviewFailedUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  // baseUrl'i doğru oluştur - http://localhost:5001 formatında olmalı
  let baseUrl = '';
  if (API_URL.includes('://')) {
    // http:// veya https:// içeriyorsa
    baseUrl = API_URL.replace(/\/api\/?$/, '');
  } else {
    // Sadece localhost:5001/api gibi bir format ise
    baseUrl = API_URL.startsWith('localhost') ? `http://${API_URL.replace(/\/api\/?$/, '')}` : API_URL.replace(/\/api\/?$/, '');
  }

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      // Veritabanından video kategorisindeki tüm aktif videoları çek
      const response = await getAllImages({ category: 'video', isActive: true });
      setVideos(response.images || []);
      
      // availableVideos'u da güncelle (backward compatibility)
      const videoList = (response.images || []).map(img => {
        // URL'yi düzelt - hem /uploads/general/ hem de /uploads/videos/ destekle
        let videoUrl = img.url || '';
        if (!videoUrl.startsWith('http')) {
          if (videoUrl.startsWith('/uploads/')) {
            videoUrl = `${baseUrl}${videoUrl}`;
          } else if (videoUrl.startsWith('/')) {
            videoUrl = `${baseUrl}${videoUrl}`;
          } else {
            // Path formatı: "general/filename.mp4" veya "videos/filename.mp4"
            videoUrl = `${baseUrl}/uploads/${videoUrl}`;
          }
        }
        return {
          url: videoUrl,
          filename: img.filename,
          uploadedAt: img.createdAt
        };
      });
      onVideoSelect(selectedVideo || '', videoList);
    } catch (error) {
      logger.error('Video yükleme hatası:', error);
      toast.error('Videolar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, onVideoSelect, selectedVideo]);

  // Sayfa yüklendiğinde videoları çek
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type.startsWith('video/') && file.size <= 100 * 1024 * 1024) {
      setSelectedFile(file);
    } else {
      toast.error('Geçersiz dosya. Sadece video dosyaları (max 100MB) yüklenebilir.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      // Multer destination'da `req.body.type` her zaman garanti değil (multipart field sırası yüzünden).
      // Bu yüzden type'ı query param ile gönderiyoruz.
      formData.append('file', selectedFile);

      const uploadResponse = await fetch(`${API_URL}/upload/single?type=videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Dosya yükleme başarısız');

      const uploadData = await uploadResponse.json();
      
      if (!uploadData.success || !uploadData.file) {
        throw new Error('Dosya yükleme başarısız');
      }

      // URL formatını kontrol et ve düzelt
      let videoUrl = uploadData.file.url;
      if (!videoUrl.startsWith('http')) {
        // Relative URL ise baseUrl ile birleştir
        if (videoUrl.startsWith('/uploads/')) {
          videoUrl = `${baseUrl}${videoUrl}`;
        } else if (videoUrl.startsWith('/')) {
          videoUrl = `${baseUrl}${videoUrl}`;
        } else {
          videoUrl = `${baseUrl}/uploads/${videoUrl}`;
        }
      }
      
      // Video path'ini düzelt (DB'ye kaydetmek için)
      // Path formatı: "videos/filename.mp4" (type: 'videos' olduğu için)
      const imagePath = uploadData.file.url.replace(/^\/uploads\//, '');
      
      // Veritabanına video olarak kaydet
      const newVideoImage = await createImage({
        filename: uploadData.file.filename,
        originalName: uploadData.file.originalname,
        path: imagePath,
        url: uploadData.file.url,
        category: 'video',
        order: videos.length,
        isActive: true,
      });
      
      // Yeni videoyu havuza ekle ve otomatik olarak seç
      const updatedVideos = [...videos, newVideoImage];
      setVideos(updatedVideos);
      
      // availableVideos formatına çevir - URL'leri düzelt
      const videoList = updatedVideos.map(img => {
        let imgUrl = img.url || '';
        if (!imgUrl.startsWith('http')) {
          if (imgUrl.startsWith('/uploads/')) {
            imgUrl = `${baseUrl}${imgUrl}`;
          } else if (imgUrl.startsWith('/')) {
            imgUrl = `${baseUrl}${imgUrl}`;
          } else {
            imgUrl = `${baseUrl}/uploads/${imgUrl}`;
          }
        }
        return {
          url: imgUrl,
          filename: img.filename,
          uploadedAt: img.createdAt
        };
      });
      
      // Veritabanına kaydetmek için video ID kullan
      const videoIdForDb = newVideoImage._id || newVideoImage.id || '';
      onVideoSelect(videoIdForDb, videoList); // Video ID'yi kaydet
      
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Video başarıyla yüklendi ve otomatik olarak seçildi');
    } catch (error: any) {
      toast.error(error.message || 'Video yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (video: SiteImage) => {
    if (!confirm('Bu videoyu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const videoId = video._id || video.id;
      if (!videoId) {
        throw new Error('Video ID bulunamadı');
      }

      // Veritabanından sil (bu aynı zamanda fiziksel dosyayı da siler)
      await deleteImage(videoId);

      // Videoyu havuzdan çıkar
      const updatedVideos = videos.filter(v => (v._id || v.id) !== videoId);
      setVideos(updatedVideos);
      
      // Video URL'ini oluştur - hem /uploads/general/ hem de /uploads/videos/ destekle
      let videoUrl = video.url || '';
      if (!videoUrl.startsWith('http')) {
        if (videoUrl.startsWith('/uploads/')) {
          videoUrl = `${baseUrl}${videoUrl}`;
        } else if (videoUrl.startsWith('/')) {
          videoUrl = `${baseUrl}${videoUrl}`;
        } else {
          videoUrl = `${baseUrl}/uploads/${videoUrl}`;
        }
      }
      
      // Video listesini oluştur
      const createVideoList = (videos: SiteImage[]) => {
        return videos.map(img => {
          let imgUrl = img.url || '';
          if (!imgUrl.startsWith('http')) {
            if (imgUrl.startsWith('/uploads/')) {
              imgUrl = `${baseUrl}${imgUrl}`;
            } else if (imgUrl.startsWith('/')) {
              imgUrl = `${baseUrl}${imgUrl}`;
            } else {
              imgUrl = `${baseUrl}/uploads/${imgUrl}`;
            }
          }
          return {
            url: imgUrl,
            filename: img.filename,
            uploadedAt: img.createdAt
          };
        });
      };
      
      // Eğer silinen video seçiliyse, seçimi kaldır
      // selectedVideo artık video ID olabilir, videoUrl ile karşılaştır
      if (selectedVideo === videoId || selectedVideo === videoUrl) {
        onVideoSelect('', createVideoList(updatedVideos));
      } else {
        // Sadece video listesini güncelle
        onVideoSelect(selectedVideo || '', createVideoList(updatedVideos));
      }
      
      toast.success('Video başarıyla silindi');
    } catch (error: any) {
      toast.error(error.message || 'Video silinirken bir hata oluştu');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Başlık ve Seçili Video */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Arkaplan Video Yönetimi</h3>
          {selectedVideo && (
            <span className="px-2 py-1 text-xs font-medium bg-[#0066CC] dark:bg-primary-light text-white rounded-full">
              Aktif
            </span>
          )}
        </div>
        
        {/* Seçili Video Önizleme - Büyük Thumbnail */}
        {selectedVideo ? (() => {
          const isObjectId = (value: string) => /^[a-f0-9]{24}$/i.test(value);

          const selectedVideoObj = videos.find(v => {
            const videoId = v._id || v.id || '';
            const videoUrl = v.url.startsWith('http') 
              ? v.url 
              : `${baseUrl}${v.url.startsWith('/') ? '' : '/'}${v.url}`;
            return selectedVideo === videoId || selectedVideo === videoUrl || selectedVideo.includes(v.url);
          });

          // ObjectId olup listede bulunamıyorsa yanlış URL üretmeyelim (http://localhost:5001/<id> gibi)
          if (isObjectId(selectedVideo) && !selectedVideoObj) {
            return (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Seçili video bulunamadı (muhtemelen silinmiş veya URL eşleşmiyor).
                </p>
              </div>
            );
          }

          const previewUrl =
            selectedVideoObj
              ? (selectedVideoObj.url?.startsWith('http')
                  ? selectedVideoObj.url
                  : `${baseUrl}${selectedVideoObj.url?.startsWith('/') ? '' : '/'}${selectedVideoObj.url}`)
              : (selectedVideo.startsWith('http')
                  ? selectedVideo
                  : selectedVideo.startsWith('/uploads/')
                      ? `${baseUrl}${selectedVideo}`
                      : selectedVideo.startsWith('/')
                          ? `${baseUrl}${selectedVideo}`
                          : `${baseUrl}/uploads/${selectedVideo}`);

          // 404/failed durumda tekrar tekrar istek atmasın
          if (previewFailedUrl === previewUrl) {
            return (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Video önizlemesi yüklenemedi (404 / erişim yok).
                </p>
              </div>
            );
          }
          
          return (
            <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#0066CC] dark:border-primary-light shadow-lg overflow-hidden">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                <video
                  src={previewUrl}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onError={(e) => {
                    // Log spam'i engelle: aynı URL için bir kere fail state'e düşür
                    if (previewFailedUrl !== previewUrl) {
                      logger.warn('Video önizleme yüklenemedi:', previewUrl);
                      setPreviewFailedUrl(previewUrl);
                    }
                  }}
                  onLoadedMetadata={(e) => {
                    const target = e.target as HTMLVideoElement;
                    target.currentTime = 1;
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-[#0066CC] dark:text-primary-light ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-[#0066CC] dark:bg-primary-light text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                  ✓ Seçili Video
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
                  {selectedVideoObj?.originalName || selectedVideoObj?.filename || selectedVideo.split('/').pop() || 'Video'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const videoList = videos.map(img => {
                      const url = img.url.startsWith('http') 
                        ? img.url 
                        : `${baseUrl}${img.url.startsWith('/') ? '' : '/'}${img.url}`;
                      return {
                        url,
                        filename: img.filename,
                        uploadedAt: img.createdAt
                      };
                    });
                    onVideoSelect('', videoList);
                  }}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                >
                  Seçimi Kaldır
                </button>
              </div>
            </div>
          );
        })() : (
          <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Henüz video seçilmedi</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Aşağıdan bir video seçin veya yeni video yükleyin</p>
          </div>
        )}
      </div>

      {/* Video Yükleme - Kompakt */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="flex-1 text-sm text-gray-500 dark:text-gray-400
              file:mr-3 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-[#0066CC] dark:file:bg-primary-light file:text-white
              hover:file:bg-[#0055AA] dark:hover:file:bg-primary
              file:cursor-pointer"
          />
          {selectedFile && (
            <>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Yükleniyor...
                  </span>
                ) : (
                  'Yükle'
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Video Havuzu */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Video Havuzu</h4>
          {videos.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {videos.length} video
            </span>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-2">
            {videos.map((video) => {
              const videoUrl = video.url.startsWith('http') 
                ? video.url 
                : `${baseUrl}${video.url.startsWith('/') ? '' : '/'}${video.url}`;
              
              // Seçili video kontrolü - hem tam URL hem de dosya adına göre
              const videoFilename = video.url.split('/').pop() || '';
              const selectedFilename = selectedVideo?.split('/').pop() || '';
              const videoId = video._id || video.id || '';
              const isSelected: boolean = Boolean(
                selectedVideo === videoUrl 
                || selectedVideo === videoId
                || (selectedVideo && typeof selectedVideo === 'string' && selectedVideo.includes(videoFilename))
                || (selectedVideo && typeof selectedVideo === 'string' && selectedVideo.includes(video.url))
                || (selectedFilename && selectedFilename === videoFilename)
              );
              
              return (
                <VideoThumbnail
                  key={video._id || video.id}
                  video={video}
                  videoUrl={videoUrl}
                  baseUrl={baseUrl}
                  isSelected={isSelected}
                  onSelect={() => {
                    // Veritabanına kaydetmek için video ID kullan (en güvenilir yöntem)
                    const videoId = video._id || video.id || '';
                    const videoList = videos.map(img => {
                      const url = img.url.startsWith('http') 
                        ? img.url 
                        : `${baseUrl}${img.url.startsWith('/') ? '' : '/'}${img.url}`;
                      return {
                        url,
                        filename: img.filename,
                        uploadedAt: img.createdAt
                      };
                    });
                    logger.debug('Video seçiliyor:', videoId, 'Seçili video:', selectedVideo);
                    onVideoSelect(videoId, videoList); // Video ID'yi kaydet
                    toast.success('Video seçildi. Değişiklikleri kaydetmek için "Kaydet" butonuna tıklayın.');
                  }}
                  onDelete={() => handleDelete(video)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Henüz video yüklenmedi</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Yukarıdan video yükleyerek başlayın</p>
          </div>
        )}
      </div>
    </div>
  );
}

// About Image Selector Bileşeni
function AboutImageSelector({ 
  selectedImageId, 
  onImageSelect 
}: { 
  selectedImageId?: string; 
  onImageSelect: (imageId: string) => void;
}) {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showModal) {
      fetchImages();
    }
  }, [showModal]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await getAllImages({ category: 'about' });
      setImages(response.images || []);
    } catch (error) {
      logger.error('Resim yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const validFiles: File[] = [];
    files.forEach((file) => {
      if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
        validFiles.push(file);
      }
    });
    
    setSelectedFiles(validFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('type', 'site-images');

      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/upload/multiple`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Dosya yükleme başarısız');

      const uploadData = await uploadResponse.json();
      
      if (!uploadData.success || !uploadData.files || uploadData.files.length === 0) {
        throw new Error('Dosya yükleme başarısız');
      }

      const uploadPromises = uploadData.files.map(async (fileData: any) => {
        const imagePath = fileData.url.replace(/^\/uploads\//, '');
        return createImage({
          filename: fileData.filename,
          originalName: fileData.originalname,
          path: imagePath,
          url: fileData.url,
          category: 'about',
          order: images.length,
          isActive: true,
        });
      });

      const createdImages = await Promise.all(uploadPromises);
      
      if (createdImages.length > 0 && createdImages[0]._id) {
        onImageSelect(createdImages[0]._id);
      }
      
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchImages();
    } catch (error: any) {
      toast.error(error.message || 'Resim yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const selectedImage = images.find(img => (img._id || img.id) === selectedImageId);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Hakkımızda Görseli
      </label>
      
      {selectedImage ? (
        <div className="mb-4 p-4 border-2 border-[#0066CC] dark:border-primary-light rounded-xl bg-white dark:bg-gray-900 shadow-lg">
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-3">
            <LazyImage
              src={getImageUrl({ imageId: selectedImageId, fallback: '' })}
              alt={selectedImage.originalName}
              fill
              objectFit="cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={85}
            />
            <div className="absolute top-2 right-2 bg-[#0066CC] dark:bg-primary-light text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
              ✓ Seçili
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{selectedImage.originalName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {selectedImage.category || 'Görsel'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onImageSelect('')}
              className="ml-3 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              Kaldır
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center bg-gray-50 dark:bg-gray-900">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Henüz görsel seçilmedi</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Aşağıdan bir görsel seçin veya yeni görsel yükleyin</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
      >
        {selectedImage ? 'Görseli Değiştir' : 'Görsel Seç veya Yükle'}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
              onClick={() => !uploading && setShowModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Hakkımızda Görseli Seç
                </h3>
                
                <div className="mb-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#0066CC] dark:file:bg-primary-light file:text-white
                      hover:file:bg-[#0055AA] dark:hover:file:bg-primary
                      file:cursor-pointer"
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedFiles.length} dosya seçildi
                      </p>
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploading}
                        className="mt-2 px-3 py-1 bg-[#0066CC] dark:bg-primary-light text-white rounded text-sm hover:bg-[#0055AA] dark:hover:bg-primary disabled:opacity-50"
                      >
                        {uploading ? 'Yükleniyor...' : 'Yükle'}
                      </button>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-2">
                    {images.map((image) => {
                      const imageId = image._id || image.id || '';
                      const isSelected = selectedImageId === imageId;
                      return (
                        <div
                          key={imageId}
                          onClick={() => {
                            onImageSelect(imageId);
                            setShowModal(false);
                          }}
                          className={`cursor-pointer border-2 rounded-xl overflow-hidden transition-all modern-card group ${
                            isSelected
                              ? 'border-[#0066CC] dark:border-primary-light ring-2 ring-[#0066CC] dark:ring-primary-light shadow-lg scale-105'
                              : 'border-gray-200 dark:border-gray-700 hover:border-[#0066CC]/50 dark:hover:border-primary-light/50 hover:shadow-md'
                          }`}
                        >
                          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                            <LazyImage
                              src={getImageUrl({ imageId, fallback: '' })}
                              alt={image.originalName}
                              fill
                              objectFit="cover"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                              quality={80}
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-[#0066CC] dark:bg-primary-light text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                                ✓
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-lg">
                                  <svg className="w-5 h-5 text-[#0066CC] dark:text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-2 bg-white dark:bg-gray-800">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {image.originalName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {image.category || 'Görsel'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {images.length === 0 && (
                      <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="font-medium">Henüz görsel yüklenmemiş</p>
                        <p className="text-sm mt-1">Yukarıdan görsel yükleyerek başlayın</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// About Form Bileşeni
function AboutForm({ content, onSave, saving }: { 
  content?: AboutContent; 
  onSave: (data: AboutContent) => void; 
  saving: boolean;
}) {
  const [formData, setFormData] = useState<AboutContent>({
    title: content?.title || 'SK Production Hakkında',
    description: content?.description || '',
    image: content?.image || '',
    stats: content?.stats || [
      { label: 'Tamamlanan Proje', value: '250+' },
      { label: 'Yıllık Deneyim', value: '12+' },
      { label: 'Profesyonel Ekipman', value: '50+' },
    ],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addStat = () => {
    setFormData({
      ...formData,
      stats: [...formData.stats, { label: '', value: '' }],
    });
  };

  const removeStat = (index: number) => {
    setFormData({
      ...formData,
      stats: formData.stats.filter((_, i) => i !== index),
    });
  };

  const updateStat = (index: number, field: 'label' | 'value', value: string) => {
    const updated = [...formData.stats];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, stats: updated });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hakkımızda</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Başlık
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Açıklama
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          placeholder="Hakkımızda metni"
        />
      </div>

      <AboutImageSelector
        selectedImageId={formData.image}
        onImageSelect={(imageId) => setFormData({ ...formData, image: imageId })}
      />

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            İstatistikler
          </label>
          <button
            type="button"
            onClick={addStat}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + İstatistik Ekle
          </button>
        </div>
        {formData.stats.map((stat, index) => (
          <div key={index} className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">İstatistik {index + 1}</span>
              {formData.stats.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStat(index)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Sil
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={stat.label}
                onChange={(e) => updateStat(index, 'label', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                placeholder="Etiket (örn: Tamamlanan Proje)"
              />
              <input
                type="text"
                value={stat.value}
                onChange={(e) => updateStat(index, 'value', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                placeholder="Değer (örn: 250+)"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary transition-colors disabled:opacity-50"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </form>
  );
}

// Contact Form Bileşeni
function ContactForm({ content, onSave, saving }: { 
  content?: ContactInfo; 
  onSave: (data: ContactInfo) => void; 
  saving: boolean;
}) {
  const [formData, setFormData] = useState<ContactInfo>({
    address: content?.address || 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
    phone: content?.phone || '+90 532 123 4567',
    email: content?.email || 'info@skpro.com.tr',
    latitude: content?.latitude || 41.057984,
    longitude: content?.longitude || 28.987117,
    mapLink: content?.mapLink || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">İletişim Bilgileri</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Adres
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Telefon
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            E-posta
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enlem (Latitude)
          </label>
          <input
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Boylam (Longitude)
          </label>
          <input
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Harita Linki (Opsiyonel)
        </label>
        <input
          type="text"
          value={formData.mapLink}
          onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          placeholder="Google Maps linki"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary transition-colors disabled:opacity-50"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </form>
  );
}

// Footer Form Bileşeni
function FooterForm({ content, onSave, saving }: { 
  content?: FooterContent; 
  onSave: (data: FooterContent) => void; 
  saving: boolean;
}) {
  const [formData, setFormData] = useState<FooterContent>({
    copyright: content?.copyright || '© 2024 SK Production. Tüm hakları saklıdır.',
    links: content?.links || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addLink = () => {
    setFormData({
      ...formData,
      links: [...(formData.links || []), { text: '', url: '' }],
    });
  };

  const removeLink = (index: number) => {
    setFormData({
      ...formData,
      links: formData.links?.filter((_, i) => i !== index) || [],
    });
  };

  const updateLink = (index: number, field: 'text' | 'url', value: string) => {
    const updated = [...(formData.links || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, links: updated });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Footer</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Telif Hakkı Metni
        </label>
        <input
          type="text"
          value={formData.copyright}
          onChange={(e) => setFormData({ ...formData, copyright: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Linkler
          </label>
          <button
            type="button"
            onClick={addLink}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Link Ekle
          </button>
        </div>
        {(formData.links || []).map((link, index) => (
          <div key={index} className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Link {index + 1}</span>
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Sil
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={link.text}
                onChange={(e) => updateLink(index, 'text', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                placeholder="Link metni"
              />
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(index, 'url', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                placeholder="URL"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary transition-colors disabled:opacity-50"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </form>
  );
}

// Social Form Bileşeni
function SocialForm({ content, onSave, saving }: { 
  content?: SocialMedia[]; 
  onSave: (data: SocialMedia[]) => void; 
  saving: boolean;
}) {
  const [socials, setSocials] = useState<SocialMedia[]>(content || [
    { platform: 'Facebook', url: '', icon: '' },
    { platform: 'Instagram', url: '', icon: '' },
    { platform: 'LinkedIn', url: '', icon: '' },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(socials);
  };

  const addSocial = () => {
    setSocials([...socials, { platform: '', url: '', icon: '' }]);
  };

  const removeSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const updateSocial = (index: number, field: keyof SocialMedia, value: string) => {
    const updated = [...socials];
    updated[index] = { ...updated[index], [field]: value };
    setSocials(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sosyal Medya</h2>
        <button
          type="button"
          onClick={addSocial}
          className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          + Platform Ekle
        </button>
      </div>

      {socials.map((social, index) => (
        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900 dark:text-white">Platform {index + 1}</h3>
            <button
              type="button"
              onClick={() => removeSocial(index)}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Sil
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Platform Adı
            </label>
            <input
              type="text"
              value={social.platform}
              onChange={(e) => updateSocial(index, 'platform', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Facebook, Instagram, LinkedIn, vb."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL
            </label>
            <input
              type="url"
              value={social.url}
              onChange={(e) => updateSocial(index, 'url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              İkon (Opsiyonel)
            </label>
            <input
              type="text"
              value={social.icon}
              onChange={(e) => updateSocial(index, 'icon', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="İkon adı veya URL"
            />
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary transition-colors disabled:opacity-50"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </form>
  );
}

