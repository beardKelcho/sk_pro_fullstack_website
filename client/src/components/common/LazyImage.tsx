'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * LazyImage component props
 * @interface LazyImageProps
 */
interface LazyImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Additional CSS classes */
  className?: string;
  /** Image width (required if fill is false) */
  width?: number;
  /** Image height (required if fill is false) */
  height?: number;
  /** Placeholder image URL or blur data URL */
  placeholder?: string;
  /** Error handler callback */
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  /** Load image with priority (above the fold) */
  priority?: boolean;
  /** Responsive image sizes for different viewports */
  sizes?: string;
  /** Image quality (1-100, default: 85) */
  quality?: number;
  /** Fill parent container (requires relative positioning) */
  fill?: boolean;
  /** Object fit style for the image */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * Optimized LazyImage component using Next.js Image
 * - Automatic WebP format support
 * - Lazy loading with Intersection Observer
 * - Blur placeholder support
 * - Responsive image sizes
 * - Error handling
 */
export default function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder,
  onError,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  fill = false,
  objectFit = 'cover',
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Next.js Image requires either width/height or fill prop
  const useFill = fill || (!width && !height);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setIsLoading(false);
    if (onError) {
      onError(e);
    }
  };

  // Error state - show placeholder or hide
  if (hasError) {
    if (placeholder) {
      return (
        <div className={`${className} bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
          <span className="text-gray-400 text-sm">Resim yüklenemedi</span>
        </div>
      );
    }
    return null;
  }

  // Blur placeholder data URL (simple gray placeholder)
  const blurDataURL = placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg==';

  if (useFill) {
    return (
      <div 
        className={`relative ${className}`} 
        role="img" 
        aria-label={alt}
        style={{ width: '100%', height: '100%', minHeight: '200px' }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          quality={quality}
          sizes={sizes}
          className={`
            object-${objectFit}
            transition-all duration-500 ease-out
            ${isLoading ? 'blur-sm scale-105' : 'blur-0 scale-100'}
          `}
          style={{ width: '100%', height: '100%', objectFit: objectFit }}
          placeholder={placeholder ? 'blur' : 'empty'}
          blurDataURL={placeholder || undefined}
          onError={handleError}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: width, height: height }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        className={`
          transition-all duration-500 ease-out
          ${isLoading ? 'blur-sm scale-105' : 'blur-0 scale-100'}
        `}
        style={{ width: '100%', height: '100%', objectFit: objectFit }}
        placeholder={placeholder ? 'blur' : 'empty'}
        blurDataURL={placeholder || undefined}
        onError={handleError}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

