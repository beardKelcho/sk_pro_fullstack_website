'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

/**
 * Parallax scrolling efekti için wrapper component
 * Scroll hızına göre içeriği hareket ettirir
 */
export default function ParallaxSection({
  children,
  speed = 0.5,
  className = '',
  direction = 'up',
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
    layoutEffect: false, // Uyarıyı önlemek için
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothProgress = useSpring(scrollYProgress, springConfig);

  let transformValue;
  switch (direction) {
    case 'up':
      transformValue = useTransform(smoothProgress, [0, 1], ['0%', `${speed * 100}%`]);
      break;
    case 'down':
      transformValue = useTransform(smoothProgress, [0, 1], ['0%', `-${speed * 100}%`]);
      break;
    case 'left':
      transformValue = useTransform(smoothProgress, [0, 1], ['0%', `${speed * 100}%`]);
      break;
    case 'right':
      transformValue = useTransform(smoothProgress, [0, 1], ['0%', `-${speed * 100}%`]);
      break;
    default:
      transformValue = useTransform(smoothProgress, [0, 1], ['0%', `${speed * 100}%`]);
  }

  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';

  return (
    <div ref={ref} className={className} style={{ position: 'relative' }}>
      <motion.div
        style={{
          [axis]: transformValue,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
