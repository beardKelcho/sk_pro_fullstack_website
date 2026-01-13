'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs, AuditLog, AuditLogFilters } from '@/services/auditLogService';
import { toast } from 'react-toastify';

const actionLabels: Record<string, string> = {
  'CREATE': 'Oluşturuldu',
  'UPDATE': 'Güncellendi',
  'DELETE': 'Silindi',
  'VIEW': 'Görüntülendi',
  'EXPORT': 'Dışa Aktarıldı',
  'LOGIN': 'Giriş Yapıldı',
  'LOGOUT': 'Çıkış Yapıldı',
  'PERMISSION_CHANGE': 'Yetki Değiştirildi',
};

const resourceLabels: Record<string, string> = {
  'Equipment': 'Ekipman',
  'Project': 'Proje',
  'Task': 'Görev',
  'User': 'Kullanıcı',
  'Client': 'Müşteri',
  'Maintenance': 'Bakım',
  'SiteImage': 'Site Resmi',
  'SiteContent': 'Site İçeriği',
  'QRCode': 'QR Kod',
  'Notification': 'Bildirim',
  'System': 'Sistem',
};

const actionColors: Record<string, string> = {
  'CREATE': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  'UPDATE': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  'DELETE': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  'VIEW': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  'EXPORT': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
  'LOGIN': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400',
  'LOGOUT': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  'PERMISSION_CHANGE': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
};

export default function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 50,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: () => getAuditLogs(filters),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400">
        Hata: {error instanceof Error ? error.message : 'Bilinmeyen hata'}
      </div>
    );
  }

  const logs = data?.logs || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Aktivite Logları</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-300">
          Sistemdeki tüm aktiviteleri görüntüleyin ve takip edin
        </p>
      </div>

      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="resource-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kaynak
            </label>
            <select
              id="resource-filter"
              value={filters.resource || ''}
              onChange={(e) => handleFilterChange('resource', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Tüm Kaynaklar</option>
              {Object.entries(resourceLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              İşlem
            </label>
            <select
              id="action-filter"
              value={filters.action || ''}
              onChange={(e) => handleFilterChange('action', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Tüm İşlemler</option>
              {Object.entries(actionLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              id="start-date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              id="end-date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Log Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Aktivite logu bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kaynak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Detaylar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.user?.name || 'Sistem'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {log.user?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${actionColors[log.action] || 'bg-gray-100 dark:bg-gray-700'}`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {resourceLabels[log.resource] || log.resource}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {log.changes && log.changes.length > 0 ? (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 dark:text-blue-400 hover:underline">
                            {log.changes.length} değişiklik
                          </summary>
                          <div className="mt-2 space-y-1">
                            {log.changes.map((change, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-medium">{change.field}:</span>{' '}
                                <span className="text-red-600 dark:text-red-400">{String(change.oldValue)}</span>
                                {' → '}
                                <span className="text-green-600 dark:text-green-400">{String(change.newValue)}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
            disabled={filters.page === 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Önceki
          </button>
          <span className="text-gray-700 dark:text-gray-200">
            Sayfa {filters.page || 1} / {totalPages}
          </span>
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
            disabled={(filters.page || 1) >= totalPages}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}

