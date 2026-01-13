'use client';

import React from 'react';
import Script from 'next/script';

// Google Analytics ID'si
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Google Analytics gtag type declaration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Sayfa görüntüleme olayını gönder
export const pageview = (url: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: url,
      send_page_view: true,
    });
  }
};

// Özel olay gönder
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Google Analytics script'ini yükle
export const GoogleAnalytics = () => {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
            });
          `,
        }}
      />
    </>
  );
};

// Kullanıcı davranışlarını izle
export const trackUserBehavior = {
  // Form gönderimi
  trackFormSubmission: (formId: string, formData: any) => {
    event({
      action: 'form_submission',
      category: 'form',
      label: formId,
    });
  },

  // Buton tıklaması
  trackButtonClick: (buttonId: string, buttonText: string) => {
    event({
      action: 'button_click',
      category: 'interaction',
      label: `${buttonId} - ${buttonText}`,
    });
  },

  // Sayfa görüntüleme süresi
  trackPageViewDuration: (duration: number) => {
    event({
      action: 'page_view_duration',
      category: 'engagement',
      value: duration,
    });
  },

  // Scroll derinliği
  trackScrollDepth: (depth: number) => {
    event({
      action: 'scroll_depth',
      category: 'engagement',
      value: depth,
    });
  },

  // Video etkileşimi
  trackVideoInteraction: (videoId: string, action: 'play' | 'pause' | 'complete') => {
    event({
      action: `video_${action}`,
      category: 'video',
      label: videoId,
    });
  },

  // Arama yapma
  trackSearch: (searchTerm: string, resultCount: number) => {
    event({
      action: 'search',
      category: 'search',
      label: searchTerm,
      value: resultCount,
    });
  },

  // Dosya indirme
  trackFileDownload: (fileName: string, fileType: string) => {
    event({
      action: 'file_download',
      category: 'download',
      label: `${fileName} (${fileType})`,
    });
  },

  // Hata izleme
  trackError: (errorType: string, errorMessage: string) => {
    event({
      action: 'error',
      category: 'error',
      label: `${errorType}: ${errorMessage}`,
    });
  },
};

// E-ticaret olayları
export const trackEcommerce = {
  // Ürün görüntüleme
  trackProductView: (productId: string, productName: string, price: number) => {
    event({
      action: 'view_item',
      category: 'ecommerce',
      label: `${productId} - ${productName}`,
      value: price,
    });
  },

  // Sepete ekleme
  trackAddToCart: (productId: string, productName: string, price: number) => {
    event({
      action: 'add_to_cart',
      category: 'ecommerce',
      label: `${productId} - ${productName}`,
      value: price,
    });
  },

  // Satın alma
  trackPurchase: (orderId: string, total: number) => {
    event({
      action: 'purchase',
      category: 'ecommerce',
      label: orderId,
      value: total,
    });
  },
}; 