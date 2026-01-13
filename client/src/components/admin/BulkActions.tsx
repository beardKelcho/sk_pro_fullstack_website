'use client';

import React from 'react';

export interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: 'danger' | 'primary' | 'secondary';
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  actions?: BulkAction[];
  showSelectAll?: boolean;
}

export default function BulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  actions = [],
  showSelectAll = true,
}: BulkActionsProps) {
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const hasSelection = selectedCount > 0;

  if (!hasSelection && actions.length === 0) {
    return null;
  }

  const variantStyles = {
    danger: 'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800',
    primary: 'bg-[#0066CC] dark:bg-primary-light text-white hover:bg-[#0055AA] dark:hover:bg-primary',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Sol taraf - Seçim bilgisi */}
        <div className="flex items-center gap-4">
          {showSelectAll && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={allSelected ? onDeselectAll : onSelectAll}
                className="w-4 h-4 text-[#0066CC] dark:text-primary-light rounded focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {allSelected ? 'Tümünü Kaldır' : 'Tümünü Seç'} ({selectedCount}/{totalCount})
              </span>
            </label>
          )}
          {hasSelection && !showSelectAll && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedCount} öğe seçildi
            </span>
          )}
        </div>

        {/* Sağ taraf - Aksiyonlar */}
        {hasSelection && actions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  variantStyles[action.variant || 'secondary']
                } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {action.icon && <span>{action.icon}</span>}
                {action.label}
              </button>
            ))}
            <button
              onClick={onDeselectAll}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Seçimi Temizle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

