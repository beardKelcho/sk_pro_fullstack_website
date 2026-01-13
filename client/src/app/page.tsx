'use client';

import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import Carousel from '@/components/common/Carousel';
import ServiceCard from '@/components/common/ServiceCard';
import EquipmentList from '@/components/common/EquipmentList';
import Icon from '@/components/common/Icon';
import ContactForm from '@/components/common/ContactForm';
import Map from '@/components/common/Map';
import { getAllImages, SiteImage } from '@/services/siteImageService';
import { 
  getAllContents, 
  getContentBySection,
  HeroContent,
  ServiceItem,
  EquipmentCategory,
  AboutContent,
  ContactInfo
} from '@/services/siteContentService';

export default function Home() {
  // Site içeriği state'leri
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [equipment, setEquipment] = useState<EquipmentCategory[]>([]);
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Hero bölümündeki değişen metinler için state
  const [textIndex, setTextIndex] = useState(0);
  
  // Carousel için resim dizileri
  const [topImages, setTopImages] = useState<SiteImage[]>([]);
  const [bottomImages, setBottomImages] = useState<SiteImage[]>([]);
  const [allProjectImages, setAllProjectImages] = useState<SiteImage[]>([]);
  
  // Modal/Lightbox için state'ler
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SiteImage | null>(null);
  const [isTopCarousel, setIsTopCarousel] = useState(true);
  // Carousel artık sürekli akacak, pause özelliği kaldırıldı
  const carouselPaused = false;
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Konum bilgileri (fallback)
  const defaultLocation = {
    address: "Zincirlidere Caddesi No:52/C Şişli/İstanbul",
    lat: 41.057984,
    lng: 28.987117
  };
  
  const location = contactInfo ? {
    address: contactInfo.address,
    lat: contactInfo.latitude || defaultLocation.lat,
    lng: contactInfo.longitude || defaultLocation.lng
  } : defaultLocation;

  // Navigasyon fonksiyonu
  const openMobileNavigation = () => {
    // Mobil cihaz kontrolü
    if (typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      // Mobil cihazlarda kullanılabilecek navigasyon URL'leri
      const navigationApps = [
        {
          name: 'Google Maps',
          url: `google.navigation:q=${location.lat},${location.lng}`
        },
        {
          name: 'Apple Maps',
          url: `maps://maps.apple.com/?daddr=${location.lat},${location.lng}`
        },
        {
          name: 'Yandex Maps',
          url: `yandexnavi://build_route_on_map?lat_to=${location.lat}&lon_to=${location.lng}`
        },
        {
          name: 'Waze',
          url: `waze://?ll=${location.lat},${location.lng}&navigate=yes`
        }
      ];

      // Kullanıcıya seçenek sunmak için URL'leri açma
      navigationApps.forEach(app => {
        window.open(app.url, '_blank');
      });
    } else {
      // Masaüstü için varsayılan Google Maps
      window.open(`https://www.google.com/maps/place/${encodeURIComponent(location.address)}`, '_blank');
    }
  };

  // Sayfa yüklendiğinde veritabanından resimleri çek
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Public endpoint'ten aktif proje resimlerini çek
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        // Cache-busting için timestamp ekle - CORS sorununu önlemek için header'ları kaldırdık
        const response = await fetch(`${API_URL}/site-images/public?category=project&isActive=true&_t=${Date.now()}`, {
          cache: 'no-store',
          // CORS sorununu önlemek için custom header'ları kaldırdık
        });
        
        if (response.ok) {
          const data = await response.json();
          // API response formatını kontrol et - hem data.images hem de data olabilir
          const images = data.images || data || [];
          
          console.log('API Response:', data);
          console.log('API\'den gelen resimler:', images.length, images);
          
          // Aktif proje resimlerini al ve geçerli URL'ye sahip olanları filtrele
          const activeImages = images.filter((img: SiteImage) => {
            // Temel kontroller
            if (!img.isActive) {
              console.log('Resim aktif değil:', img);
              return false;
            }
            
            if (img.category !== 'project') {
              console.log('Resim kategori uyumsuz:', img.category, img);
              return false;
            }
            
            // URL veya path kontrolü - en az birisi olmalı
            if (!img.url && !img.path && !img.filename) {
              console.warn('Resim URL/path/filename eksik:', img);
              return false;
            }
            
            // URL formatını kontrol et - daha esnek
            let imageUrl = img.url || '';
            if (!imageUrl && img.path) {
              imageUrl = img.path;
            }
            if (!imageUrl && img.filename) {
              imageUrl = `/uploads/site-images/${img.filename}`;
            }
            
            // Boş veya geçersiz URL kontrolü - daha esnek
            // Eğer filename varsa, URL oluşturulabilir, bu yüzden sadece tamamen boş olanları filtrele
            if (!imageUrl || imageUrl.trim() === '') {
              // Eğer filename varsa, URL oluşturulabilir, bu yüzden geçerli say
              if (img.filename) {
                imageUrl = `/uploads/site-images/${img.filename}`;
                console.log('Filename\'den URL oluşturuldu:', imageUrl);
              } else {
                console.warn('Resim URL geçersiz ve filename yok:', imageUrl, img);
                return false;
              }
            }
            
            console.log('Resim geçerli:', img.originalName || img.filename, 'URL:', imageUrl);
            return true;
          });
          
          console.log('Filtrelenmiş aktif resimler:', activeImages.length, activeImages);
          
          setAllProjectImages(activeImages);
          
          // Veritabanından gelen resimleri kullan (fallback yok)
          if (activeImages.length > 0) {
            // Resimleri order'a göre sırala (sabit sıra)
            const sortedImages = [...activeImages].sort((a, b) => a.order - b.order);
            
            // Tüm aktif resimleri her iki carousel'de de göster
            // Aynı anda aynı resim görünmemesi için alt carousel'i yarı kadar kaydır
            const offset = Math.ceil(sortedImages.length / 2);
            
            // Üst carousel: tüm resimler
            const topImagesArray = [...sortedImages];
            
            // Alt carousel: tüm resimler ama yarı kadar kaydırılmış (offset ile başla)
            const bottomImagesArray = sortedImages.length > 1
              ? [...sortedImages.slice(offset), ...sortedImages.slice(0, offset)]
              : [];
            
            // Eğer tek resim varsa, sadece üst carousel'de göster
            if (sortedImages.length === 1) {
              setTopImages(topImagesArray);
              setBottomImages([]);
            } else {
              setTopImages(topImagesArray);
              setBottomImages(bottomImagesArray);
            }
            
            // Debug: Resim sayılarını konsola yazdır
            console.log(`Top images: ${topImagesArray.length}, Bottom images: ${bottomImagesArray.length}, Total active: ${sortedImages.length}`);
          } else {
            // Veritabanında resim yoksa boş bırak
            console.warn('Veritabanında aktif proje resmi bulunamadı. Lütfen resimleri yükleyin.');
            setTopImages([]);
            setBottomImages([]);
          }
        } else {
          // API hatası durumunda boş bırak
          console.error('Resimler yüklenirken bir hata oluştu. Status:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Hata detayı:', errorText);
          setTopImages([]);
          setBottomImages([]);
        }
      } catch (error) {
        console.error('Resim yükleme hatası:', error);
        // Hata durumunda boş bırak
        setTopImages([]);
        setBottomImages([]);
      }
    };
    
    fetchImages();
    
    // Her 10 saniyede bir resimleri yeniden yükle (yeni eklenen resimler için)
    const interval = setInterval(() => {
      fetchImages();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Site içeriklerini yükle
  useEffect(() => {
    const fetchSiteContent = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        
        // Tüm içerikleri paralel olarak çek
        const [heroRes, servicesRes, equipmentRes, aboutRes, contactRes] = await Promise.allSettled([
          fetch(`${API_URL}/site-content/public/hero`),
          fetch(`${API_URL}/site-content/public/services`),
          fetch(`${API_URL}/site-content/public/equipment`),
          fetch(`${API_URL}/site-content/public/about`),
          fetch(`${API_URL}/site-content/public/contact`),
        ]);

        // Hero içeriği
        if (heroRes.status === 'fulfilled' && heroRes.value.ok) {
          const heroData = await heroRes.value.json();
          if (heroData.content) {
            setHeroContent(heroData.content.content as HeroContent);
          }
        }

        // Hizmetler
        if (servicesRes.status === 'fulfilled' && servicesRes.value.ok) {
          const servicesData = await servicesRes.value.json();
          if (servicesData.content) {
            setServices(servicesData.content.content as ServiceItem[]);
          }
        }

        // Ekipmanlar
        if (equipmentRes.status === 'fulfilled' && equipmentRes.value.ok) {
          const equipmentData = await equipmentRes.value.json();
          if (equipmentData.content) {
            setEquipment(equipmentData.content.content as EquipmentCategory[]);
          }
        }

        // Hakkımızda
        if (aboutRes.status === 'fulfilled' && aboutRes.value.ok) {
          const aboutData = await aboutRes.value.json();
          if (aboutData.content) {
            setAboutContent(aboutData.content.content as AboutContent);
          }
        }

        // İletişim
        if (contactRes.status === 'fulfilled' && contactRes.value.ok) {
          const contactData = await contactRes.value.json();
          if (contactData.content) {
            setContactInfo(contactData.content.content as ContactInfo);
          }
        }
      } catch (error) {
        console.error('Site içerik yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteContent();
  }, []);

  // Hero rotating texts için effect
  useEffect(() => {
    if (!heroContent?.rotatingTexts || heroContent.rotatingTexts.length === 0) return;
    
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex + 1) % heroContent.rotatingTexts!.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroContent]);
  
  // Resme tıklama işleyicisi
  const handleImageClick = (image: SiteImage, isTop: boolean) => {
    setSelectedImage(image);
    setIsTopCarousel(isTop);
    setIsModalOpen(true);
    // Carousel artık durmuyor, sürekli akıyor
  };
  
  // Modal kapatma işleyicisi
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    // Carousel artık durmuyor, sürekli akıyor
  };
  
  // Modal dışına tıklandığında kapatma
  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };
  
  // Klavye ile gezinme
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen || !selectedImage) return;
      
      const currentImages = isTopCarousel ? topImages : bottomImages;
      const currentIndex = currentImages.findIndex(img => 
        (img._id || img.id) === (selectedImage._id || selectedImage.id)
      );
      
      if (e.key === 'ArrowRight') {
        // Sonraki resim
        const nextIndex = (currentIndex + 1) % currentImages.length;
        setSelectedImage(currentImages[nextIndex]);
      } else if (e.key === 'ArrowLeft') {
        // Önceki resim
        const prevIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        setSelectedImage(currentImages[prevIndex]);
      } else if (e.key === 'Escape') {
        // ESC tuşu ile kapatma
        closeModal();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedImage, isTopCarousel, topImages, bottomImages]);

  return (
    <MainLayout>
      {/* Video Arkaplan - Tüm sayfa boyunca */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
        {heroContent?.backgroundVideo ? (
          <video 
            ref={(video) => {
              if (video) {
                // Perfect loop için video sonuna geldiğinde başa dön
                video.addEventListener('ended', () => {
                  video.currentTime = 0;
                  video.play();
                });
              }
            }}
            className="absolute w-full h-full object-cover" 
            autoPlay 
            loop 
            muted 
            playsInline
            preload="auto"
            poster={heroContent.backgroundImage || "/images/hero-bg.jpg"}
          >
            <source src={heroContent.backgroundVideo} type="video/mp4" />
            {heroContent.backgroundImage && (
              <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center"></div>
            )}
          </video>
        ) : (
          <video 
            ref={(video) => {
              if (video) {
                video.addEventListener('ended', () => {
                  video.currentTime = 0;
                  video.play();
                });
              }
            }}
            className="absolute w-full h-full object-cover" 
            autoPlay 
            loop 
            muted 
            playsInline
            preload="auto"
            poster="/images/hero-bg.jpg"
          >
            <source src="/videos/hero-background.mp4" type="video/mp4" />
            <source src="/videos/hero-background.webm" type="video/webm" />
            <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center"></div>
          </video>
        )}
      </div>
      
      {/* Hero Bölümü - Daha modern ve etkileyici */}
      <section className="relative h-screen flex items-center justify-center z-10">
        
        <div className="container mx-auto px-4 relative z-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight h-28 flex items-center justify-center">
              {heroContent?.rotatingTexts && heroContent.rotatingTexts.length > 0 ? (
                <span key={textIndex} className="animate-fade-in-slide-up">
                  {heroContent.rotatingTexts[textIndex]}
                </span>
              ) : heroContent?.title ? (
                <span className="animate-fade-in-slide-up">
                  {heroContent.title}
                </span>
              ) : (
                <span key={textIndex} className="animate-fade-in-slide-up">
                  {textIndex === 0 ? (
                    <>Görsel <span className="text-[#0066CC] dark:text-primary-light">Mükemmellikte</span> Uzman Ekip</>
                  ) : textIndex === 1 ? (
                    <>Etkinliklerinizde <span className="text-[#0066CC] dark:text-primary-light">Profesyonel</span> Çözümler</>
                  ) : (
                    <>Medya Server ve <span className="text-[#0066CC] dark:text-primary-light">Görüntü Rejisi</span> Çözümleri</>
                  )}
                </span>
              )}
            </h1>
            {heroContent?.subtitle && (
              <p className="text-xl md:text-2xl text-gray-200 mb-4 max-w-3xl mx-auto">
                {heroContent.subtitle}
              </p>
            )}
            <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto">
              {heroContent?.description || 'SK Production olarak, kurumsal etkinlikleriniz için profesyonel görüntü rejisi ve medya server çözümleri sunuyoruz. 10 yılı aşkın deneyimimizle etkinliklerinize değer katıyoruz.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href={heroContent?.buttonLink || '#contact'} 
                className="bg-[#0066CC] dark:bg-primary-light text-white px-8 py-4 rounded-lg hover:bg-[#0055AA] dark:hover:bg-primary transition-all duration-300 text-lg font-medium shadow-lg"
              >
                {heroContent?.buttonText || 'İletişime Geçin'}
              </a>
            </div>
          </div>
        </div>
        
        {/* Scroll Down İndikatörü */}
        <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg 
            className="w-8 h-8 text-white" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Projeler Bölümü */}
      <section id="projects" className="relative py-20 bg-gray-50/10 dark:bg-dark-surface/10 backdrop-blur-[2px] overflow-hidden z-10">
        <div className="container mx-auto px-6 mb-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0A1128] dark:text-white mb-4">Projelerimiz</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Gerçekleştirdiğimiz bazı etkinlikler ve projelerimize göz atın.
            </p>
          </div>
          
          {/* Üst Sıra Carousel - Sağdan Sola */}
          <div className="mb-8">
            <Carousel
              images={topImages}
              direction="right"
              isPaused={carouselPaused}
              onImageClick={handleImageClick}
              isTop={true}
            />
          </div>
          
          {/* Alt Sıra Carousel - Soldan Sağa */}
          <div>
            <Carousel
              images={bottomImages}
              direction="left"
              isPaused={carouselPaused}
              onImageClick={handleImageClick}
              isTop={false}
            />
          </div>
        </div>
      </section>

      {/* Lightbox/Modal */}
      {isModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-300 animate-fade-in"
          onClick={handleModalBackdropClick}
        >
          <div 
            ref={modalRef}
            className="relative w-[90vw] max-w-7xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center bg-black/40 backdrop-blur-sm border border-white/10 animate-scale-in"
          >
            {/* Kapatma Butonu */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 z-10 text-white bg-black/50 rounded-full p-3 hover:bg-primary hover:rotate-90 transition-all duration-300"
            >
              <Icon name="close" className="h-7 w-7" />
            </button>

            {/* Sol Yön Tuşu */}
            <button 
              className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/50 rounded-full p-4 hover:bg-primary hover:scale-110 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                const currentImages = isTopCarousel ? topImages : bottomImages;
                const currentIndex = currentImages.findIndex(img => 
                  (img._id || img.id) === (selectedImage._id || selectedImage.id)
                );
                const prevIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
                setSelectedImage(currentImages[prevIndex]);
              }}
            >
              <Icon name="arrow-left" className="h-8 w-8" />
            </button>

            {/* Sağ Yön Tuşu */}
            <button 
              className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/50 rounded-full p-4 hover:bg-primary hover:scale-110 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                const currentImages = isTopCarousel ? topImages : bottomImages;
                const currentIndex = currentImages.findIndex(img => 
                  (img._id || img.id) === (selectedImage._id || selectedImage.id)
                );
                const nextIndex = (currentIndex + 1) % currentImages.length;
                setSelectedImage(currentImages[nextIndex]);
              }}
            >
              <Icon name="arrow-right" className="h-8 w-8" />
            </button>

            {/* Görüntü */}
            <div className="p-6 max-h-[90vh] w-full h-full flex items-center justify-center">
              {(() => {
                // Resmi ID ile serve et - veritabanı ID'si kullan
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
                // API_URL zaten /api içeriyor mu kontrol et
                const baseUrl = API_URL.endsWith('/api') ? API_URL.replace(/\/api$/, '') : API_URL.replace(/\/api\/?$/, '');
                let imageUrl = '';
                
                // Önce ID'yi kontrol et
                if (selectedImage._id || selectedImage.id) {
                  const dbId = selectedImage._id || selectedImage.id;
                  // ID ile resmi serve eden endpoint'i kullan - çift /api/ olmaması için
                  imageUrl = `${baseUrl}/api/site-images/public/${dbId}/image`;
                } else {
                  // Fallback: Eski yöntem (filename/path ile)
                  imageUrl = selectedImage.url || '';
                  if (!imageUrl && selectedImage.path) {
                    imageUrl = selectedImage.path;
                  }
                  if (!imageUrl && selectedImage.filename) {
                    imageUrl = `/uploads/site-images/${selectedImage.filename}`;
                  }
                  
                  if (!imageUrl || imageUrl.trim() === '') {
                    console.warn('Modal resim URL ve ID yok:', selectedImage);
                    return <div className="text-white">Resim yüklenemedi</div>;
                  }
                  
                  // Eğer /uploads/ ile başlıyorsa, backend URL'ine çevir
                  if (imageUrl.startsWith('/uploads/')) {
                    imageUrl = `${baseUrl}${imageUrl}`;
                  } else if (!imageUrl.startsWith('http')) {
                    if (!imageUrl.startsWith('/')) {
                      imageUrl = `/${imageUrl}`;
                    }
                    imageUrl = `${baseUrl}${imageUrl}`;
                  }
                }
                
                return (
                  <img 
                    src={imageUrl}
                    alt={selectedImage.originalName || 'Proje görseli'}
                    className="max-w-full max-h-[85vh] object-cover rounded-lg shadow-2xl"
                    onError={(e) => {
                      console.error('Modal resim yüklenemedi:', imageUrl, selectedImage);
                    }}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Hizmetler ve Ekipmanlar Bölümü */}
      <section className="relative py-20 bg-white/10 dark:bg-dark-background/10 backdrop-blur-[2px] z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Hizmetler Kısmı */}
            <div id="services" className="lg:w-1/2">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-[#0A1128] dark:text-white mb-4">Hizmetlerimiz</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                  Etkinlikleriniz için profesyonel görüntü rejisi ve medya server çözümleri sunuyoruz.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.length > 0 ? (
                  services
                    .sort((a, b) => a.order - b.order)
                    .map((service, index) => (
                      <ServiceCard
                        key={index}
                        title={service.title}
                        description={service.description}
                        icon={service.icon}
                      />
                    ))
                ) : (
                  <>
                    <ServiceCard
                      title="Görüntü Rejisi"
                      description="Profesyonel ekipmanlarımız ve uzman ekibimizle etkinlikleriniz için kusursuz görüntü rejisi hizmeti sağlıyoruz."
                      icon="video"
                    />
                    <ServiceCard
                      title="Medya Server Sistemleri"
                      description="Yüksek performanslı medya server sistemlerimiz ile etkinliklerinizde kesintisiz ve yüksek kaliteli içerik yayını."
                      icon="screen"
                    />
                    <ServiceCard
                      title="LED Ekran Yönetimi"
                      description="Farklı boyut ve çözünürlüklerdeki LED ekranlar için içerik hazırlama ve profesyonel yönetim hizmetleri."
                      icon="led"
                    />
                  </>
                )}
              </div>
            </div>
            
            {/* Ekipmanlar Kısmı */}
            <div id="equipment" className="lg:w-1/2">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-[#0A1128] dark:text-white mb-4">Ekipmanlarımız</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                  Etkinlikleriniz için kullandığımız yüksek teknoloji ekipmanlarımız ile tanışın.
                </p>
              </div>
              
              <div className="space-y-6">
                {equipment.length > 0 ? (
                  equipment
                    .sort((a, b) => a.order - b.order)
                    .map((category, index) => (
                      <EquipmentList
                        key={index}
                        title={category.title}
                        items={category.items}
                      />
                    ))
                ) : (
                  <>
                    <EquipmentList
                      title="Görüntü Rejisi Sistemleri"
                      items={[
                        {
                          name: "Analog Way Aquilon RS4",
                          description: "4K/8K çözünürlük desteği ile görüntü işleme"
                        },
                        {
                          name: "Barco E2 Gen 2",
                          description: "Gerçek 4K çözünürlük, genişletilebilir giriş/çıkış"
                        },
                        {
                          name: "Blackmagic ATEM 4 M/E Constellation HD",
                          description: "40 giriş, 24 çıkış, gelişmiş geçiş efektleri"
                        }
                      ]}
                    />
                    <EquipmentList
                      title="Medya Server Sistemleri"
                      items={[
                        {
                          name: "Dataton WATCHPAX 60",
                          description: "6 çıkışlı, yüksek performanslı"
                        },
                        {
                          name: "Disguise 4x4pro",
                          description: "Gerçek zamanlı render, AR/VR desteği"
                        },
                        {
                          name: "Resolume Arena 7",
                          description: "Canlı performans için video loop ve efektler"
                        }
                      ]}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hakkımızda Bölümü */}
      <section id="about" className="relative py-20 bg-gray-50/10 dark:bg-dark-surface/10 backdrop-blur-[2px] z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-[#0A1128] dark:text-white mb-6">
                {aboutContent?.title || 'SK Production Hakkında'}
              </h2>
              {aboutContent?.description ? (
                <div className="text-gray-600 dark:text-gray-300 mb-6 text-lg whitespace-pre-line">
                  {aboutContent.description}
                </div>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                    SK Production, profesyonel etkinlikler için görüntü rejisi ve medya server çözümleri sunan uzman bir ekiptir.
                    Analog Way Aquilon, Dataton Watchpax ve Resolume Arena 7 gibi son teknoloji ekipmanlarla hizmet veriyoruz.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                    10 yılı aşkın deneyime sahip ekibimiz, kurumsal etkinlikler, konserler, ürün lansmanları, 
                    sahne gösterileri ve daha birçok alanda yüzlerce projeye imza atmıştır.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                    En son teknoloji ekipmanlarımız ve yaratıcı çözümlerimiz ile etkinliklerinize 
                    görsel mükemmellik katmayı hedefliyoruz. Her projede mükemmellik ve profesyonellik 
                    görsel mükemmellik katmayı hedefliyoruz.
                  </p>
                </>
              )}
              <div className="flex gap-4">
                {(aboutContent?.stats && aboutContent.stats.length > 0) ? (
                  aboutContent.stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <span className="block text-4xl font-bold text-[#0066CC] dark:text-primary-light">{stat.value}</span>
                      <span className="text-gray-600 dark:text-gray-300">{stat.label}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="text-center">
                      <span className="block text-4xl font-bold text-[#0066CC] dark:text-primary-light">250+</span>
                      <span className="text-gray-600 dark:text-gray-300">Tamamlanan Proje</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-4xl font-bold text-[#0066CC] dark:text-primary-light">12+</span>
                      <span className="text-gray-600 dark:text-gray-300">Yıllık Deneyim</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-4xl font-bold text-[#0066CC] dark:text-primary-light">50+</span>
                      <span className="text-gray-600 dark:text-gray-300">Profesyonel Ekipman</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-full h-full bg-[#0066CC] dark:bg-primary-light rounded-xl"></div>
                {(() => {
                  // Eğer aboutContent.image bir ID ise (MongoDB ObjectId formatında), SiteImage'dan çek
                  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
                  const baseUrl = API_URL.endsWith('/api') ? API_URL.replace(/\/api$/, '') : API_URL.replace(/\/api\/?$/, '');
                  
                  if (aboutContent?.image && aboutContent.image.length === 24 && /^[a-fA-F0-9]{24}$/.test(aboutContent.image)) {
                    // Bu bir MongoDB ObjectId, SiteImage'dan çek
                    return (
                      <img
                        src={`${baseUrl}/api/site-images/public/${aboutContent.image}/image`}
                        alt="SK Production Ekibi"
                        className="relative rounded-xl w-full aspect-[4/3] object-cover z-10"
                      />
                    );
                  } else {
                    // Eski format (URL string) veya fallback
                    return (
                      <Image
                        src={aboutContent?.image || '/images/slide1.jpg'}
                        alt="SK Production Ekibi"
                        width={800}
                        height={600}
                        className="relative rounded-xl w-full aspect-[4/3] object-cover z-10"
                        priority
                        quality={90}
                      />
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* İletişim Bölümü */}
      <section id="contact" className="relative py-16 bg-gray-50/10 dark:bg-dark-surface/10 backdrop-blur-[2px] z-10">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-[#0A1128] dark:text-white mb-12">İletişim</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* İletişim Bilgileri */}
            <div className="space-y-6">
              <div className="flex items-start">
                <Icon name="location" className="h-6 w-6 mr-3 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-[#0A1128] dark:text-white mb-1">Adres</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {contactInfo?.address || 'Zincirlidere Caddesi No:52/C Şişli/İstanbul'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Icon name="phone" className="h-6 w-6 mr-3 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-[#0A1128] dark:text-white mb-1">Telefon</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {contactInfo?.phone || '+90 532 123 4567'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Icon name="email" className="h-6 w-6 mr-3 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-[#0A1128] dark:text-white mb-1">E-posta</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {contactInfo?.email || 'info@skpro.com.tr'}
                  </p>
                </div>
              </div>
              {/* Harita */}
              <Map location={location} onOpenMobileNavigation={openMobileNavigation} />
            </div>
            {/* İletişim Formu */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
