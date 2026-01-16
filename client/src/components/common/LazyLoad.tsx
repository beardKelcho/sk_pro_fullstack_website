import { Suspense } from 'react';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyLoad = ({ 
  children, 
  fallback = (
    <div className="w-full h-full flex items-center justify-center" role="status">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800 dark:border-gray-700 dark:border-t-white" />
    </div>
  )
}: LazyLoadProps) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}; 