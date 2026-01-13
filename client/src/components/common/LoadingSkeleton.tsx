'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  );
};

// Hero Section Skeleton
export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative h-screen flex items-center justify-center z-10">
      <div className="container mx-auto px-4 relative z-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton variant="text" height={72} className="w-full max-w-3xl mx-auto" />
          <Skeleton variant="text" height={32} className="w-full max-w-2xl mx-auto" />
          <Skeleton variant="text" height={24} className="w-full max-w-xl mx-auto" />
          <Skeleton variant="rectangular" width={200} height={56} className="mx-auto rounded-lg" />
        </div>
      </div>
    </div>
  );
};

// Services Section Skeleton
export const ServicesSkeleton: React.FC = () => {
  return (
    <section className="relative py-20 bg-gray-50/10 dark:bg-dark-surface/10 backdrop-blur-[2px] z-10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <Skeleton variant="text" height={48} className="w-64 mx-auto" />
          <Skeleton variant="text" height={24} className="w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/10 dark:bg-dark-card/10 backdrop-blur-[2px] rounded-lg p-6 space-y-4">
              <Skeleton variant="circular" width={64} height={64} className="mx-auto" />
              <Skeleton variant="text" height={28} className="w-3/4 mx-auto" />
              <Skeleton variant="text" height={20} className="w-full" />
              <Skeleton variant="text" height={20} className="w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Projects Section Skeleton
export const ProjectsSkeleton: React.FC = () => {
  return (
    <section className="relative py-20 bg-gray-50/10 dark:bg-dark-surface/10 backdrop-blur-[2px] overflow-hidden z-10">
      <div className="container mx-auto px-6 mb-10">
        <div className="text-center mb-16 space-y-4">
          <Skeleton variant="text" height={48} className="w-64 mx-auto" />
          <Skeleton variant="text" height={24} className="w-96 mx-auto" />
        </div>
        <div className="space-y-8">
          <Skeleton variant="rectangular" height={200} className="w-full rounded-lg" />
          <Skeleton variant="rectangular" height={200} className="w-full rounded-lg" />
        </div>
      </div>
    </section>
  );
};

// About Section Skeleton
export const AboutSkeleton: React.FC = () => {
  return (
    <section className="relative py-20 bg-gray-50/10 dark:bg-dark-surface/10 backdrop-blur-[2px] z-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <Skeleton variant="text" height={48} className="w-3/4" />
            <Skeleton variant="text" height={20} className="w-full" />
            <Skeleton variant="text" height={20} className="w-full" />
            <Skeleton variant="text" height={20} className="w-5/6" />
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton variant="text" height={48} className="w-20" />
                  <Skeleton variant="text" height={20} className="w-24" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2">
            <Skeleton variant="rectangular" height={400} className="w-full rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Contact Section Skeleton
export const ContactSkeleton: React.FC = () => {
  return (
    <section className="relative py-16 bg-gray-50/10 dark:bg-dark-surface/10 backdrop-blur-[2px] z-10">
      <div className="container mx-auto px-6">
        <Skeleton variant="text" height={48} className="w-48 mx-auto mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton variant="circular" width={24} height={24} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" height={24} className="w-32" />
                  <Skeleton variant="text" height={20} className="w-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton variant="rectangular" height={48} className="w-full rounded-lg" />
            <Skeleton variant="rectangular" height={48} className="w-full rounded-lg" />
            <Skeleton variant="rectangular" height={120} className="w-full rounded-lg" />
            <Skeleton variant="rectangular" height={48} className="w-full rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Full Page Loading Skeleton
export const PageLoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSkeleton />
      <ServicesSkeleton />
      <ProjectsSkeleton />
      <AboutSkeleton />
      <ContactSkeleton />
    </div>
  );
};

