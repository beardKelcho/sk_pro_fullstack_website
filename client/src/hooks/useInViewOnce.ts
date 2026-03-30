'use client';

import { useEffect, useRef, useState } from 'react';

interface UseInViewOnceOptions {
  rootMargin?: string;
  threshold?: number;
}

export function useInViewOnce<T extends HTMLElement>({
  rootMargin = '-50px',
  threshold = 0.1,
}: UseInViewOnceOptions = {}) {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (isInView) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isInView, rootMargin, threshold]);

  return [ref, isInView] as const;
}
