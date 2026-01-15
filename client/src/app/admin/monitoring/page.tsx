'use client';

/**
 * Monitoring Dashboard Page
 * Production monitoring ve performance metrics görüntüleme sayfası
 */

import { useState } from 'react';
import { useMonitoringDashboard } from '@/services/monitoringService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type TimeRange = '1h' | '24h' | '7d' | '30d';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function MonitoringPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const { data, isLoading, error } = useMonitoringDashboard(timeRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Hata</h2>
          <p className="text-red-600">
            Monitoring verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-yellow-800 font-semibold mb-2">Veri Yok</h2>
          <p className="text-yellow-600">
            Seçilen zaman aralığında veri bulunamadı.
          </p>
        </div>
      </div>
    );
  }

  // Grafik verileri hazırla
  const performanceData = [
    { name: 'Ortalama', value: data.performance.averagePageLoadTime },
    { name: 'P95', value: data.performance.p95PageLoadTime },
  ];

  const apiMetricsData = data.apiMetrics.slowestEndpoints.map((endpoint) => ({
    name: endpoint.endpoint.split('/').pop() || endpoint.endpoint,
    time: endpoint.averageTime,
    count: endpoint.requestCount,
  }));

  const topPagesData = data.userActivity.topPages.map((page) => ({
    name: page.path.split('/').pop() || page.path,
    value: page.views,
  }));

  const errorData = data.errors.topErrors.map((error) => ({
    name: error.message.substring(0, 30) + (error.message.length > 30 ? '...' : ''),
    value: error.count,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-1">Production performance ve sistem metrikleri</p>
        </div>
        <div className="flex gap-2">
          {(['1h', '24h', '7d', '30d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '1h' ? '1 Saat' : range === '24h' ? '24 Saat' : range === '7d' ? '7 Gün' : '30 Gün'}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Ortalama Sayfa Yükleme</h3>
          <p className="text-3xl font-bold text-gray-900">
            {data.performance.averagePageLoadTime.toFixed(0)}ms
          </p>
          <p className="text-sm text-gray-500 mt-1">P95: {data.performance.p95PageLoadTime.toFixed(0)}ms</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Ortalama API Yanıt Süresi</h3>
          <p className="text-3xl font-bold text-gray-900">
            {data.performance.averageApiResponseTime.toFixed(0)}ms
          </p>
          <p className="text-sm text-gray-500 mt-1">P95: {data.performance.p95ApiResponseTime.toFixed(0)}ms</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">API Başarı Oranı</h3>
          <p className="text-3xl font-bold text-green-600">
            {data.apiMetrics.successRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {data.apiMetrics.totalRequests} istek
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Aktif Kullanıcılar</h3>
          <p className="text-3xl font-bold text-blue-600">
            {data.userActivity.activeUsers}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {data.userActivity.totalSessions} oturum
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* API Response Times */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">En Yavaş Endpoint&apos;ler</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={apiMetricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="time" fill="#8884d8" name="Ortalama Süre (ms)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">En Çok Ziyaret Edilen Sayfalar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topPagesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topPagesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Metrics */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hata Metrikleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700">Toplam Hata</span>
              <span className="text-2xl font-bold text-red-600">{data.errors.totalErrors}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Hata Oranı</span>
              <span className="text-2xl font-bold text-red-600">
                {data.errors.errorRate.toFixed(2)}%
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">En Çok Görülen Hatalar</h4>
            <div className="space-y-2">
              {data.errors.topErrors.slice(0, 5).map((error, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 truncate flex-1 mr-2">{error.message}</span>
                  <span className="text-gray-900 font-medium">{error.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Activity Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kullanıcı Aktivitesi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Ortalama Oturum Süresi</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(data.userActivity.averageSessionDuration / 60)} dakika
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Toplam Oturum</p>
            <p className="text-2xl font-bold text-gray-900">{data.userActivity.totalSessions}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Aktif Kullanıcı</p>
            <p className="text-2xl font-bold text-blue-600">{data.userActivity.activeUsers}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
