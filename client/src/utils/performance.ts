export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface WebVitals {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private readonly STORAGE_KEY = 'performance_metrics';
  private readonly MAX_METRICS = 1000;

  private constructor() {
    this.loadMetrics();
    this.initWebVitals();
  }

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.metrics = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  }

  private saveMetrics(): void {
    try {
      const data = Object.fromEntries(this.metrics);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save performance metrics:', error);
    }
  }

  private initWebVitals(): void {
    if (typeof window === 'undefined') return;

    // First Contentful Paint (FCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        this.recordMetric('fcp', entry.startTime);
      });
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        this.recordMetric('lcp', entry.startTime);
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const firstInput = entry as PerformanceEventTiming;
        this.recordMetric('fid', firstInput.processingStart - firstInput.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.recordMetric('cls', clsValue);
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });

    // Time to First Byte (TTFB)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const navEntry = entry as PerformanceNavigationTiming;
        this.recordMetric('ttfb', navEntry.responseStart - navEntry.requestStart);
      });
    }).observe({ entryTypes: ['navigation'] });
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    const metrics = this.metrics.get(name) || [];
    metrics.push(metric);

    // Eski metrikleri temizle
    if (metrics.length > this.MAX_METRICS) {
      metrics.splice(0, metrics.length - this.MAX_METRICS);
    }

    this.metrics.set(name, metrics);
    this.saveMetrics();

    // Kritik metrikleri sunucuya gönder
    if (this.isCriticalMetric(name)) {
      this.sendMetricToServer(metric);
    }
  }

  private isCriticalMetric(name: string): boolean {
    return ['fcp', 'lcp', 'fid', 'cls', 'ttfb'].includes(name);
  }

  private async sendMetricToServer(metric: PerformanceMetric): Promise<void> {
    try {
      await fetch('/api/performance/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.error('Failed to send metric to server:', error);
    }
  }

  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || [];
  }

  getWebVitals(): WebVitals {
    const metrics = this.metrics;
    return {
      fcp: this.getLatestMetricValue('fcp'),
      lcp: this.getLatestMetricValue('lcp'),
      fid: this.getLatestMetricValue('fid'),
      cls: this.getLatestMetricValue('cls'),
      ttfb: this.getLatestMetricValue('ttfb'),
    };
  }

  private getLatestMetricValue(name: string): number | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;
    return metrics[metrics.length - 1].value;
  }

  getAverageMetricValue(name: string): number | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;

    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
    this.saveMetrics();
  }
}

export const performanceMonitoringService = PerformanceMonitoringService.getInstance();

// Performance monitoring için yardımcı fonksiyonlar
export const performance = {
  recordMetric: (name: string, value: number, metadata?: Record<string, any>) => 
    performanceMonitoringService.recordMetric(name, value, metadata),
  getMetrics: (name: string) => performanceMonitoringService.getMetrics(name),
  getWebVitals: () => performanceMonitoringService.getWebVitals(),
  getAverageMetricValue: (name: string) => performanceMonitoringService.getAverageMetricValue(name),
  clearMetrics: (name?: string) => performanceMonitoringService.clearMetrics(name),
}; 