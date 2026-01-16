import React from 'react';
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/LoadingStates';

export default function AdminLoading() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <LoadingSkeleton className="h-5 w-56 bg-gray-200 dark:bg-gray-700" />
          <LoadingSkeleton className="h-4 w-80 bg-gray-200 dark:bg-gray-700" />
        </div>
        <LoadingSpinner size="sm" color="secondary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <LoadingSkeleton className="h-4 w-28 bg-gray-200 dark:bg-gray-700" />
          <LoadingSkeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <LoadingSkeleton className="h-4 w-28 bg-gray-200 dark:bg-gray-700" />
          <LoadingSkeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <LoadingSkeleton className="h-4 w-28 bg-gray-200 dark:bg-gray-700" />
          <LoadingSkeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      <div className="space-y-2">
        <LoadingSkeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700" />
        <LoadingSkeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700" />
        <LoadingSkeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

