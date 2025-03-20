'use client';

import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function Home() {
  // Hero bölümündeki değişen metinler için state
  const [textIndex, setTextIndex] = useState(0);
  const heroTexts = [
    "Etkinliklerinize Görsel Mükemmellik",
    "Profesyonel Görüntü Rejisi Çözümleri",
    "Son Teknoloji Medya Server Sistemleri"
  ];
  
  // Carousel için resim dizileri
  const [topImages, setTopImages] = useState<number[]>([]);
  const [bottomImages, setBottomImages] = useState<number[]>([]);
  
  // Modal/Lightbox için state'ler
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isTopCarousel, setIsTopCarousel] = useState(true);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Konum bilgileri
  const location = {
    address: "Zincirlidere Caddesi No:52/C Şişli/İstanbul",
    lat: 41.0987654,
    lng: 29.0123456
  };

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

  // Sayfa yüklendiğinde rastgele resim setleri oluştur
  useEffect(() => {
    // 1-12 arası tüm indeksleri içeren bir dizi oluştur
    const allImages = Array.from({ length: 12 }, (_, i) => i + 1);
    
    // Diziyi rastgele karıştır
    const shuffled = [...allImages].sort(() => Math.random() - 0.5);
    
    // İlk yarısını üst carousel için, ikinci yarısını alt carousel için ayır
    setTopImages(shuffled.slice(0, 6));
    setBottomImages(shuffled.slice(6, 12));
  }, []);

  // Metinlerin değişimini sağlayan effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex + 1) % heroTexts.length);
    }, 5000); // Her 5 saniyede bir metin değişimi

    return () => clearInterval(interval);
  }, []);
  
  // Resme tıklama işleyicisi
  const handleImageClick = (imageIndex: number, isTop: boolean) => {
    setSelectedImage(imageIndex);
    setIsTopCarousel(isTop);
    setIsModalOpen(true);
    setCarouselPaused(true);
  };
  
  // Modal kapatma işleyicisi
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    setCarouselPaused(false);
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
      if (!isModalOpen) return;
      
      const currentImages = isTopCarousel ? topImages : bottomImages;
      const currentIndex = currentImages.indexOf(selectedImage as number);
      
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
      {/* Hero Bölümü - Daha modern ve etkileyici */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-[#0A1128] to-[#001F54] dark:from-[#050914] dark:to-[#0A1128]">
        {/* Video Arkaplan */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
          <video 
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
            {/* Video yüklenemezse yedek arkaplan göster */}
            <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center"></div>
          </video>
        </div>
        
        <div className="container mx-auto px-4 relative z-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight h-28 flex items-center justify-center">
              <span key={textIndex} className="animate-fade-in-slide-up">
                {textIndex === 0 ? (
                  <>Görsel <span className="text-[#0066CC] dark:text-primary-light">Mükemmellikte</span> Uzman Ekip</>
                ) : textIndex === 1 ? (
                  <>Etkinliklerinizde <span className="text-[#0066CC] dark:text-primary-light">Profesyonel</span> Çözümler</>
                ) : (
                  <>Medya Server ve <span className="text-[#0066CC] dark:text-primary-light">Görüntü Rejisi</span> Çözümleri</>
                )}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto">
              SK Production olarak, kurumsal etkinlikleriniz için profesyonel görüntü rejisi 
              ve medya server çözümleri sunuyoruz. 10 yılı aşkın deneyimimizle etkinliklerinize 
              değer katıyoruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href="#contact" 
                className="bg-[#0066CC] dark:bg-primary-light text-white px-8 py-4 rounded-lg hover:bg-[#0055AA] dark:hover:bg-primary transition-all duration-300 text-lg font-medium shadow-lg"
              >
                İletişime Geçin
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
      <section id="projects" className="py-20 bg-gray-50 dark:bg-dark-surface overflow-hidden">
        <div className="container mx-auto px-6 mb-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0A1128] dark:text-white mb-4">Projelerimiz</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Gerçekleştirdiğimiz bazı etkinlikler ve projelerimize göz atın.
            </p>
          </div>
          
          {/* Üst Sıra Carousel - Sağdan Sola */}
          <div className="relative mb-8 w-full overflow-hidden">
            <div className={`flex ${carouselPaused ? 'animate-none' : 'animate-scroll-right-to-left'}`}>
              <div className="flex flex-nowrap whitespace-nowrap">
                {topImages.map((index) => (
                  <div 
                    key={`top-${index}`} 
                    className="w-80 flex-shrink-0 mx-4 cursor-pointer"
                    onClick={() => handleImageClick(index, true)}
                  >
                    <div className="group relative overflow-hidden rounded-xl shadow-lg dark:shadow-dark-card h-72">
                      <Image 
                        src={`/images/slide${index}.jpg`} 
                        alt={`Proje ${index}`} 
                        width={600} 
                        height={400}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={`/images/slide${index}.jpg`}
                        className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        quality={85}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <h3 className="text-white text-xl font-semibold mb-2">Kurumsal Etkinlik {index}</h3>
                        <p className="text-gray-200">Analog Way Aquilon ve Dataton Watchpax sistemleri ile profesyonel görüntü rejisi hizmeti</p>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Kopyalanan elemanlar (sonsuz döngü etkisi için) */}
                {topImages.map((index) => (
                  <div 
                    key={`top-dup-${index}`} 
                    className="w-80 flex-shrink-0 mx-4 cursor-pointer"
                    onClick={() => handleImageClick(index, true)}
                  >
                    <div className="group relative overflow-hidden rounded-xl shadow-lg dark:shadow-dark-card h-72">
                      <Image 
                        src={`/images/slide${index}.jpg`} 
                        alt={`Proje ${index}`} 
                        width={600} 
                        height={400}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={`/images/slide${index}.jpg`}
                        className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        quality={85}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <h3 className="text-white text-xl font-semibold mb-2">Kurumsal Etkinlik {index}</h3>
                        <p className="text-gray-200">Analog Way Aquilon ve Dataton Watchpax sistemleri ile profesyonel görüntü rejisi hizmeti</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Alt Sıra Carousel - Soldan Sağa */}
          <div className="relative w-full overflow-hidden">
            <div className={`flex ${carouselPaused ? 'animate-none' : 'animate-scroll-left-to-right'}`}>
              <div className="flex flex-nowrap whitespace-nowrap">
                {bottomImages.map((index) => (
                  <div 
                    key={`bottom-${index}`} 
                    className="w-80 flex-shrink-0 mx-4 cursor-pointer"
                    onClick={() => handleImageClick(index, false)}
                  >
                    <div className="group relative overflow-hidden rounded-xl shadow-lg dark:shadow-dark-card h-72">
                      <Image 
                        src={`/images/slide${index}.jpg`} 
                        alt={`Proje ${index}`} 
                        width={600} 
                        height={400}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={`/images/slide${index}.jpg`}
                        className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        quality={85}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <h3 className="text-white text-xl font-semibold mb-2">Konser Görüntü Rejisi {index}</h3>
                        <p className="text-gray-200">Resolume Arena 7 ile canlı performans görüntü rejisi ve LED ekran yönetimi</p>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Kopyalanan elemanlar (sonsuz döngü etkisi için) */}
                {bottomImages.map((index) => (
                  <div 
                    key={`bottom-dup-${index}`} 
                    className="w-80 flex-shrink-0 mx-4 cursor-pointer"
                    onClick={() => handleImageClick(index, false)}
                  >
                    <div className="group relative overflow-hidden rounded-xl shadow-lg dark:shadow-dark-card h-72">
                      <Image 
                        src={`/images/slide${index}.jpg`} 
                        alt={`Proje ${index}`} 
                        width={600} 
                        height={400}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={`/images/slide${index}.jpg`}
                        className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        quality={85}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <h3 className="text-white text-xl font-semibold mb-2">Konser Görüntü Rejisi {index}</h3>
                        <p className="text-gray-200">Resolume Arena 7 ile canlı performans görüntü rejisi ve LED ekran yönetimi</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Sol Yön Tuşu */}
            <button 
              className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/50 rounded-full p-4 hover:bg-primary hover:scale-110 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                const currentImages = isTopCarousel ? topImages : bottomImages;
                const currentIndex = currentImages.indexOf(selectedImage);
                const prevIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
                setSelectedImage(currentImages[prevIndex]);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Sağ Yön Tuşu */}
            <button 
              className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/50 rounded-full p-4 hover:bg-primary hover:scale-110 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                const currentImages = isTopCarousel ? topImages : bottomImages;
                const currentIndex = currentImages.indexOf(selectedImage);
                const nextIndex = (currentIndex + 1) % currentImages.length;
                setSelectedImage(currentImages[nextIndex]);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Görüntü */}
            <div className="p-6 max-h-[90vh] w-full h-full flex items-center justify-center">
              <Image 
                src={`/images/slide${selectedImage}.jpg`}
                alt={`Proje ${selectedImage}`}
                width={1920}
                height={1080}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hizmetler ve Ekipmanlar Bölümü */}
      <section className="py-20 bg-white dark:bg-dark-background">
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
                {/* Hizmet 1 */}
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2 h-full">
                  <div className="h-40 bg-[#0A1128] relative">
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-[#0A1128] dark:text-white">Görüntü Rejisi</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                      Profesyonel ekipmanlarımız ve uzman ekibimizle etkinlikleriniz için kusursuz görüntü rejisi hizmeti sağlıyoruz.
                    </p>
                  </div>
                </div>
                
                {/* Hizmet 2 */}
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2 h-full">
                  <div className="h-40 bg-[#0A1128] relative">
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-[#0A1128] dark:text-white">Medya Server Sistemleri</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                      Yüksek performanslı medya server sistemlerimiz ile etkinliklerinizde kesintisiz ve yüksek kaliteli içerik yayını.
                    </p>
                  </div>
                </div>
                
                {/* Hizmet 3 */}
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2 h-full">
                  <div className="h-40 bg-[#0A1128] relative">
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-[#0A1128] dark:text-white">LED Ekran Yönetimi</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                      Farklı boyut ve çözünürlüklerdeki LED ekranlar için içerik hazırlama ve profesyonel yönetim hizmetleri.
                    </p>
                  </div>
                </div>
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
                {/* Ekipman Listesi */}
                <div className="bg-gray-50 dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border">
                  <h3 className="text-xl font-semibold text-[#0A1128] dark:text-white mb-4">Görüntü Rejisi Sistemleri</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0066CC] dark:text-primary-light mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="font-medium block dark:text-white">Analog Way Aquilon RS4</span>
                        <span className="text-gray-600 dark:text-gray-300 text-xs">4K/8K çözünürlük desteği ile görüntü işleme</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0066CC] dark:text-primary-light mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="font-medium block dark:text-white">Barco E2 Gen 2</span>
                        <span className="text-gray-600 dark:text-gray-300 text-xs">Gerçek 4K çözünürlük, genişletilebilir giriş/çıkış</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0066CC] dark:text-primary-light mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="font-medium block dark:text-white">Blackmagic ATEM 4 M/E Constellation HD</span>
                        <span className="text-gray-600 dark:text-gray-300 text-xs">40 giriş, 24 çıkış, gelişmiş geçiş efektleri</span>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border">
                  <h3 className="text-xl font-semibold text-[#0A1128] dark:text-white mb-4">Medya Server Sistemleri</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0066CC] dark:text-primary-light mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="font-medium block dark:text-white">Dataton WATCHPAX 60</span>
                        <span className="text-gray-600 dark:text-gray-300 text-xs">6 çıkışlı, yüksek performanslı</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0066CC] dark:text-primary-light mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="font-medium block dark:text-white">Disguise 4x4pro</span>
                        <span className="text-gray-600 dark:text-gray-300 text-xs">Gerçek zamanlı render, AR/VR desteği</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0066CC] dark:text-primary-light mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="font-medium block dark:text-white">Resolume Arena 7</span>
                        <span className="text-gray-600 dark:text-gray-300 text-xs">Canlı performans için video loop ve efektler</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hakkımızda Bölümü */}
      <section id="about" className="py-20 bg-gray-50 dark:bg-dark-surface">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-[#0A1128] dark:text-white mb-6">SK Production Hakkında</h2>
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
              <div className="flex gap-4">
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
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-full h-full bg-[#0066CC] dark:bg-primary-light rounded-xl"></div>
                <Image
                  src="/images/slide1.jpg"
                  alt="SK Production Ekibi"
                  width={600}
                  height={400}
                  className="relative rounded-xl w-full h-[400px] object-cover z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* İletişim Bölümü */}
      <section id="contact" className="py-16 bg-gray-50 dark:bg-dark-surface">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-[#0A1128] dark:text-white mb-12">İletişim</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* İletişim Bilgileri */}
            <div className="space-y-6">
              <div className="flex items-start">
                <svg className="h-6 w-6 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-[#0A1128] dark:text-white mb-1">Adres</h3>
                  <p className="text-gray-600 dark:text-gray-300">Zincirlidere Caddesi No:52/C Şişli/İstanbul</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="h-6 w-6 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-[#0A1128] dark:text-white mb-1">Telefon</h3>
                  <p className="text-gray-600 dark:text-gray-300">+90 532 123 4567</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="h-6 w-6 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-[#0A1128] dark:text-white mb-1">E-posta</h3>
                  <p className="text-gray-600 dark:text-gray-300">info@skpro.com.tr</p>
                </div>
              </div>
              {/* Harita */}
              <div className="mt-8 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative group">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.4437891234567!2d${location.lng}!3d${location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7a2a2c3b963%3A0x7671d1713a3c0f8f!2s${encodeURIComponent(location.address)}!5e0!3m2!1str!2str!4v1234567890!5m2!1str!2str`}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 dark:bg-dark-surface/90 px-4 py-2 rounded-lg shadow-lg">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={openMobileNavigation}
                          className="text-gray-800 dark:text-white text-sm font-medium flex items-center hover:text-[#0066CC] dark:hover:text-primary-light transition-colors duration-300"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C8.21 0 4.831 1.757 1.112 5.112l4.755 7.888c.187.31.187.69 0 1L1.112 18.888C4.831 22.243 8.21 24 12 24c3.79 0 7.169-1.757 10.888-5.112l-4.755-7.888c-.187-.31-.187-.69 0-1l4.755-7.888C19.169 1.757 15.79 0 12 0zm0 14c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z"/>
                          </svg>
                          Yol Tarifi Al
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* İletişim Formu */}
            <div>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-1">İsim Soyisim</label>
                  <input 
                    type="text" 
                    id="name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-transparent"
                    placeholder="İsim Soyisim"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-1">E-posta</label>
                  <input 
                    type="email" 
                    id="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-transparent"
                    placeholder="E-posta adresiniz"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 mb-1">Mesajınız</label>
                  <textarea 
                    id="message"
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-transparent"
                    placeholder="Mesajınızı buraya yazın..."
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-[#0066CC] dark:bg-primary-light text-white py-3 rounded-lg hover:bg-[#0055AA] dark:hover:bg-primary transition-colors duration-300 font-medium"
                >
                  Gönder
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
