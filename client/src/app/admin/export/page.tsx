'use client';

import React from 'react';
import ExportMenu from '@/components/admin/ExportMenu';

export default function ExportPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Veri Dışa Aktar</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Sistem verilerinizi CSV, Excel veya PDF formatında dışa aktarın</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dışa Aktarılabilir Veriler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Ekipmanlar</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Tüm ekipman verilerini dışa aktar</p>
                <ExportMenu
                  type="inventory"
                  baseFilename="equipment"
                  label="Dışa Aktar"
                />
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Projeler</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Tüm proje verilerini dışa aktar</p>
                <ExportMenu
                  type="projects"
                  baseFilename="projects"
                  label="Dışa Aktar"
                />
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Görevler</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Tüm görev verilerini dışa aktar</p>
                <ExportMenu
                  type="tasks"
                  baseFilename="tasks"
                  label="Dışa Aktar"
                />
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Müşteriler</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Tüm müşteri verilerini dışa aktar</p>
                <ExportMenu
                  type="clients"
                  baseFilename="clients"
                  label="Dışa Aktar"
                />
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Bakımlar</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Tüm bakım kayıtlarını dışa aktar</p>
                <ExportMenu
                  type="maintenance"
                  baseFilename="maintenance"
                  label="Dışa Aktar"
                />
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Kullanıcılar</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Tüm kullanıcı verilerini dışa aktar</p>
                <ExportMenu
                  type="users"
                  baseFilename="users"
                  label="Dışa Aktar"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
