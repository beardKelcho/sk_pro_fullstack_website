'use client';

import { useState } from 'react';
import { useQRCodes, useDeleteQRCode, useCreateQRCode } from '@/services/qrCodeService';
import { toast } from 'react-toastify';
import QRScanner from '@/components/admin/QRScanner';
import Link from 'next/link';
import Image from 'next/image';
import logger from '@/utils/logger';

export default function QRCodesPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannerAction, setScannerAction] = useState<'VIEW' | 'CHECK_IN' | 'CHECK_OUT' | 'MAINTENANCE' | 'OTHER'>('VIEW');
  const [filters, setFilters] = useState<{
    type?: string;
    isActive?: boolean;
    relatedType?: string;
    page?: number;
    limit?: number;
  }>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading, error } = useQRCodes(filters);
  const deleteMutation = useDeleteQRCode();
  const createMutation = useCreateQRCode();

  const handleDelete = async (id: string) => {
    if (!confirm('Bu QR kodunu silmek istediğinize emin misiniz?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('QR kod başarıyla silindi');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'QR kod silinirken bir hata oluştu');
    }
  };

  const handleScanSuccess = (result: any) => {
    // QR kod tarandı, detay sayfasına yönlendir veya modal göster
    if (process.env.NODE_ENV === 'development') {
      logger.debug('QR kod tarandı:', result);
    }

    // İşlem tipine göre yönlendirme
    if (result.qrCode) {
      if (result.qrCode.relatedType === 'Equipment') {
        // Ekipman için hızlı işlemler
        if (scannerAction === 'CHECK_IN' || scannerAction === 'CHECK_OUT') {
          // Ekipman durumunu güncelle (check-in/out)
          toast.info('Ekipman durumu güncelleniyor...');
          // Burada ekipman durumunu güncelleme işlemi yapılabilir
        }
        window.location.href = `/admin/inventory/view/${result.qrCode.relatedId}`;
      } else if (result.qrCode.relatedType === 'Project') {
        window.location.href = `/admin/projects/view/${result.qrCode.relatedId}`;
      } else {
        // QR kod detay sayfasına yönlendir
        window.location.href = `/admin/qr-codes/${result.qrCode._id || result.qrCode.id}`;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">QR kodlar yüklenirken bir hata oluştu</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Kod Yönetimi</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setScannerAction('VIEW');
              setShowScanner(true);
            }}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            QR Kod Tara
          </button>
          <div className="relative group">
            <button className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
              Hızlı İşlemler ▼
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={() => {
                  setScannerAction('CHECK_IN');
                  setShowScanner(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
              >
                Check-In (Giriş)
              </button>
              <button
                onClick={() => {
                  setScannerAction('CHECK_OUT');
                  setShowScanner(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Check-Out (Çıkış)
              </button>
              <button
                onClick={() => {
                  setScannerAction('MAINTENANCE');
                  setShowScanner(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
              >
                Bakım İşlemi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.type || ''}
            onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined, page: 1 })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tüm Tipler</option>
            <option value="EQUIPMENT">Ekipman</option>
            <option value="PROJECT">Proje</option>
            <option value="CUSTOM">Özel</option>
          </select>

          <select
            value={filters.isActive === undefined ? '' : filters.isActive.toString()}
            onChange={(e) =>
              setFilters({
                ...filters,
                isActive: e.target.value === '' ? undefined : e.target.value === 'true',
                page: 1,
              })
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tüm Durumlar</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>

          <select
            value={filters.relatedType || ''}
            onChange={(e) => setFilters({ ...filters, relatedType: e.target.value || undefined, page: 1 })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tüm İlişkiler</option>
            <option value="Equipment">Ekipman</option>
            <option value="Project">Proje</option>
            <option value="Other">Diğer</option>
          </select>

          <button
            onClick={() => setFilters({ page: 1, limit: 20 })}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Filtreleri Temizle
          </button>
        </div>
      </div>

      {/* QR Kod Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.qrCodes.map((qrCode) => (
          <div
            key={qrCode._id || qrCode.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {qrCode.title || qrCode.code}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {qrCode.type} - {qrCode.relatedType}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded ${qrCode.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
              >
                {qrCode.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">QR Kod:</p>
              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded block break-all">
                {qrCode.code}
              </code>
            </div>

            {qrCode.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{qrCode.description}</p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>Tarama: {qrCode.scanCount}</span>
              {qrCode.lastScannedAt && (
                <span>{new Date(qrCode.lastScannedAt).toLocaleDateString('tr-TR')}</span>
              )}
            </div>

            <div className="flex gap-2">
              <Link
                href={`/admin/qr-codes/${qrCode._id || qrCode.id}`}
                className="flex-1 text-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Detay
              </Link>
              <button
                onClick={() => handleDelete(qrCode._id || qrCode.id || '')}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
            disabled={filters.page === 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Önceki
          </button>
          <span className="text-gray-600 dark:text-gray-400">
            Sayfa {data.page} / {data.totalPages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
            disabled={filters.page === data.totalPages}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
          action={scannerAction}
        />
      )}
    </div>
  );
}

