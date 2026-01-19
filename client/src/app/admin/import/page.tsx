'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ImportModal from '@/components/admin/ImportModal';

export default function ImportPage() {
  const [importModalOpen, setImportModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Veri İçe Aktar</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">CSV, Excel veya JSON formatındaki verileri sisteme aktarın</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Veri İçe Aktarma</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            CSV, Excel veya JSON formatındaki dosyaları yükleyerek verilerinizi sisteme aktarabilirsiniz.
          </p>
          <button
            onClick={() => setImportModalOpen(true)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Dosya Yükle
          </button>
        </div>
      </div>

      <ImportModal
        isOpen={importModalOpen}
        type="project"
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          toast.success('Veri başarıyla içe aktarıldı');
          setImportModalOpen(false);
        }}
      />
    </div>
  );
}
