'use client';

import Image from 'next/image';

interface EditFormState {
  title: string;
  description: string;
  isActive: boolean;
}

interface QRCodeDetailModalsProps {
  showEditModal: boolean;
  showDeleteModal: boolean;
  showQRImageModal: boolean;
  qrImage: string | null;
  qrCodeLabel: string;
  editForm: EditFormState;
  updatePending: boolean;
  deletePending: boolean;
  onEditFieldChange: <K extends keyof EditFormState>(field: K, value: EditFormState[K]) => void;
  onCloseEdit: () => void;
  onSaveEdit: () => void;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
  onCloseImage: () => void;
}

export default function QRCodeDetailModals({
  showEditModal,
  showDeleteModal,
  showQRImageModal,
  qrImage,
  qrCodeLabel,
  editForm,
  updatePending,
  deletePending,
  onEditFieldChange,
  onCloseEdit,
  onSaveEdit,
  onCloseDelete,
  onConfirmDelete,
  onCloseImage,
}: QRCodeDetailModalsProps) {
  return (
    <>
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">QR Kod Düzenle</h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Başlık</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(event) => onEditFieldChange('title', event.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Açıklama</label>
                <textarea
                  value={editForm.description}
                  onChange={(event) => onEditFieldChange('description', event.target.value)}
                  rows={3}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(event) => onEditFieldChange('isActive', event.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Aktif</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={onCloseEdit}
                className="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={onSaveEdit}
                disabled={updatePending}
                className="flex-1 rounded bg-[#0066CC] px-4 py-2 text-white hover:bg-[#0055AA] disabled:opacity-50 dark:bg-primary-light dark:hover:bg-primary"
              >
                {updatePending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">QR Kod Sil</h3>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Bu QR kodunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm tarama geçmişi de
              silinecektir.
            </p>
            <div className="flex gap-2">
              <button
                onClick={onCloseDelete}
                className="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={onConfirmDelete}
                disabled={deletePending}
                className="flex-1 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletePending ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showQRImageModal && qrImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">QR Kod Görseli</h3>
              <button
                onClick={onCloseImage}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 text-center">
              <Image
                src={qrImage}
                alt="QR Kod"
                width={256}
                height={256}
                className="mx-auto rounded border border-gray-200 dark:border-gray-700"
                priority
              />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                QR kodu yazdırmak için sağ tıklayıp &quot;Resmi Farklı Kaydet&quot; seçeneğini kullanabilirsiniz.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onCloseImage}
                className="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Kapat
              </button>
              <a
                href={qrImage}
                download={`${qrCodeLabel}-qr-code.png`}
                className="flex-1 rounded bg-[#0066CC] px-4 py-2 text-center text-white hover:bg-[#0055AA] dark:bg-primary-light dark:hover:bg-primary"
              >
                İndir
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
