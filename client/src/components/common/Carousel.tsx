'use client';

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { getImageUrl, getBaseUrl } from '@/utils/imageUrl';
import LazyImage from './LazyImage';

export interface SiteImage {
  _id?: string;
  id?: string;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  category: 'project' | 'gallery' | 'hero' | 'other' | 'about' | 'video';
  order: number;
  isActive: boolean;
}

interface CarouselProps {
  images: SiteImage[];
  direction: 'left' | 'right';
  isPaused: boolean;
  onImageClick: (image: SiteImage, isTop: boolean) => void;
  isTop: boolean;
}

export interface CarouselRef {
  saveScrollPosition: () => void;
  restoreScrollPosition: () => void;
}

const Carousel = forwardRef<CarouselRef, CarouselProps>(({
  images,
  direction,
  isPaused,
  onImageClick,
  isTop,
}, ref) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const savedScrollPositionRef = useRef<number | null>(null); // Popup açıldığında scroll pozisyonunu kaydet
  const animationIdRef = useRef<number | null>(null); // Animation ID'yi kaydet
  const hasInitializedRef = useRef(false); // İlk init yapıldı mı? (pause/resume'da baştan başlamasın)

  // Perfect loop için: resimlerin genişliğini hesapla
  const imageWidth = 320 + 32; // w-80 (320px) + mx-4 (16px her iki tarafta = 32px toplam)
  const singleSetWidth = images.length > 0 ? images.length * imageWidth : 0;

  // Parent component'ten scroll pozisyonunu kaydetme/geri yükleme için expose et
  useImperativeHandle(ref, () => ({
    saveScrollPosition: () => {
      if (scrollRef.current) {
        savedScrollPositionRef.current = scrollRef.current.scrollLeft;
      }
    },
    restoreScrollPosition: () => {
      if (scrollRef.current && savedScrollPositionRef.current !== null) {
        scrollRef.current.scrollLeft = savedScrollPositionRef.current;
        savedScrollPositionRef.current = null;
      }
    },
  }));

  // Animasyon için - Perfect Loop (sürekli akar, durmaz)
  useEffect(() => {
    if (!scrollRef.current || isDragging || isPaused || images.length === 0 || singleSetWidth === 0) {
      return;
    }

    const scrollContainer = scrollRef.current;
    let lastTime = performance.now();
    // Hız: 1.0 (daha görünür hareket)
    const speed = direction === 'right' ? -1.0 : 1.0; // right = sağdan sola, left = soldan sağa

    const animate = (currentTime: number) => {
      if (isDragging || isPaused || !scrollContainer || singleSetWidth === 0) {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }
        return;
      }

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const currentScroll = scrollContainer.scrollLeft;
      let newScroll = currentScroll + speed * (deltaTime * 0.1);

      // Perfect loop mantığı: 3 set var (images, images, images)
      // İlk set: 0 - singleSetWidth
      // İkinci set: singleSetWidth - 2*singleSetWidth  
      // Üçüncü set: 2*singleSetWidth - 3*singleSetWidth
      // Scroll pozisyonu ikinci set'te başlar (singleSetWidth)
      // İkinci set'in sonuna geldiğinde (2*singleSetWidth), görünmez bir şekilde ikinci set'in başına döner (singleSetWidth)
      // Böylece kullanıcı loop'u görmez - sürekli akar
      if (direction === 'right') {
        // Sağdan sola: scroll azalıyor
        if (newScroll < singleSetWidth) {
          // İkinci set'in başına geldik, üçüncü set'in sonuna geç (görsel olarak aynı)
          newScroll = 2 * singleSetWidth;
        }
      } else {
        // Soldan sağa: scroll artıyor
        if (newScroll >= 2 * singleSetWidth) {
          // İkinci set'in sonuna geldik, ikinci set'in başına dön (görsel olarak aynı)
          newScroll = singleSetWidth;
        }
      }

      scrollContainer.scrollLeft = newScroll;
      animationIdRef.current = requestAnimationFrame(animate);
    };

    // İlk scroll pozisyonunu ayarla ve animasyonu başlat
    // setTimeout ile DOM'un hazır olmasını bekle
    const initTimeout = setTimeout(() => {
      if (scrollContainer && singleSetWidth > 0) {
        // Eğer kaydedilmiş pozisyon varsa onu kullan.
        // Pause/resume durumunda (modal kapandıktan sonra) ise mevcut scrollLeft'ten devam et
        // (aksi halde her seferinde başa sarar gibi görünür).
        const initialScroll =
          savedScrollPositionRef.current !== null
            ? savedScrollPositionRef.current
            : (hasInitializedRef.current && scrollContainer.scrollLeft !== 0
              ? scrollContainer.scrollLeft
              : (direction === 'right' ? 2 * singleSetWidth : singleSetWidth));

        scrollContainer.scrollLeft = initialScroll;
        hasInitializedRef.current = true;

        // savedScrollPositionRef: parent restore timing'ine göre null olabilir; burada zorla temizlemiyoruz.
        // Böylece initTimeout ile parent restore aynı anda çalışsa bile reset yaşanmaz.
        // Animasyonu başlat
        animationIdRef.current = requestAnimationFrame(animate);
      }
    }, 100); // 100ms bekle - DOM'un tamamen hazır olması için

    return () => {
      clearTimeout(initTimeout);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [images, direction, isDragging, isPaused, singleSetWidth]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current || singleSetWidth === 0) return;
    e.preventDefault();
    
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    let newScroll = scrollLeft - walk;
    
    // Perfect loop için sınırları kontrol et
    if (direction === 'right') {
      // Sağdan sola: 0 ile singleSetWidth arasında
      if (newScroll < 0) {
        newScroll = singleSetWidth;
      } else if (newScroll > singleSetWidth) {
        newScroll = 0;
      }
    } else {
      // Soldan sağa: 0 ile singleSetWidth arasında
      if (newScroll < 0) {
        newScroll = singleSetWidth;
      } else if (newScroll > singleSetWidth) {
        newScroll = 0;
      }
    }
    
    scrollRef.current.scrollLeft = newScroll;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers (mobil için)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current || singleSetWidth === 0) return;
    
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    let newScroll = scrollLeft - walk;
    
    // Perfect loop için sınırları kontrol et
    if (direction === 'right') {
      // Sağdan sola: 0 ile singleSetWidth arasında
      if (newScroll < 0) {
        newScroll = singleSetWidth;
      } else if (newScroll > singleSetWidth) {
        newScroll = 0;
      }
    } else {
      // Soldan sağa: 0 ile singleSetWidth arasında
      if (newScroll < 0) {
        newScroll = singleSetWidth;
      } else if (newScroll > singleSetWidth) {
        newScroll = 0;
      }
    }
    
    scrollRef.current.scrollLeft = newScroll;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (images.length === 0) {
    return null;
  }

  // Perfect loop için: Resimleri 3 kez kopyala
  // İlk set: görünmez (0 - singleSetWidth)
  // İkinci set: görünür (singleSetWidth - 2*singleSetWidth) - bu set'te başlar
  // Üçüncü set: görünmez buffer (2*singleSetWidth - 3*singleSetWidth)
  // Scroll pozisyonu ikinci set'te başlar, ikinci set'in sonuna geldiğinde görünmez bir şekilde ikinci set'in başına döner
  const duplicatedImages = [...images, ...images, ...images];

  return (
    <div 
      className="relative w-full overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', position: 'relative' }}
    >
      <div 
        ref={scrollRef}
        className="flex flex-nowrap whitespace-nowrap carousel-scroll relative"
        style={{ 
          scrollBehavior: 'auto',
          overflowX: 'scroll', // Scroll çalışması için scroll olmalı
          overflowY: 'hidden',
          scrollbarWidth: 'none', // Firefox için scrollbar gizle
          msOverflowStyle: 'none', // IE için scrollbar gizle
          WebkitOverflowScrolling: 'touch', // iOS smooth scroll
          willChange: 'scroll-position', // Performans optimizasyonu
        }}
      >
        {duplicatedImages.map((image, index) => {
          const imageId = image._id || image.id || image.filename;
          
          // Resmi ID ile serve et - utility fonksiyonunu kullan
          // Önce ID'yi dene, sonra image objesini
          const imageUrl = imageId && typeof imageId === 'string' && imageId.length >= 12
            ? getImageUrl({ imageId: imageId as string, image, fallback: image.url || image.path || '' })
            : getImageUrl({ image, fallback: image.url || image.path || '' });
          
          // Geçersiz URL kontrolü - boş veya sadece '/' olmamalı
          const baseUrl = getBaseUrl();
          if (!imageUrl || imageUrl.trim() === '' || imageUrl === '/' || imageUrl === `${baseUrl}/`) {
            // Geçersiz resim - placeholder göster veya atla
            return null;
          }
          
          // İlk görünen resimler için priority (LCP için)
          // Duplicated images olduğu için, ilk set'in ilk 8'i ve ikinci set'in ilk 8'i priority
          // LCP için daha fazla resim priority yapıyoruz - ilk görünen resimler için
          const isPriority = (index < 8) || (index >= images.length && index < images.length + 8);
          
          return (
            <div 
              key={`${isTop ? 'top' : 'bottom'}-${index}-${imageId}`} 
              className="w-80 flex-shrink-0 mx-4 cursor-pointer select-none"
              onClick={(e) => {
                if (!isDragging) {
                  onImageClick(image, isTop);
                }
              }}
            >
              <div className="group relative overflow-hidden rounded-xl shadow-lg dark:shadow-dark-card" style={{ width: '320px', height: '288px' }}>
                {/* Backend'den gelen resimler için LazyImage kullan */}
                <LazyImage
                  src={imageUrl}
                  alt={image.originalName || 'Proje görseli'}
                  className="transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                  width={320}
                  height={288}
                  sizes="(max-width: 768px) 100vw, 320px"
                  priority={isPriority}
                  objectFit="cover"
                  quality={75}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

Carousel.displayName = 'Carousel';

export default Carousel;
