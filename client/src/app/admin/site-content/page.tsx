'use client';

import React, { useState, useEffect } from 'react';
import { getAllImages, createImage, SiteImage } from '@/services/siteImageService';
import { 
  getAllContents, 
  updateContentBySection, 
  createContent,
  SiteContent,
  HeroContent,
  ServiceItem,
  EquipmentCategory,
  AboutContent,
  ContactInfo,
  FooterContent,
  SocialMedia
} from '@/services/siteContentService';
import { toast } from 'react-toastify';

export default function SiteContentPage() {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [saving, setSaving] = useState(false);

  const sections = [
    { key: 'hero', name: 'Hero Bölümü', icon: '🏠' },
    { key: 'services', name: 'Hizmetler', icon: '⚙️' },
    { key: 'equipment', name: 'Ekipmanlar', icon: '🔧' },
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
      console.error('İçerik yükleme hatası:', error);
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
      console.error('Kaydetme hatası:', error);
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
      case 'services':
        return <ServicesForm 
          content={currentContent?.content as ServiceItem[]} 
          onSave={(data) => handleSave('services', data)} 
          saving={saving}
        />;
      case 'equipment':
        return <EquipmentForm 
          content={currentContent?.content as EquipmentCategory[]} 
          onSave={(data) => handleSave('equipment', data)} 
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
    backgroundVideo: content?.backgroundVideo || '',
    backgroundImage: content?.backgroundImage || '',
    rotatingTexts: content?.rotatingTexts || [],
  });

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
          Arkaplan Video URL
        </label>
        <input
          type="text"
          value={formData.backgroundVideo}
          onChange={(e) => setFormData({ ...formData, backgroundVideo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          placeholder="/videos/hero-background.mp4"
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
      console.error('Resim yükleme hatası:', error);
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
      console.error('Yükleme hatası:', error);
      toast.error(error.message || 'Resim yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const selectedImage = images.find(img => (img._id || img.id) === selectedImageId);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const baseUrl = API_URL.endsWith('/api') ? API_URL.replace(/\/api$/, '') : API_URL.replace(/\/api\/?$/, '');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Hakkımızda Görseli
      </label>
      
      {selectedImage ? (
        <div className="mb-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <img
              src={`${baseUrl}/api/site-images/public/${selectedImageId}/image`}
              alt={selectedImage.originalName}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedImage.originalName}</p>
              <button
                type="button"
                onClick={() => onImageSelect('')}
                className="text-xs text-red-600 hover:text-red-700 mt-1"
              >
                Seçimi Kaldır
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-3 p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Henüz görsel seçilmedi</p>
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
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
                          className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                            isSelected
                              ? 'border-[#0066CC] dark:border-primary-light ring-2 ring-[#0066CC] dark:ring-primary-light'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <img
                            src={`${baseUrl}/api/site-images/public/${imageId}/image`}
                            alt={image.originalName}
                            className="w-full h-24 object-cover"
                          />
                          <p className="p-2 text-xs text-gray-600 dark:text-gray-400 truncate">
                            {image.originalName}
                          </p>
                        </div>
                      );
                    })}
                    {images.length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                        Henüz görsel yüklenmemiş
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

