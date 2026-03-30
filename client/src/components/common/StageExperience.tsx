'use client';

import { useInViewOnce } from '@/hooks/useInViewOnce';

interface StageExperienceProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Sahne Deneyimi Wrapper
 * Kullanıcıyı sahne içine çeken immersive deneyim, optimized for 60FPS
 */
export default function StageExperience({ children, className = '' }: StageExperienceProps) {
  const [ref, isInView] = useInViewOnce<HTMLDivElement>({ rootMargin: '-50px' });

  return (
    <div
      ref={ref}
      className={`relative transition-all duration-1000 ease-out ${className} ${
        isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
      }`}
    >
      {/* Sahne Işıkları Efekti - Static instead of Infinite JS Animation to save GPU/CPU */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[30rem] h-[30rem] rounded-full blur-[100px] opacity-10"
            style={{
              background: `radial-gradient(circle, rgba(0,102,204,0.4) 0%, transparent 70%)`,
              left: `${i * 30}%`,
              top: `${(i * 30) % 60 + 10}%`,
              transform: 'translate3d(0,0,0)', // Hardware acceleration
            }}
          />
        ))}
      </div>

      {/* İçerik */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * Sahne Bölümü Başlığı
 * Dramatik görünüm için özel başlık component'i - Optimized without intervals
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
  const [ref, isInView] = useInViewOnce<HTMLDivElement>({ rootMargin: '-50px' });

  return (
    <div
      ref={ref}
      className={`text-center mb-16 transition-all duration-1000 ease-out ${className} ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <h2
        className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
        style={{
          textShadow: '0 0 30px rgba(0, 102, 204, 0.3)',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto transition-opacity duration-1000 delay-300">
          {subtitle}
        </p>
      )}
    </div>
  );
}
