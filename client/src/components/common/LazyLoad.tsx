import { Suspense } from 'react';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyLoad = ({ 
  children, 
  fallback = <div className="w-full h-full flex items-center justify-center">Yükleniyor...</div> 
}: LazyLoadProps) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}; 