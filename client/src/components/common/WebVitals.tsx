"use client";

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import apiClient from '@/services/api/axios';

interface WebVitalsProps {
  analyticsId?: string;
}

export const WebVitals = ({ analyticsId }: WebVitalsProps) => {
  useReportWebVitals((metric) => {
    // Web Vitals metriklerini logger ile yazdır (sadece kritik metrikler)
    if (process.env.NODE_ENV === 'development' && ['LCP', 'FID', 'CLS'].includes(metric.name)) {
      // Sadece kritik metrikleri logla
      const logger = require('@/utils/logger').default;
      logger.info('Web Vital:', metric.name, metric.value);
    }

    // Google Analytics'e gönder (eğer analyticsId varsa)
    if (analyticsId && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
        metric_label: metric.label,
      });
    }

    // Backend'e gönder (opsiyonel - backend endpoint'i varsa)
    // Production'da kritik metrikleri backend'e gönder
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      const criticalMetrics = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'];
      
      if (criticalMetrics.includes(metric.name)) {
        // Backend'de web-vitals endpoint'i varsa kullan
        // Şimdilik localStorage'a kaydet
        try {
          const vitals = JSON.parse(localStorage.getItem('webVitals') || '[]');
          vitals.push({
            name: metric.name,
            value: metric.value,
            delta: metric.delta,
            id: metric.id,
            label: metric.label,
            timestamp: new Date().toISOString(),
          });

          // Son 100 metriği sakla
          if (vitals.length > 100) {
            vitals.shift();
          }

          localStorage.setItem('webVitals', JSON.stringify(vitals));
        } catch (error) {
          // Sessizce devam et
        }
      }
    }
  });

  return null;
}; 