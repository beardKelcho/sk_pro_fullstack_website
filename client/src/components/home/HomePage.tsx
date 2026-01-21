'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import Projects from '@/components/home/Projects';
import About from '@/components/home/About';
import Contact from '@/components/home/Contact';

export default function HomePage() {
    return (
        <MainLayout>
            {/* Hero Section - Piksellerin Ötesinde Başlığı ile */}
            <Hero />

            {/* Hizmetler - Yeni 3 Kart Yapısı */}
            <Services />

            {/* Projeler - Slider ve Modal */}
            <Projects />

            {/* Hakkımızda - Dinamik 9+ Yıl Hesaplaması */}
            <About />

            {/* İletişim - Form ve Harita */}
            <Contact />

            {/* Footer Wrapper Layout tarafından (veya MainLayout dışında) handle ediliyor */}
        </MainLayout>
    );
}
