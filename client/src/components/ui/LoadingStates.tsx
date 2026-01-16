import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
  };

  return (
    <div 
      role="status"
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  count = 1,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          role="status"
          className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
        />
      ))}
    </>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  spinnerSize?: 'sm' | 'md' | 'lg';
  spinnerColor?: 'primary' | 'secondary' | 'white';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  spinnerSize = 'md',
  spinnerColor = 'primary',
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <LoadingSpinner size={spinnerSize} color={spinnerColor} />
      </div>
    </div>
  );
};

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText = 'Yükleniyor...',
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`relative inline-flex items-center justify-center ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
        </div>
      )}
      <span className={isLoading ? 'invisible' : ''}>
        {children}
      </span>
      {isLoading && (
        <span className="ml-2">
          {loadingText}
        </span>
      )}
    </button>
  );
};

interface LoadingCardProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  isLoading,
  children,
  className = '',
}) => {
  if (!isLoading) return <div className={className}>{children}</div>;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <div className="space-y-4">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
        <LoadingSkeleton className="h-4 w-5/6" />
        <LoadingSkeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}; 