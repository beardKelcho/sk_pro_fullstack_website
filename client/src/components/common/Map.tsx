import logger from '@/utils/logger';
import React, { useState, useEffect } from 'react';
import Icon from './Icon';

interface MapProps {
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  onOpenMobileNavigation: () => void;
}

const Map: React.FC<MapProps> = ({ location, onOpenMobileNavigation }) => {
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    try {
      // Adres parametresini URL'ye ekle
      const encodedAddress = encodeURIComponent(location.address);
      
      // API anahtarını çevresel değişkenden al
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      // Eğer API anahtarı yoksa veya geçersizse, statik harita URL'si kullan
      if (!apiKey) {
        // Sadece development'ta uyarı ver, production'da sessizce statik harita kullan
        if (process.env.NODE_ENV === 'development') {
          // Uyarıyı sadece development'ta göster
          // logger.warn('Google Maps API anahtarı bulunamadı. Statik harita kullanılıyor.');
        }
        // Statik harita alternatifi
        setIframeSrc(`https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`);
      } else {
        // API anahtarı ile embed URL'si kullan
        setIframeSrc(`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}&center=${location.lat},${location.lng}&zoom=16`);
      }
      
      setIsLoading(false);
    } catch (error) {
      logger.error('Harita yüklenirken hata oluştu:', error);
      setHasError(true);
      setIsLoading(false);
    }
  }, [location]);

  // Harita yüklenirken hata oluştu
  const handleMapError = () => {
    setHasError(true);
  };
  
  return (
    <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative group">
        {isLoading ? (
          <div className="h-[300px] w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <span className="text-gray-500 dark:text-gray-400">Harita yükleniyor...</span>
          </div>
        ) : hasError ? (
          <div className="h-[300px] w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-4">
            <span className="text-red-500 mb-2">Harita yüklenemedi.</span>
            <button 
              onClick={onOpenMobileNavigation}
              className="bg-[#0066CC] dark:bg-primary-light text-white px-4 py-2 rounded-md hover:bg-[#0055AA] dark:hover:bg-primary transition-colors duration-300"
            >
              <Icon name="location" className="inline w-4 h-4 mr-2" />
              Yol Tarifi Al
            </button>
          </div>
        ) : (
          <>
            <iframe
              src={iframeSrc}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
              title="Google Maps"
              onError={handleMapError}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-white/90 dark:bg-dark-surface/90 px-4 py-2 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={onOpenMobileNavigation}
                    className="text-gray-800 dark:text-white text-sm font-medium flex items-center hover:text-[#0066CC] dark:hover:text-primary-light transition-colors duration-300"
                  >
                    <Icon name="location" className="w-4 h-4 mr-2" />
                    Yol Tarifi Al
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Map; 