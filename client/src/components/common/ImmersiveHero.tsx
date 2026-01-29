'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// React Three Fiber'i dynamic import ile yükle (SSR sorunlarını önlemek için)
const Interactive3DScene = dynamic(() => import('./Interactive3DScene'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gradient-to-br from-[#0066CC]/20 to-[#00C49F]/20" />,
});

interface HeroContent {
  title?: string;
  subtitle?: string;
  description?: string;
  rotatingTexts?: string[];
  buttonText?: string;
  buttonLink?: string;
  backgroundVideo?: string;
  backgroundImage?: string;
}

interface ImmersiveHeroProps {
  content: HeroContent | null;
  onScrollDown?: () => void;
}

// STATIC TURKISH FALLBACKS
const FALLBACK_CONTENT = {
  rotatingTexts: ['Profesyonel', 'Görüntü', 'Çözümleri'],
  description: 'SK Production olarak etkinliklerinize profesyonel görüntü rejisi hizmeti sunuyoruz.',
  primaryCta: 'Projelerimizi İncele',
  secondaryCta: 'Hizmetlerimiz'
};

/**
 * İmmersive Hero Section
 * Kullanıcıyı sahne içine çeken, interaktif hero bölümü
 */
export default function ImmersiveHero({ content, onScrollDown }: ImmersiveHeroProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax efektleri
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  // Mouse pozisyonunu takip et (parallax için)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Rotating texts
  const rotatingTexts = useMemo(() => {
    if (content?.rotatingTexts && content.rotatingTexts.length > 0) {
      return content.rotatingTexts;
    }
    return FALLBACK_CONTENT.rotatingTexts;
  }, [content?.rotatingTexts]);

  // Rotating texts için effect
  useEffect(() => {
    if (rotatingTexts.length === 0) return;

    const textsCount = rotatingTexts.length;
    setTextIndex((prev) => prev % textsCount);

    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % textsCount);
    }, 4000);
    return () => clearInterval(interval);
  }, [rotatingTexts]);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
      style={{ position: 'relative', perspective: '1000px' }}
    >
      {/* 3D Arka Plan Sahnesi */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          x: useTransform(() => mousePosition.x * 20),
          y: useTransform(() => mousePosition.y * 20),
        }}
      >
        <Interactive3DScene className="w-full h-full" showControls={true} />
      </motion.div>

      {/* Gradient Overlay */}
      <motion.div
        className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/60 to-black/40"
        style={{ opacity }}
      />

      {/* İçerik */}
      <motion.div
        className="relative z-20 h-full flex items-center justify-center"
        style={{ y, opacity, scale }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="max-w-5xl mx-auto"
          >
            {/* Ana Başlık - 3D Efekt */}
            <AnimatePresence mode="wait">
              {rotatingTexts[textIndex] && (
                <motion.h1
                  key={textIndex}
                  initial={{ opacity: 0, y: 30, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -30, rotateX: 90 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
                  style={{
                    textShadow: '0 0 40px rgba(0, 102, 204, 0.5), 0 0 80px rgba(0, 102, 204, 0.3)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <span className="inline-block">
                    {rotatingTexts[textIndex].split(' ').map((word, i) => (
                      <motion.span
                        key={i}
                        className="inline-block mr-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.1, color: '#0066CC' }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </span>
                </motion.h1>
              )}
            </AnimatePresence>

            {/* Alt Başlık */}
            {content?.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-4 font-light"
              >
                {content.subtitle}
              </motion.p>
            )}

            {/* Açıklama */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              {content?.description || FALLBACK_CONTENT.description}
            </motion.p>

            {/* CTA Butonları */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <motion.a
                href={content?.buttonLink || '#contact'}
                className="relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-[#0066CC] blur-xl opacity-50 group-hover:opacity-75"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <div className="relative bg-[#0066CC] text-white px-10 py-5 rounded-xl text-lg font-semibold shadow-2xl transform transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(0,102,204,0.6)]">
                  {content?.buttonText || FALLBACK_CONTENT.primaryCta}
                  <motion.span
                    className="inline-block ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </div>
              </motion.a>

              <motion.a
                href="#projects"
                className="relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative bg-transparent border-2 border-white/30 text-white px-10 py-5 rounded-xl text-lg font-semibold backdrop-blur-sm hover:border-white/60 hover:bg-white/10 transition-all duration-300">
                  {FALLBACK_CONTENT.secondaryCta}
                </div>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Down İndikatörü */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 cursor-pointer"
        onClick={onScrollDown}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.2 }}
      >
        <motion.div
          className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center"
          whileHover={{ borderColor: '#0066CC' }}
        >
          <motion.div
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>

      {/* Parallax Parçacıklar */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#0066CC] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
