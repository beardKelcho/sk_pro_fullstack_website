"use client";

import { useReportWebVitals } from 'next/web-vitals';
import logger from '@/utils/logger';

interface WebVitalsProps {
  analyticsId?: string;
}

type WebVitalMetricPayload = {
  value: number;
  metric_id: string;
  metric_value: number;
  metric_delta: number;
  metric_label: string;
};

type GtagFn = (
  command: 'event' | 'config' | 'js',
  target: string | Date,
  params?: WebVitalMetricPayload | Record<string, string | number | boolean | undefined>
) => void;

type StoredWebVital = {
  name: string;
  value: number;
  delta: number;
  id: string;
  label: string;
  timestamp: string;
};

export const WebVitals = ({ analyticsId }: WebVitalsProps) => {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === 'development' && ['LCP', 'FID', 'CLS'].includes(metric.name)) {
      logger.info(`Web Vital: ${metric.name}`, metric.value);
    }

    if (analyticsId && typeof window !== 'undefined' && typeof window.gtag === 'function') {
      (window.gtag as GtagFn)('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
        metric_label: metric.label,
      });
    }

    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      const criticalMetrics = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'];

      if (criticalMetrics.includes(metric.name)) {
        try {
          const vitals = JSON.parse(localStorage.getItem('webVitals') || '[]') as StoredWebVital[];
          vitals.push({
            name: metric.name,
            value: metric.value,
            delta: metric.delta,
            id: metric.id,
            label: metric.label,
            timestamp: new Date().toISOString(),
          });

          if (vitals.length > 100) {
            vitals.shift();
          }

          localStorage.setItem('webVitals', JSON.stringify(vitals));
        } catch {
          // Sessizce devam et
        }
      }
    }
  });

  return null;
};
