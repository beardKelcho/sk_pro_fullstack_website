'use client';

import LazyImage from '@/components/common/LazyImage';
import Image from 'next/image';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQRCode, useUpdateQRCode, useDeleteQRCode, useRegenerateQRImage } from '@/services/qrCodeService';
import { toast } from 'react-toastify';

export default function QRCodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const qrCodeId = id as string;

  const { data, isLoading, error } = useQRCode(qrCodeId);
  const updateMutation = useUpdateQRCode();
  const deleteMutation = useDeleteQRCode();
  const regenerateMutation = useRegenerateQRImage();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQRImageModal, setShowQRImageModal] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrImageLoading, setQrImageLoading] = useState(false);
  const [qrImageError, setQrImageError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    isActive: true,
  });

  const loadQrImage = async (opts?: { openModal?: boolean; silent?: boolean }) => {
    try {
      setQrImageLoading(true);
      setQrImageError(null);
      const result = await regenerateMutation.mutateAsync(qrCodeId);
      setQrImage(result.qrImage);
      if (opts?.openModal) setShowQRImageModal(true);
      if (!opts?.silent) toast.success('QR kod görseli hazır');
    } catch (err) {
      setQrImageError('QR kod görseli alınamadı');
      if (!opts?.silent) toast.error('QR kod görseli alınamadı');
    } finally {
      setQrImageLoading(false);
    }
  };

  // Sayfa açılınca QR görselini otomatik getir
  useEffect(() => {
    loadQrImage({ silent: true }).catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCodeId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">QR kod yüklenirken bir hata oluştu</div>
      </div>
    );
  }

  const { qrCode, relatedItem, scanHistory } = data;

  const handleEdit = () => {
    setEditForm({
      title: qrCode.title || '',
      description: qrCode.description || '',
      isActive: qrCode.isActive,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateMutation.mutateAsync({
        id: qrCodeId,
        data: editForm,
      });
      toast.success('QR kod başarıyla güncellendi');
      setShowEditModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'QR kod güncellenirken bir hata oluştu');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(qrCodeId);
      toast.success('QR kod başarıyla silindi');
      router.push('/admin/qr-codes');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'QR kod silinirken bir hata oluştu');
    }
  };

  const handleRegenerateImage = async () => {
    await loadQrImage({ openModal: true });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href="/admin/qr-codes"
            className="inline-flex items-center text-[#0066CC] dark:text-primary-light hover:underline mb-2"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            QR Kod Listesi
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {qrCode.title || qrCode.code}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerateImage}
            disabled={regenerateMutation.isPending}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            {regenerateMutation.isPending || qrImageLoading ? 'Yükleniyor...' : 'QR Görseli'}
          </button>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded hover:bg-[#0055AA] dark:hover:bg-primary"
          >
            Düzenle
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - QR Kod Bilgileri */}
        <div className="lg:col-span-2 space-y-6">
          {/* QR Kod Detayları */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">QR Kod Bilgileri</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">QR Kod</label>
                <div className="mt-1">
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded block break-all">
                    {qrCode.code}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tip</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {qrCode.type === 'EQUIPMENT' ? 'Ekipman' : qrCode.type === 'PROJECT' ? 'Proje' : 'Özel'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${qrCode.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                    >
                      {qrCode.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </p>
                </div>
              </div>

              {qrCode.title && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Başlık</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{qrCode.title}</p>
                </div>
              )}

              {qrCode.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Açıklama</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{qrCode.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {qrCode.createdAt ? new Date(qrCode.createdAt).toLocaleDateString('tr-TR') : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {qrCode.updatedAt ? new Date(qrCode.updatedAt).toLocaleDateString('tr-TR') : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* İlişkili Kayıt */}
          {relatedItem && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">İlişkili Kayıt</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tip</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{qrCode.relatedType}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">İsim</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{relatedItem.name || relatedItem.title || '-'}</p>
                </div>

                <div>
                  <Link
                    href={
                      qrCode.relatedType === 'Equipment'
                        ? `/admin/inventory/view/${qrCode.relatedId}`
                        : qrCode.relatedType === 'Project'
                          ? `/admin/projects/view/${qrCode.relatedId}`
                          : '#'
                    }
                    className="text-sm text-[#0066CC] dark:text-primary-light hover:underline"
                  >
                    Detayları Görüntüle →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Tarama Geçmişi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tarama Geçmişi</h2>

            {scanHistory && scanHistory.length > 0 ? (
              <div className="space-y-3">
                {scanHistory.map((scan: any, index: number) => (
                  <div
                    key={scan._id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {scan.scannedBy?.name || 'Bilinmeyen Kullanıcı'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {scan.action} • {scan.scannedAt ? new Date(scan.scannedAt).toLocaleString('tr-TR') : '-'}
                      </p>
                      {scan.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{scan.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                Henüz tarama kaydı bulunmuyor
              </p>
            )}
          </div>
        </div>

        {/* Sağ Kolon - İstatistikler */}
        <div className="space-y-6">
          {/* QR Görseli */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">QR Görseli</h2>
              <button
                type="button"
                onClick={() => loadQrImage({ silent: true })}
                disabled={qrImageLoading || regenerateMutation.isPending}
                className="text-sm text-[#0066CC] dark:text-primary-light hover:underline disabled:opacity-50"
              >
                Yenile
              </button>
            </div>

            {qrImageLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0066CC]" />
              </div>
            ) : qrImage ? (
              <div className="space-y-4">
                <div
                  className="w-full flex items-center justify-center bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer"
                  onClick={() => setShowQRImageModal(true)}
                  role="button"
                  tabIndex={0}
                >
                  <LazyImage
                    src={qrImage}
                    alt="QR Kod"
                    className="w-56 h-56 object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQRImageModal(true)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Büyüt
                  </button>
                  <a
                    href={qrImage}
                    download={`${qrCode.title || qrCode.code}-qr-code.png`}
                    className="flex-1 text-center px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded hover:bg-[#0055AA] dark:hover:bg-primary"
                  >
                    İndir
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {qrImageError || 'QR görseli henüz oluşturulmadı.'}
              </div>
            )}
          </div>

          {/* İstatistikler */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">İstatistikler</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Tarama</label>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{qrCode.scanCount}</p>
              </div>

              {qrCode.lastScannedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Tarama</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(qrCode.lastScannedAt).toLocaleString('tr-TR')}
                  </p>
                </div>
              )}

              {qrCode.lastScannedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Tarayan</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {qrCode.lastScannedBy.name || qrCode.lastScannedBy.email || '-'}
                  </p>
                </div>
              )}

              {qrCode.createdBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturan</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {qrCode.createdBy.name || qrCode.createdBy.email || '-'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Düzenleme Modalı */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">QR Kod Düzenle</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Aktif</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="flex-1 px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded hover:bg-[#0055AA] dark:hover:bg-primary disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">QR Kod Sil</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Bu QR kodunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm tarama geçmişi de silinecektir.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Görsel Modalı */}
      {showQRImageModal && qrImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">QR Kod Görseli</h3>
              <button
                onClick={() => {
                  setShowQRImageModal(false);
                  setQrImage(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="text-center mb-4">
              <Image
                src={qrImage || ''}
                alt="QR Kod"
                width={256}
                height={256}
                className="mx-auto border border-gray-200 dark:border-gray-700 rounded"
                priority
              />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                QR kodu yazdırmak için sağ tıklayıp &quot;Resmi Farklı Kaydet&quot; seçeneğini kullanabilirsiniz.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowQRImageModal(false);
                  setQrImage(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Kapat
              </button>
              <a
                href={qrImage}
                download={`${qrCode.title || qrCode.code}-qr-code.png`}
                className="flex-1 text-center px-4 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded hover:bg-[#0055AA] dark:hover:bg-primary"
              >
                İndir
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

