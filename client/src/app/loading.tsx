import React from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingStates';

export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <LoadingSpinner size="md" color="primary" />
        <span className="text-sm text-gray-700 dark:text-gray-300">Yükleniyor…</span>
      </div>
    </div>
  );
}

