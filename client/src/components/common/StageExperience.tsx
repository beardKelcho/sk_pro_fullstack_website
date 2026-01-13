'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';

interface StageExperienceProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Sahne Deneyimi Wrapper
 * Kullanıcıyı sahne içine çeken immersive deneyim
 */
export default function StageExperience({ children, className = '' }: StageExperienceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
    layoutEffect: false, // Uyarıyı önlemek için
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]);

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{ opacity, scale, position: 'relative' }}
    >
      {/* Sahne Işıkları Efekti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{
              background: `radial-gradient(circle, rgba(0,102,204,0.4) 0%, transparent 70%)`,
              left: `${i * 25}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* İçerik */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Sahne Bölümü Başlığı
 * Dramatik görünüm için özel başlık component'i
 */
export function StageSectionTitle({
  title,
  subtitle,
  className = '',
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const words = title.split(' ');

  // Random kelime highlight efekti
  useEffect(() => {
    if (!isInView || words.length === 0) return;

    const interval = setInterval(() => {
      // Random bir kelime seç
      const randomIndex = Math.floor(Math.random() * words.length);
      setHighlightedIndex(randomIndex);
      
      // 1.5 saniye sonra highlight'ı kaldır
      setTimeout(() => {
        setHighlightedIndex(null);
      }, 1500);
    }, 2500); // Her 2.5 saniyede bir yeni kelime highlight

    return () => clearInterval(interval);
  }, [isInView, words.length]);

  return (
    <motion.div
      ref={ref}
      className={`text-center mb-16 ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <motion.h2
        className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
        style={{
          textShadow: '0 0 40px rgba(0, 102, 204, 0.5), 0 0 80px rgba(0, 102, 204, 0.3)',
        }}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="inline-block"
            style={{ 
              marginRight: '2rem',
              padding: highlightedIndex === i ? '0.5rem' : '0.5rem',
              transformOrigin: 'center center',
              zIndex: highlightedIndex === i ? 10 : 1,
              position: 'relative',
              display: 'inline-block',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={
              isInView
                ? {
                    opacity: 1,
                    y: 0,
                    ...(highlightedIndex === i
                      ? {
                          scale: 1.1,
                          color: '#0066CC',
                          rotateY: 360,
                        }
                      : {
                          scale: 1,
                          color: '#ffffff',
                          rotateY: 0,
                        }),
                  }
                : {}
            }
            transition={{
              opacity: { delay: i * 0.1, duration: 0.6 },
              y: { delay: i * 0.1, duration: 0.6 },
              scale: { duration: 0.6, ease: 'easeInOut' },
              color: { duration: 0.6, ease: 'easeInOut' },
              rotateY: { duration: 0.8, ease: 'easeInOut' },
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.h2>
      {subtitle && (
        <motion.p
          className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
