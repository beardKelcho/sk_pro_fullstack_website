import { useState, useEffect } from 'react';
import { performance, PerformanceMetric, WebVitals } from '@/utils/performance';

interface PerformanceState {
  webVitals: WebVitals;
  metrics: Map<string, PerformanceMetric[]>;
  isLoading: boolean;
  error: string | null;
}

export function usePerformance() {
  const [state, setState] = useState<PerformanceState>({
    webVitals: {
      fcp: null,
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null,
    },
    metrics: new Map(),
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initPerformance = () => {
      try {
        const webVitals = performance.getWebVitals();
        setState({
          webVitals,
          metrics: new Map(),
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          webVitals: {
            fcp: null,
            lcp: null,
            fid: null,
            cls: null,
            ttfb: null,
          },
          metrics: new Map(),
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize performance monitoring',
        });
      }
    };

    initPerformance();
  }, []);

  const recordMetric = (name: string, value: number, metadata?: Record<string, any>) => {
    try {
      performance.recordMetric(name, value, metadata);
      const metrics = performance.getMetrics(name);
      setState(prev => ({
        ...prev,
        metrics: new Map(prev.metrics).set(name, metrics),
      }));
    } catch (error) {
      console.error('Failed to record metric:', error);
    }
  };

  const getMetrics = (name: string) => {
    return performance.getMetrics(name);
  };

  const getAverageMetricValue = (name: string) => {
    return performance.getAverageMetricValue(name);
  };

  const clearMetrics = (name?: string) => {
    performance.clearMetrics(name);
    setState(prev => ({
      ...prev,
      metrics: new Map(),
    }));
  };

  return {
    ...state,
    recordMetric,
    getMetrics,
    getAverageMetricValue,
    clearMetrics,
  };
}

interface PerformanceThresholds {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fcp: 1800, // 1.8 saniye
  lcp: 2500, // 2.5 saniye
  fid: 100, // 100ms
  cls: 0.1, // 0.1
  ttfb: 800, // 800ms
};

export function useWebVitals(thresholds: Partial<PerformanceThresholds> = {}) {
  const { webVitals, isLoading, error } = usePerformance();
  const [alerts, setAlerts] = useState<Record<keyof WebVitals, boolean>>({
    fcp: false,
    lcp: false,
    fid: false,
    cls: false,
    ttfb: false,
  });

  useEffect(() => {
    if (isLoading || error) return;

    const newAlerts: Record<keyof WebVitals, boolean> = {
      fcp: webVitals.fcp !== null && webVitals.fcp > (thresholds.fcp || DEFAULT_THRESHOLDS.fcp),
      lcp: webVitals.lcp !== null && webVitals.lcp > (thresholds.lcp || DEFAULT_THRESHOLDS.lcp),
      fid: webVitals.fid !== null && webVitals.fid > (thresholds.fid || DEFAULT_THRESHOLDS.fid),
      cls: webVitals.cls !== null && webVitals.cls > (thresholds.cls || DEFAULT_THRESHOLDS.cls),
      ttfb: webVitals.ttfb !== null && webVitals.ttfb > (thresholds.ttfb || DEFAULT_THRESHOLDS.ttfb),
    };

    setAlerts(newAlerts);
  }, [webVitals, isLoading, error, thresholds]);

  return {
    webVitals,
    alerts,
    isLoading,
    error,
  };
} 