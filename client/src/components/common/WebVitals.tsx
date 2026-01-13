"use client";

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

interface WebVitalsProps {
  analyticsId?: string;
}

export const WebVitals = ({ analyticsId }: WebVitalsProps) => {
  useReportWebVitals((metric) => {
    // Web Vitals metriklerini konsola yazdır
    console.log(metric);

    // Google Analytics'e gönder (eğer analyticsId varsa)
    if (analyticsId) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
        metric_label: metric.label,
      });
    }
  });

  return null;
}; 