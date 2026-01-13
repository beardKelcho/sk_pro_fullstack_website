'use client';

import { useState, useEffect, useRef, RefObject } from 'react';

interface UseLazyImageOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
}

export const useLazyImage = (
  options: UseLazyImageOptions = {}
): [RefObject<HTMLImageElement>, boolean, boolean] => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Intersection Observer ile görünürlük kontrolü
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        root: options.root || null,
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0.01,
      }
    );

    observer.observe(img);

    // Image load event
    const handleLoad = () => {
      setIsLoaded(true);
    };

    const handleError = () => {
      setIsLoaded(false);
    };

    if (isInView) {
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
    }

    return () => {
      observer.disconnect();
      if (isInView) {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
      }
    };
  }, [isInView, options.root, options.rootMargin, options.threshold]);

  return [imgRef, isInView, isLoaded];
};

