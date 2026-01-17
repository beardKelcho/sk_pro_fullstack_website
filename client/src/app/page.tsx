'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImmersiveHero from '@/components/common/ImmersiveHero';
import InteractiveProjectCard from '@/components/common/InteractiveProjectCard';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import ParallaxSection from '@/components/common/ParallaxSection';
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
  ServicesEquipmentContent,
  AboutContent,
  ContactInfo,
  SocialMedia
} from '@/services/siteContentService';
import { PageLoadingSkeleton } from '@/components/common/LoadingSkeleton';
import StructuredData, { createOrganizationSchema, createServiceSchema, createLocalBusinessSchema } from '@/components/common/StructuredData';
import { getImageUrl } from '@/utils/imageUrl';
import LazyImage from '@/components/common/LazyImage';
import logger from '@/utils/logger';
import Carousel, { CarouselRef } from '@/components/common/Carousel';
import { useLocale, useTranslations } from 'next-intl';
import type { AppLocale } from '@/i18n/locales';

// Video Background Player Component - React DOM hatalarını önlemek için ayrı component
const VideoBackgroundPlayer = ({
  videoUrl,
  poster,
  fallbackText,
}: {
  videoUrl: string;
  poster?: string;
  fallbackText: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (failed) return;
    const video = videoRef.current;
    if (!video) return;

    const handleError = (e: Event) => {
      setFailed(true);
      if (process.env.NODE_ENV === 'development') {
        const video = e.target as HTMLVideoElement;
        const error = video.error;
        logger.error('Video yükleme hatası:', {
          videoUrl,
          errorCode: error?.code,
          errorMessage: error?.message
        });
      }
    };

    const handleLoadedData = () => {
      video.play().catch(() => {
        // Autoplay başarısız - sessizce devam et
      });
    };
    
    const handleCanPlayThrough = () => {
      video.play().catch(() => {
        // Autoplay başarısız - sessizce devam et
      });
    };
    
    video.addEventListener('error', handleError);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [videoUrl, failed]);

  if (!videoUrl || failed) {
    return null;
  }

  return (
    <video 
      ref={videoRef}
      src={videoUrl}
      className="absolute inset-0 w-full h-full object-cover z-0" 
      autoPlay 
      loop 
      muted 
      playsInline
      preload="auto"
      poster={poster}
      key={videoUrl}
      style={{ zIndex: 0 }}
      crossOrigin="anonymous"
    >
      <source src={videoUrl} type="video/mp4" />
      {fallbackText}
    </video>
  );
};

export default function Home() {
  const locale = useLocale() as AppLocale;
  const tHome = useTranslations('site.home');
  const tOverrides = useTranslations('site.contentOverrides');
  const tMeta = useTranslations('site.meta');

  const safeRaw = useCallback(
    (key: string) => {
      try {
        return tOverrides.raw(key) as unknown;
      } catch {
        return undefined;
      }
    },
    [tOverrides]
  );

  const safeArray = useCallback(<T,>(value: unknown): T[] | undefined => {
    if (Array.isArray(value)) return value as T[];
    return undefined;
  }, []);

  const safeObject = useCallback(<T extends object>(value: unknown): Partial<T> | undefined => {
    if (value && typeof value === 'object' && !Array.isArray(value)) return value as Partial<T>;
    return undefined;
  }, []);
  // Site içeriği state'leri
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [servicesEquipment, setServicesEquipment] = useState<ServicesEquipmentContent | null>(null);
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'equipment'>('services');
  
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
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Carousel referansları - scroll pozisyonunu kaydetmek için
  const topCarouselRef = useRef<CarouselRef | null>(null);
  const bottomCarouselRef = useRef<CarouselRef | null>(null);
  
  // Konum bilgileri (fallback) - stable deps
  const defaultLocation = useMemo(() => ({
    address: 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
    lat: 41.057984,
    lng: 28.987117,
  }), []);
  
  const location = useMemo(() => {
    if (!contactInfo) return defaultLocation;
    return {
      address: contactInfo.address,
      lat: contactInfo.latitude || defaultLocation.lat,
      lng: contactInfo.longitude || defaultLocation.lng
    };
  }, [contactInfo, defaultLocation]);

  // Navigasyon fonksiyonu
  const openMobileNavigation = () => {
    if (typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
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

      navigationApps.forEach(app => {
        window.open(app.url, '_blank');
      });
    } else {
      window.open(`https://www.google.com/maps/place/${encodeURIComponent(location.address)}`, '_blank');
    }
  };

  // Sayfa yüklendiğinde veritabanından resimleri çek
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Relative path kullan - Next.js rewrites proxy eder (farklı bilgisayarlardan erişim için)
        const fetchOptions = {
          cache: 'no-store' as RequestCache,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        };
        const response = await fetch(`/api/site-images/public?category=project&isActive=true&_t=${Date.now()}`, fetchOptions);
        
        if (response.ok) {
          const data = await response.json();
          const images = (data.images || data || []);
          
          const activeImages = images.filter((img: SiteImage) => {
            if (!img.isActive || img.category !== 'project') {
              return false;
            }
            
            if (!img.url && !img.path && !img.filename) {
              return false;
            }
            
            return true;
          });
          
          setAllProjectImages(activeImages);
          
          if (activeImages.length > 0) {
            const sortedImages = [...activeImages].sort((a, b) => a.order - b.order);
            const offset = Math.ceil(sortedImages.length / 2);
            
            const topImagesArray = [...sortedImages];
            const bottomImagesArray = sortedImages.length > 1
              ? [...sortedImages.slice(offset), ...sortedImages.slice(0, offset)]
              : [];
            
            if (sortedImages.length === 1) {
              setTopImages(topImagesArray);
              setBottomImages([]);
            } else {
              setTopImages(topImagesArray);
              setBottomImages(bottomImagesArray);
            }
            
          }
        } else {
          logger.error('Resimler yüklenirken bir hata oluştu. Status:', response.status);
          setTopImages([]);
          setBottomImages([]);
        }
      } catch (error) {
        logger.error('Resim yükleme hatası:', error);
        setTopImages([]);
        setBottomImages([]);
      }
    };
    
    fetchImages();
    
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
        // Relative path kullan - Next.js rewrites proxy eder (farklı bilgisayarlardan erişim için)
        const isTr = locale === 'tr';
        
        // Cache bypass için timestamp ekle ve headers ekle
        const fetchOptions = {
          cache: 'no-store' as RequestCache,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        };
        
        const [heroRes, servicesEquipmentRes, aboutRes, contactRes, socialRes] = await Promise.allSettled([
          fetch(`/api/site-content/public/hero?_t=${Date.now()}`, fetchOptions),
          fetch(`/api/site-content/public/services-equipment?_t=${Date.now()}`, fetchOptions),
          fetch(`/api/site-content/public/about?_t=${Date.now()}`, fetchOptions),
          fetch(`/api/site-content/public/contact?_t=${Date.now()}`, fetchOptions),
          fetch(`/api/site-content/public/social?_t=${Date.now()}`, fetchOptions),
        ]);

        if (heroRes.status === 'fulfilled' && heroRes.value.ok) {
          const heroData = await heroRes.value.json();
          if (heroData.content) {
            const content = heroData.content.content as HeroContent;
            if (!isTr) {
              const override = safeObject<HeroContent>(safeRaw('hero')) || {};
              setHeroContent({ ...content, ...override });
            } else {
              setHeroContent(content);
            }
          }
        }

        // Birleşik services-equipment içeriğini yükle
        if (servicesEquipmentRes.status === 'fulfilled' && servicesEquipmentRes.value.ok) {
          const servicesEquipmentData = await servicesEquipmentRes.value.json();
          if (servicesEquipmentData.content) {
            const content = servicesEquipmentData.content.content as ServicesEquipmentContent;
            if (!isTr) {
              // Non-TR için: metin alanlarını i18n’den türet, medya/arka plan DB’den gelsin
              const baseOverride: Partial<ServicesEquipmentContent> = {
                title: tHome('servicesSection.title'),
                subtitle: tHome('servicesSection.subtitle'),
                services:
                  (safeArray<ServiceItem>(tHome.raw('servicesSection.fallbackServices')) as ServiceItem[]) || content.services,
                equipment:
                  (safeArray<EquipmentCategory>(tHome.raw('servicesSection.fallbackEquipment')) as EquipmentCategory[]) ||
                  content.equipment,
              };

              // İsteğe bağlı manuel override (messages/* -> site.contentOverrides.servicesEquipment)
              const manualOverride =
                safeObject<ServicesEquipmentContent>(safeRaw('servicesEquipment')) || ({} as Partial<ServicesEquipmentContent>);

              setServicesEquipment({
                ...content,
                ...baseOverride,
                ...manualOverride,
              });
            } else {
              setServicesEquipment(content);
            }
          }
        }

        if (aboutRes.status === 'fulfilled' && aboutRes.value.ok) {
          const aboutData = await aboutRes.value.json();
          if (aboutData.content) {
            const content = aboutData.content.content as AboutContent;
            if (!isTr) {
              const stats =
                safeArray<{ value: string; label: string }>(tHome.raw('aboutSection.fallbackStats')) || content.stats;

              const baseOverride: Partial<AboutContent> = {
                title: tHome('aboutSection.title'),
                description: [tHome('aboutSection.paragraphs.0'), tHome('aboutSection.paragraphs.1')].join('\n\n'),
                stats,
              };

              const manualOverride = safeObject<AboutContent>(safeRaw('about')) || ({} as Partial<AboutContent>);
              setAboutContent({
                ...content,
                ...baseOverride,
                ...manualOverride,
              });
            } else {
              setAboutContent(content);
            }
          }
        }

        if (contactRes.status === 'fulfilled' && contactRes.value.ok) {
          const contactData = await contactRes.value.json();
          if (contactData.content) {
            const content = contactData.content.content as ContactInfo;
            if (!isTr) {
              const override = safeObject<ContactInfo>(safeRaw('contact')) || {};
              setContactInfo({ ...content, ...override });
            } else {
              setContactInfo(content);
            }
          }
        }

        if (socialRes.status === 'fulfilled' && socialRes.value.ok) {
          const socialData = await socialRes.value.json();
          if (socialData.content) {
            const content = socialData.content.content as SocialMedia[];
            if (!isTr) {
              const override = safeArray<SocialMedia>(safeRaw('social'));
              setSocialMedia(override || content);
            } else {
              setSocialMedia(content);
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Site içerik yükleme hatası:', error);
        }
      } finally {
        // Loading'i false yap - images ayrı useEffect'te yüklenecek
        setLoading(false);
      }
    };

    fetchSiteContent();
  }, [locale, tHome, safeArray, safeObject, safeRaw]);

  // Hero rotating texts için effect
  useEffect(() => {
    const textsCount = heroContent?.rotatingTexts && heroContent.rotatingTexts.length > 0 
      ? heroContent.rotatingTexts.length 
      : 3;
    
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex + 1) % textsCount);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroContent]);
  
  // Resme tıklama işleyicisi
  const handleImageClick = (image: SiteImage, isTop: boolean) => {
    // Carousel scroll pozisyonunu kaydet
    if (isTop && topCarouselRef.current) {
      topCarouselRef.current.saveScrollPosition();
    } else if (!isTop && bottomCarouselRef.current) {
      bottomCarouselRef.current.saveScrollPosition();
    }
    
    setSelectedImage(image);
    setIsTopCarousel(isTop);
    setIsModalOpen(true);
  };
  
  // Modal kapatma işleyicisi
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedImage(null);
    
    // Carousel scroll pozisyonunu geri yükle
    setTimeout(() => {
      if (isTopCarousel && topCarouselRef.current) {
        topCarouselRef.current.restoreScrollPosition();
      } else if (!isTopCarousel && bottomCarouselRef.current) {
        bottomCarouselRef.current.restoreScrollPosition();
      }
    }, 100); // Kısa bir gecikme - modal animasyonu tamamlansın
  }, [isTopCarousel]);
  
  // Carousel'leri durdur/devam ettir (modal açıkken durdur)
  const isCarouselPaused = isModalOpen;
  
  // Modal dışına tıklandığında kapatma
  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };
  
  // Klavye ile gezinme
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isModalOpen || !selectedImage) return;
    
    const currentImages = isTopCarousel ? topImages : bottomImages;
    const currentIndex = currentImages.findIndex(img => 
      (img._id || img.id) === (selectedImage._id || selectedImage.id)
    );
    
    if (e.key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % currentImages.length;
      setSelectedImage(currentImages[nextIndex]);
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      setSelectedImage(currentImages[prevIndex]);
    } else if (e.key === 'Escape') {
      closeModal();
    }
  }, [isModalOpen, selectedImage, isTopCarousel, topImages, bottomImages, closeModal]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Structured Data için schema'lar
  const organizationSchema = useMemo(() => createOrganizationSchema({
    name: 'SK Production',
    url: 'https://skproduction.com',
    logo: 'https://skproduction.com/images/sk-logo.png',
    description: tHome('structuredData.organizationDescription'),
    address: {
      streetAddress: contactInfo?.address || 'Zincirlidere Caddesi No:52/C',
      addressLocality: 'Şişli',
      addressRegion: 'İstanbul',
      addressCountry: 'TR',
    },
    contactPoint: {
      telephone: contactInfo?.phone || '+90 532 123 4567',
      contactType: 'customer service',
      email: contactInfo?.email || 'info@skpro.com.tr',
    },
    sameAs: socialMedia.map(social => social.url).filter(url => url && url !== '#'),
  }), [contactInfo, socialMedia, tHome]);

  const serviceSchemas = useMemo(() => {
    if (!servicesEquipment?.services || servicesEquipment.services.length === 0) return [];
    return servicesEquipment.services.map(service => createServiceSchema({
      serviceType: service.title,
      providerName: 'SK Production',
      areaServed: tHome('structuredData.areaServed'),
      description: service.description,
    }));
  }, [servicesEquipment, tHome]);

  const localBusinessSchema = useMemo(() => createLocalBusinessSchema({
    name: 'SK Production',
    image: 'https://skproduction.com/images/sk-logo.png',
    url: 'https://skproduction.com',
    telephone: contactInfo?.phone || '+90 532 123 4567',
    email: contactInfo?.email || 'info@skpro.com.tr',
    address: {
      streetAddress: contactInfo?.address || 'Zincirlidere Caddesi No:52/C',
      addressLocality: 'Şişli',
      addressRegion: 'İstanbul',
      postalCode: '34000',
      addressCountry: 'TR',
    },
    geo: {
      latitude: location.lat,
      longitude: location.lng,
    },
  }), [contactInfo, location]);

  // Loading durumunda skeleton göster
  // İlk yüklemede heroContent veya images yoksa da loading göster
  const isInitialLoad = loading || (!heroContent && topImages.length === 0);
  
  if (isInitialLoad) {
    return (
      <MainLayout>
        <PageLoadingSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Skip to main content link (Accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md"
        aria-label={tHome('a11y.skipToContent')}
      >
        {tHome('a11y.skipToContent')}
      </a>
      {/* Structured Data */}
      <StructuredData type="organization" data={organizationSchema} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'SK Production',
            url: 'https://skproduction.com',
            description: tMeta('description'),
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://skproduction.com/search?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      
      {serviceSchemas.map((schema, index) => (
        <StructuredData key={index} type="service" data={schema} />
      ))}
      
      <StructuredData type="localBusiness" data={localBusinessSchema} />
      
      {/* Video Arkaplan */}
      {heroContent && (heroContent.selectedVideo || heroContent.backgroundVideo) && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
          {(() => {
            const videoUrl = heroContent.selectedVideo || heroContent.backgroundVideo || '';
            
            if (videoUrl) {
              let fullVideoUrl = videoUrl;
              
              // Eğer zaten full URL ise (http/https ile başlıyorsa), olduğu gibi kullan
              if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
                // MongoDB ObjectId formatı kontrolü
                if (/^[0-9a-fA-F]{24}$/.test(videoUrl)) {
                  // Relative path kullan - Next.js rewrites proxy eder
                  fullVideoUrl = `/api/site-images/public/${videoUrl}/image`;
                } else if (videoUrl.startsWith('/uploads/')) {
                  // Relative path - Next.js rewrites proxy eder
                  fullVideoUrl = videoUrl;
                } else if (videoUrl.startsWith('/')) {
                  // Relative path - Next.js rewrites proxy eder
                  fullVideoUrl = videoUrl;
                } else if (videoUrl.includes('/')) {
                  // Relative path oluştur
                  fullVideoUrl = `/uploads/${videoUrl}`;
                } else {
                  // Relative path oluştur
                  fullVideoUrl = `/uploads/general/${videoUrl}`;
                }
              }
              
              return (
                <VideoBackgroundPlayer
                  key={`video-${fullVideoUrl}`}
                  videoUrl={fullVideoUrl}
                  poster={heroContent.backgroundImage || undefined}
                  fallbackText={tHome('video.fallbackText')}
                />
              );
            } else {
              return null;
            }
          })()}
        </div>
      )}
      
      {/* İmmersive Hero Section */}
      <ImmersiveHero 
        content={heroContent}
        onScrollDown={() => {
          document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Projeler Bölümü - İnteraktif Grid */}
      <StageExperience>
        <section id="projects" className="relative py-32 bg-gradient-to-b from-black/90 via-black/80 to-black/90 overflow-hidden" style={{ position: 'relative', scrollMarginTop: '100px', marginTop: '6rem', marginBottom: '6rem' }}>
          <div className="container mx-auto px-6">
            <StageSectionTitle
              title={tHome('projectsSection.title')}
              subtitle={tHome('projectsSection.subtitle')}
            />
            
            {/* Üst Container - Sağdan Sola */}
            {topImages.length > 0 && (
              <div className="mb-8" key={`top-carousel-${topImages.length}`}>
                <Carousel
                  images={topImages}
                  direction="right"
                  isPaused={isCarouselPaused}
                  onImageClick={(image) => handleImageClick(image, true)}
                  isTop={true}
                />
              </div>
            )}

            {/* Alt Container - Soldan Sağa */}
            {bottomImages.length > 0 && (
              <div className="mt-8" key={`bottom-carousel-${bottomImages.length}`}>
                  <Carousel
                    ref={bottomCarouselRef}
                    images={bottomImages}
                    direction="left"
                    isPaused={isCarouselPaused}
                    onImageClick={(image) => handleImageClick(image, false)}
                    isTop={false}
                  />
              </div>
            )}

            {/* Eğer carousel yoksa grid göster */}
            {topImages.length === 0 && bottomImages.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
                <AnimatePresence>
                  {topImages.slice(0, 8).map((image, index) => (
                    <InteractiveProjectCard
                      key={image._id || image.id || index}
                      image={image}
                      index={index}
                      onClick={() => handleImageClick(image, true)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      </StageExperience>

      {/* Lightbox/Modal */}
      <AnimatePresence>
        {isModalOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={handleModalBackdropClick}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-[90vw] max-w-7xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 z-10 text-white bg-black/50 rounded-full p-3 hover:bg-[#0066CC] transition-all"
              >
                <Icon name="close" className="h-7 w-7" />
              </button>

              <button
                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/50 rounded-full p-4 hover:bg-[#0066CC] transition-all"
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

              <button
                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/50 rounded-full p-4 hover:bg-[#0066CC] transition-all"
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

              <div className="p-6 w-full h-full flex items-center justify-center" style={{ minHeight: '400px', height: '85vh' }}>
                {(() => {
                  // Image URL'i oluştur - önce ID'yi dene, sonra image objesini
                  const imageId = selectedImage._id || selectedImage.id;
                  const imageUrl = imageId 
                    ? getImageUrl({ imageId: imageId as string, fallback: selectedImage.url || selectedImage.path || '' })
                    : getImageUrl({ image: selectedImage, fallback: selectedImage.url || selectedImage.path || '' });
                  
                  if (!imageUrl || imageUrl.trim() === '') {
                    logger.warn('Resim URL oluşturulamadı:', { 
                      selectedImage, 
                      imageId,
                      url: selectedImage.url,
                      path: selectedImage.path 
                    });
                    return (
                      <div className="text-white text-center">
                        <p className="text-lg mb-2">{tHome('lightbox.imageFailed')}</p>
                        <p className="text-sm text-gray-400">
                          {tHome('lightbox.urlLabel')}: {selectedImage.url || selectedImage.path || tHome('lightbox.none')}
                        </p>
                        <p className="text-sm text-gray-400">
                          {tHome('lightbox.idLabel')}: {imageId || tHome('lightbox.none')}
                        </p>
                        <p className="text-sm text-gray-400">
                          {tHome('lightbox.generatedUrlLabel')}: {imageUrl || tHome('lightbox.none')}
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <div 
                      className="relative w-full h-full max-w-[90vw] max-h-[85vh] flex items-center justify-center"
                      style={{ minHeight: '400px', height: '85vh' }}
                    >
                      <LazyImage
                        src={imageUrl}
                        alt={selectedImage.originalName || selectedImage.filename || tHome('lightbox.projectImageAlt')}
                        className="rounded-lg shadow-2xl"
                        fill={true}
                        priority={true}
                        objectFit="contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 85vh"
                        quality={90}
                        onError={(e) => {
                          logger.error('Modal resim yükleme hatası:', { 
                            imageUrl, 
                            selectedImage,
                            error: e 
                          });
                        }}
                      />
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hizmetler ve Ekipmanlar - Tek Sekme */}
      <div style={{ marginBottom: '16rem', marginTop: '8rem' }}>
        <ParallaxSection speed={0.3} direction="up">
          <StageExperience>
            <section id="services" className="relative py-32 bg-gradient-to-b from-black/80 via-[#0A1128]/90 to-black/80" style={{ position: 'relative', scrollMarginTop: '100px', paddingBottom: '8rem', minHeight: 'auto' }}>
            <div className="container mx-auto px-6">
              <StageSectionTitle
                title={servicesEquipment?.title || tHome('servicesSection.title')}
                subtitle={servicesEquipment?.subtitle || tHome('servicesSection.subtitle')}
              />
              
              {/* Tab Navigation */}
              <div className="flex justify-center mb-12">
                <div className="inline-flex bg-gray-900/50 backdrop-blur-sm rounded-lg p-1 border border-gray-700">
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`px-8 py-3 rounded-md font-medium transition-all duration-300 ${
                      activeTab === 'services'
                        ? 'bg-[#0066CC] text-white shadow-lg shadow-blue-500/50'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tHome('servicesSection.tabs.services')}
                  </button>
                  <button
                    onClick={() => setActiveTab('equipment')}
                    className={`px-8 py-3 rounded-md font-medium transition-all duration-300 ${
                      activeTab === 'equipment'
                        ? 'bg-[#0066CC] text-white shadow-lg shadow-blue-500/50'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tHome('servicesSection.tabs.equipment')}
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'services' ? (
                  <motion.div
                    key="services"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="pb-16 min-h-[400px]"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(servicesEquipment?.services && servicesEquipment.services.length > 0
                        ? servicesEquipment.services
                        : (tHome.raw('servicesSection.fallbackServices') as Array<{ title: string; description: string; icon: string; order: number }>)).sort((a, b) => (a.order || 0) - (b.order || 0)).map((service, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1, duration: 0.6 }}
                          whileHover={{ y: -10, scale: 1.02 }}
                        >
                          <ServiceCard
                            title={service.title}
                            description={service.description}
                            icon={service.icon as 'video' | 'screen' | 'led'}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="equipment"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="pb-20 min-h-[500px]"
                  >
                    <div className="space-y-6">
                      {(servicesEquipment?.equipment && servicesEquipment.equipment.length > 0
                        ? servicesEquipment.equipment
                        : (tHome.raw('servicesSection.fallbackEquipment') as Array<{ title: string; items: Array<{ name: string; description: string }>; order: number }>)).sort((a, b) => (a.order || 0) - (b.order || 0)).map((category, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.2, duration: 0.6 }}
                        >
                          <EquipmentList
                            title={category.title}
                            items={category.items}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
          </StageExperience>
        </ParallaxSection>
      </div>

      {/* Hakkımızda */}
      <div style={{ marginTop: '16rem', marginBottom: '8rem' }}>
        <StageExperience>
          <section id="about" className="relative py-32 bg-gradient-to-b from-black/90 via-[#0A1128]/80 to-black/90" style={{ position: 'relative', scrollMarginTop: '100px', paddingTop: '8rem', minHeight: 'auto' }}>
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <StageSectionTitle
                  title={aboutContent?.title || tHome('aboutSection.title')}
                  subtitle=""
                />
                {aboutContent?.description ? (
                  <div className="text-gray-300 mb-8 text-lg whitespace-pre-line leading-relaxed">
                    {aboutContent.description}
                  </div>
                ) : (
                  <>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      {tHome('aboutSection.paragraphs.0')}
                    </p>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      {tHome('aboutSection.paragraphs.1')}
                    </p>
                  </>
                )}
                <div className="flex gap-8">
                  {(aboutContent?.stats && aboutContent.stats.length > 0
                    ? aboutContent.stats
                    : (tHome.raw('aboutSection.fallbackStats') as Array<{ value: string; label: string }>)).map((stat, index) => (
                    <motion.div
                      key={index}
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.span
                        className="block text-5xl font-bold bg-gradient-to-r from-[#0066CC] to-[#00C49F] bg-clip-text text-transparent"
                        animate={{
                          backgroundPosition: ['0%', '100%', '0%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        {stat.value}
                      </motion.span>
                      <span className="text-gray-400 text-sm mt-2 block">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-[#0066CC] to-[#00C49F] rounded-2xl blur-xl opacity-50"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  {(() => {
                    // Relative path kullan - Next.js rewrites backend'e proxy eder
                    if (aboutContent?.image && aboutContent.image.length === 24 && /^[a-fA-F0-9]{24}$/.test(aboutContent.image)) {
                      return (
                        <LazyImage
                          src={`/api/site-images/public/${aboutContent.image}/image`}
                          alt="SK Production Ekibi"
                          className="relative rounded-2xl w-full aspect-[4/3] z-10"
                          fill
                          objectFit="cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          quality={85}
                        />
                      );
                    } else if (aboutContent?.image) {
                      return (
                        <LazyImage
                          src={aboutContent.image}
                          alt="SK Production Ekibi"
                          className="relative rounded-2xl w-full aspect-[4/3] z-10"
                          fill
                          objectFit="cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          quality={85}
                        />
                      );
                    }
                    return null;
                  })()}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </StageExperience>
      </div>

      {/* İletişim */}
      <StageExperience>
        <section id="contact" className="relative py-32 bg-gradient-to-b from-black/90 to-black overflow-hidden" style={{ position: 'relative', scrollMarginTop: '100px', marginTop: '6rem', marginBottom: '6rem' }}>
          <div className="container mx-auto px-6">
            <StageSectionTitle
              title={tHome('contactSection.title')}
              subtitle={tHome('contactSection.subtitle')}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                {[
                  { icon: 'location', title: tHome('contactSection.labels.address'), content: contactInfo?.address || tHome('contactSection.fallback.address') },
                  { icon: 'phone', title: tHome('contactSection.labels.phone'), content: contactInfo?.phone || tHome('contactSection.fallback.phone') },
                  { icon: 'email', title: tHome('contactSection.labels.email'), content: contactInfo?.email || tHome('contactSection.fallback.email') },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start group"
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-gradient-to-br from-[#0066CC] to-[#00C49F] p-4 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                      <Icon name={item.icon as any} className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-gray-300">{item.content}</p>
                    </div>
                  </motion.div>
                ))}
                <Map location={location} onOpenMobileNavigation={openMobileNavigation} />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <ContactForm />
              </motion.div>
            </div>
          </div>
        </section>
      </StageExperience>

      {/* Alt boşluk */}
      <div className="min-h-screen w-full relative z-10"></div>
    </MainLayout>
  );
}
