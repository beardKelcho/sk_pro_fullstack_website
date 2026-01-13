import React from 'react';
import { usePerformance, useWebVitals } from '@/hooks/usePerformance';

interface PerformanceMonitorProps {
  showAlerts?: boolean;
  showMetrics?: boolean;
  thresholds?: {
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  };
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showAlerts = true,
  showMetrics = true,
  thresholds,
}) => {
  const { webVitals, metrics, isLoading, error } = usePerformance();
  const { alerts } = useWebVitals(thresholds);

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Performance metrics loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">Error loading performance metrics: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showAlerts && (
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Web Vitals Alerts</h3>
          <div className="space-y-2">
            {Object.entries(alerts).map(([metric, isAlert]) => (
              isAlert && (
                <div key={metric} className="flex items-center text-red-600">
                  <span className="mr-2">⚠️</span>
                  <span>{metric.toUpperCase()} threshold exceeded</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {showMetrics && (
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Web Vitals Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(webVitals).map(([metric, value]) => (
              <div key={metric} className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">{metric.toUpperCase()}</div>
                <div className="text-lg font-semibold">
                  {value !== null && value !== undefined && typeof value === 'number' ? `${value.toFixed(2)}ms` : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {metrics.size > 0 && (
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Custom Metrics</h3>
          <div className="space-y-4">
            {Array.from(metrics.entries()).map(([name, metricList]) => (
              <div key={name} className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">{name}</div>
                <div className="text-lg font-semibold">
                  {metricList.length > 0
                    ? `${(metricList.reduce((acc, m) => acc + m.value, 0) / metricList.length).toFixed(2)}ms`
                    : 'N/A'}
                </div>
                <div className="text-xs text-gray-500">
                  {metricList.length} measurements
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface PerformanceChartProps {
  metricName: string;
  data: Array<{ timestamp: number; value: number }>;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  metricName,
  data,
}) => {
  if (data.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded">
        <p className="text-gray-600">No data available for {metricName}</p>
      </div>
    );
  }

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((acc, val) => acc + val, 0) / values.length;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">{metricName} Performance</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Min: {min.toFixed(2)}ms</span>
          <span>Max: {max.toFixed(2)}ms</span>
          <span>Avg: {avg.toFixed(2)}ms</span>
        </div>
        <div className="h-32 bg-gray-100 rounded relative">
          {data.map((point, index) => (
            <div
              key={index}
              className="absolute bottom-0 w-1 bg-blue-500"
              style={{
                left: `${(index / (data.length - 1)) * 100}%`,
                height: `${((point.value - min) / (max - min)) * 100}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 