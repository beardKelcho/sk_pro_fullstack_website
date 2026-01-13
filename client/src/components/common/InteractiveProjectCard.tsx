'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import LazyImage from './LazyImage';
import { getImageUrl } from '@/utils/imageUrl';
import { SiteImage } from './Carousel';

interface InteractiveProjectCardProps {
  image: SiteImage;
  index: number;
  onClick: () => void;
}

/**
 * İnteraktif Proje Kartı
 * 3D tilt efekti ve hover animasyonları ile
 */
export default function InteractiveProjectCard({
  image,
  index,
  onClick,
}: InteractiveProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7.5deg', '-7.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7.5deg', '7.5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const imageUrl = getImageUrl({ image, fallback: '' });

  return (
    <motion.div
      ref={cardRef}
      className="relative w-80 h-72 cursor-pointer group"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 3D Glow Efekti */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#0066CC]/20 to-[#00C49F]/20 rounded-2xl blur-xl"
        animate={{
          opacity: isHovered ? 0.8 : 0.3,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Kart İçeriği */}
      <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 group-hover:shadow-[0_20px_60px_rgba(0,102,204,0.4)]">
        {imageUrl ? (
          <motion.div
            className="relative w-full h-full"
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <LazyImage
              src={imageUrl}
              alt={image.originalName || 'Proje görseli'}
              className="w-full h-full"
              fill
              objectFit="cover"
              sizes="(max-width: 768px) 100vw, 320px"
              quality={90}
            />
          </motion.div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0066CC] to-[#00C49F] flex items-center justify-center">
            <span className="text-white text-xl font-semibold">Proje Görseli</span>
          </div>
        )}

        {/* Overlay - Hover'da görünür */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0.7 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-full">
            <motion.h3
              className="text-white text-xl font-bold mb-2"
              animate={{ y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3 }}
            >
              {image.originalName || 'Proje'}
            </motion.h3>
            <motion.p
              className="text-gray-300 text-sm"
              animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0.7 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              Detayları görüntüle →
            </motion.p>
          </div>
        </motion.div>

        {/* Shine Efekti */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            transform: 'translateX(-100%)',
          }}
          animate={{
            transform: isHovered ? ['translateX(-100%)', 'translateX(200%)'] : 'translateX(-100%)',
          }}
          transition={{
            duration: 0.8,
            ease: 'easeInOut',
          }}
        />
      </div>
    </motion.div>
  );
}
