'use client';

import type { PermissionCatalogByCategory } from '@/config/permissionCatalog';

interface PermissionDetailsPanelProps {
  categories: PermissionCatalogByCategory;
}

export default function PermissionDetailsPanel({ categories }: PermissionDetailsPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tüm Yetkiler ve Açıklamaları</h2>

      <div className="space-y-6">
        {Object.entries(categories).map(([category, perms]) => (
          <div key={category} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {perms.map((perm) => (
                <div
                  key={perm.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {perm.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {perm.description}
                  </p>
                  {perm.examples.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Örnekler:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {perm.examples.map((example, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
