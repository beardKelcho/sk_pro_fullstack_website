'use client';

import React, { useRef, useState } from 'react';
import { useVersionHistory, useRollbackVersion, VersionHistory } from '@/services/versionHistoryService';
import { toast } from 'react-toastify';
import { useModalA11y } from '@/hooks/useModalA11y';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: 'Equipment' | 'Project' | 'Task' | 'Client' | 'Maintenance';
  resourceId: string;
  resourceName?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'Boş';
  if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

export default function VersionHistoryModal({
  isOpen,
  onClose,
  resource,
  resourceId,
  resourceName,
}: VersionHistoryModalProps) {
  const [page, setPage] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState<VersionHistory | null>(null);
  const { data, isLoading, error } = useVersionHistory(resource, resourceId, page, 20);
  const rollbackMutation = useRollbackVersion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const versions = data?.versions || [];
  const totalPages = data?.totalPages || 1;

  const handleRollback = async (version: number) => {
    if (!confirm(`Versiyon ${version}'a geri dönmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      await rollbackMutation.mutateAsync({ resource, resourceId, version });
      toast.success(`Versiyon ${version}'a başarıyla geri dönüldü`);
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Rollback yapılırken bir hata oluştu');
    }
  };

  useModalA11y({ isOpen, onClose, dialogRef, initialFocusRef: closeBtnRef });
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="version-history-title"
          tabIndex={-1}
          className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full outline-none"
        >
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 id="version-history-title" className="text-lg font-medium text-gray-900 dark:text-white">
                  Versiyon Geçmişi
                </h3>
                {resourceName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {resource}: {resourceName}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Kapat"
                ref={closeBtnRef}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 px-6 py-4 max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">Versiyon geçmişi yüklenirken bir hata oluştu</p>
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Henüz versiyon geçmişi bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version._id}
                    className={`border rounded-lg p-4 ${
                      selectedVersion?._id === version._id
                        ? 'border-[#0066CC] bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    } transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              v{version.version}
                            </span>
                            {version.isRolledBack && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Geri Alındı
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(version.changedAt)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Değiştiren:</span>{' '}
                            {version.changedBy?.name || version.changedBy?.email || 'Bilinmiyor'}
                          </p>
                          {version.comment && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span className="font-medium">Not:</span> {version.comment}
                            </p>
                          )}
                        </div>
                        {version.changes && version.changes.length > 0 && (
                          <div className="mt-3">
                            <button
                              onClick={() => setSelectedVersion(selectedVersion?._id === version._id ? null : version)}
                              className="text-sm text-[#0066CC] hover:text-[#0055AA] dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                            >
                              {selectedVersion?._id === version._id ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                  </svg>
                                  Değişiklikleri Gizle
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                  </svg>
                                  Değişiklikleri Göster ({version.changes.length})
                                </>
                              )}
                            </button>
                            {selectedVersion?._id === version._id && (
                              <div className="mt-3 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
                                {version.changes.map((change, idx) => (
                                  <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded p-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                          {change.field}
                                        </p>
                                        <div className="mt-2 grid grid-cols-2 gap-3">
                                          <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Eski Değer:</p>
                                            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded p-2 font-mono text-xs break-all">
                                              {formatValue(change.oldValue)}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Yeni Değer:</p>
                                            <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded p-2 font-mono text-xs break-all">
                                              {formatValue(change.newValue)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {!version.isRolledBack && version.version > 1 && (
                          <button
                            onClick={() => handleRollback(version.version)}
                            disabled={rollbackMutation.isPending}
                            className="px-3 py-1.5 text-sm text-[#0066CC] hover:text-[#0055AA] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {rollbackMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#0066CC]"></div>
                                Geri dönülüyor...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                Bu Versiyona Geri Dön
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {totalPages > 1 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Sayfa {page} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

