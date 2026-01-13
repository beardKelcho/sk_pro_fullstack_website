'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface SiteImage {
  _id?: string;
  id?: string;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  category: 'project' | 'gallery' | 'hero' | 'other';
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

const Carousel: React.FC<CarouselProps> = ({
  images,
  direction,
  isPaused,
  onImageClick,
  isTop,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Perfect loop için: resimlerin genişliğini hesapla
  const imageWidth = 320 + 32; // w-80 (320px) + mx-4 (16px her iki tarafta = 32px toplam)
  const singleSetWidth = images.length > 0 ? images.length * imageWidth : 0;

  // Animasyon için - Perfect Loop (sürekli akar, durmaz)
  useEffect(() => {
    if (!scrollRef.current || isDragging || images.length === 0) {
      return;
    }

    const scrollContainer = scrollRef.current;
    let animationId: number;
    let lastTime = performance.now();
    // Yavaşlatılmış hız: 0.3 (önceden 0.1 idi)
    const speed = direction === 'right' ? -0.3 : 0.3; // right = sağdan sola, left = soldan sağa

    const animate = (currentTime: number) => {
      // isPaused kontrolünü kaldırdık - sürekli akacak
      if (isDragging) return;

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (scrollContainer && singleSetWidth > 0) {
        const currentScroll = scrollContainer.scrollLeft;
        
        let newScroll = currentScroll + speed * (deltaTime * 0.1);

        // Perfect loop mantığı: İlk set tamamlandığında görünmez bir şekilde başa dön
        // Resimler 2 kez kopyalandığı için, ilk set tamamlandığında ikinci set'in başına geçiyoruz
        // Ama görsel olarak aynı olduğu için geçiş hissedilmez
        if (direction === 'right') {
          // Sağdan sola: scroll azalıyor
          if (newScroll <= 0) {
            // İlk set tamamlandı, ikinci set'e geç (görsel olarak aynı, görünmez geçiş)
            newScroll = singleSetWidth;
          }
        } else {
          // Soldan sağa: scroll artıyor
          if (newScroll >= singleSetWidth) {
            // İlk set tamamlandı, başa dön (görsel olarak aynı, görünmez geçiş)
            newScroll = 0;
          }
        }

        scrollContainer.scrollLeft = newScroll;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [images, direction, isDragging, singleSetWidth]);

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

  // Resimleri iki kez kopyala (smooth loop için)
  const duplicatedImages = [...images, ...images];

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
      style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
    >
      <div 
        ref={scrollRef}
        className="flex flex-nowrap whitespace-nowrap"
        style={{ 
          scrollBehavior: 'auto',
          overflowX: 'hidden', // Scroll bar gizlendi, perfect loop için
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {duplicatedImages.map((image, index) => {
          const imageId = image._id || image.id || image.filename;
          
          // Resmi ID ile serve et - veritabanı ID'si kullan
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          // API_URL zaten /api içeriyor mu kontrol et
          const baseUrl = API_URL.endsWith('/api') ? API_URL.replace(/\/api$/, '') : API_URL.replace(/\/api\/?$/, '');
          let imageUrl = '';
          
          // Önce ID'yi kontrol et
          if (image._id || image.id) {
            const dbId = image._id || image.id;
            // ID ile resmi serve eden endpoint'i kullan - çift /api/ olmaması için dikkatli
            imageUrl = `${baseUrl}/api/site-images/public/${dbId}/image`;
          } else {
            // Fallback: Eski yöntem (filename/path ile)
            imageUrl = image.url || '';
            if (!imageUrl && image.path) {
              imageUrl = image.path;
            }
            if (!imageUrl && image.filename) {
              imageUrl = `/uploads/site-images/${image.filename}`;
            }
            
            // Geçersiz URL kontrolü
            if (!imageUrl || imageUrl.trim() === '' || imageUrl === '/') {
              console.warn('Geçersiz resim URL ve ID yok, render edilmiyor:', image);
              return null;
            }
            
            // Eğer /uploads/ ile başlıyorsa, backend URL'ine çevir
            if (imageUrl.startsWith('/uploads/')) {
              imageUrl = `${baseUrl}${imageUrl}`;
            } else if (!imageUrl.startsWith('http')) {
              // Eğer relative path ise, / ekle ve backend URL'ine çevir
              if (!imageUrl.startsWith('/')) {
                imageUrl = `/${imageUrl}`;
              }
              imageUrl = `${baseUrl}${imageUrl}`;
            }
          }
          
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
              <div className="group relative overflow-hidden rounded-xl shadow-lg dark:shadow-dark-card h-72">
                {/* Backend'den gelen resimler için normal img tag kullan */}
                <img 
                  src={imageUrl} 
                  alt={image.originalName || 'Proje görseli'} 
                  loading="lazy"
                  className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                  draggable={false}
                  onError={(e) => {
                    console.error('Resim yüklenemedi, gizleniyor:', imageUrl, image);
                    // Resmi gizle
                    const imgElement = e.currentTarget;
                    if (imgElement.parentElement) {
                      imgElement.parentElement.style.display = 'none';
                    }
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Carousel;
