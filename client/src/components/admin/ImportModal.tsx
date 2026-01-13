'use client';

import React, { useState, useRef } from 'react';
import { useImportEquipment, useImportProjects, downloadTemplate, ImportResult } from '@/services/importService';
import { toast } from 'react-toastify';
import Icon from '@/components/common/Icon';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'equipment' | 'project';
  onSuccess?: () => void;
}

export default function ImportModal({ isOpen, onClose, type, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const importEquipment = useImportEquipment();
  const importProjects = useImportProjects();
  
  const isImporting = importEquipment.isPending || importProjects.isPending;
  const importMutation = type === 'equipment' ? importEquipment : importProjects;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      toast.error('Sadece Excel (.xlsx, .xls) ve CSV (.csv) dosyaları desteklenir');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Dosya boyutu 10MB\'dan büyük olamaz');
      return;
    }

    setFile(selectedFile);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Lütfen bir dosya seçin');
      return;
    }

    try {
      const result = await importMutation.mutateAsync(file);
      setImportResult(result.result);
      
      if (result.result.success > 0) {
        toast.success(result.message);
        onSuccess?.();
      }
      
      if (result.result.failed > 0) {
        toast.warning(`${result.result.success} başarılı, ${result.result.failed} başarısız`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Import işlemi başarısız');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTemplate(type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-template.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Template dosyası indirildi');
    } catch (error: any) {
      toast.error('Template indirilemedi');
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {type === 'equipment' ? 'Ekipman' : 'Proje'} Import
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Kapat"
            >
              <Icon name="close" className="h-6 w-6" />
            </button>
          </div>

          {/* Template İndirme */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Template Dosyası
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Örnek format için template dosyasını indirin
                </p>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <span className="inline-block mr-2">📥</span>
                Template İndir
              </button>
            </div>
          </div>

          {/* Dosya Seçimi */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dosya Seçin (Excel veya CSV)
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                disabled={isImporting}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark disabled:opacity-50"
              />
            </div>
            {file && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="inline-block mr-2">📄</span>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                  <button
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Icon name="close" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Import Butonu */}
          <div className="mb-6">
            <button
              onClick={handleImport}
              disabled={!file || isImporting}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isImporting ? (
                <>
                  <span className="inline-block mr-2 animate-spin">⏳</span>
                  Import ediliyor...
                </>
              ) : (
                <>
                  <span className="inline-block mr-2">📤</span>
                  Import Et
                </>
              )}
            </button>
          </div>

          {/* Sonuçlar */}
          {importResult && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Import Sonuçları</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {importResult.success}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Başarılı</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {importResult.failed}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Başarısız</div>
                </div>
              </div>

              {/* Hatalar */}
              {importResult.errors.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Hatalar ({importResult.errors.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="p-2 mb-1 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                        <span className="font-medium">Satır {error.row}:</span> {error.field} - {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uyarılar */}
              {importResult.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Uyarılar ({importResult.warnings.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto">
                    {importResult.warnings.map((warning, index) => (
                      <div key={index} className="p-2 mb-1 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                        <span className="font-medium">Satır {warning.row}:</span> {warning.field} - {warning.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

