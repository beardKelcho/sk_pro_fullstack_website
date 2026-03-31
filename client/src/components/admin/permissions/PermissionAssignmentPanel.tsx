'use client';

import type { PermissionCatalogByCategory } from '@/config/permissionCatalog';

interface PermissionAssignmentPanelProps {
  categories: PermissionCatalogByCategory;
  selectedUserName: string;
  userPermissions: Set<string>;
  isPermissionFromRole: (permission: string) => boolean;
  onToggle: (permission: string) => void;
}

export default function PermissionAssignmentPanel({
  categories,
  selectedUserName,
  userPermissions,
  isPermissionFromRole,
  onToggle,
}: PermissionAssignmentPanelProps) {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {selectedUserName} - Yetkiler
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {userPermissions.size} yetki aktif
        </div>
      </div>

      <div className="space-y-6 max-h-[600px] overflow-y-auto">
        {Object.entries(categories).map(([category, perms]) => (
          <div key={category} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
              {category}
            </h3>
            <div className="space-y-3">
              {perms.map((perm) => {
                const isChecked = userPermissions.has(perm.id);
                const isFromRole = isPermissionFromRole(perm.id);

                return (
                  <div
                    key={perm.id}
                    className={`p-4 rounded-lg border ${
                      isChecked
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id={perm.id}
                        checked={isChecked}
                        onChange={() => onToggle(perm.id)}
                        className="mt-1 h-4 w-4 text-[#0066CC] dark:text-primary-light focus:ring-[#0066CC] dark:focus:ring-primary-light border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <label
                          htmlFor={perm.id}
                          className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                        >
                          {perm.name}
                          {isFromRole && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded">
                              Rol Yetkisi
                            </span>
                          )}
                        </label>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                          {perm.description}
                        </p>
                        {perm.examples.length > 0 && (
                          <div className="mt-2">
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
