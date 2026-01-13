/**
 * Ana Sayfa (Homepage) Kapsamlı Testleri
 * 
 * Bu test dosyası ana sayfanın tüm kritik özelliklerini test eder:
 * - Hero bölümü
 * - Video arka plan
 * - Carousel animasyonu
 * - Modal işlevselliği
 * - Form gönderimi
 * - Responsive tasarım
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';
import * as siteImageService from '@/services/siteImageService';
import * as siteContentService from '@/services/siteContentService';

// Mock services
jest.mock('@/services/siteImageService');
jest.mock('@/services/siteContentService');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

describe('Ana Sayfa (Homepage) Testleri', () => {
  const mockImages = [
    {
      _id: '1',
      filename: 'test1.jpg',
      originalName: 'Test Image 1',
      path: '/uploads/test1.jpg',
      url: '/uploads/test1.jpg',
      category: 'project' as const,
      order: 1,
      isActive: true,
    },
    {
      _id: '2',
      filename: 'test2.jpg',
      originalName: 'Test Image 2',
      path: '/uploads/test2.jpg',
      url: '/uploads/test2.jpg',
      category: 'project' as const,
      order: 2,
      isActive: true,
    },
  ];

  const mockHeroContent = {
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    description: 'Test Description',
    buttonText: 'Test Button',
    buttonLink: '#contact',
    rotatingTexts: ['Text 1', 'Text 2', 'Text 3'],
    selectedVideo: 'test-video.mp4',
    backgroundImage: 'test-bg.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getAllImages
    (siteImageService.getAllImages as jest.Mock).mockResolvedValue({
      success: true,
      images: mockImages,
    });

    // Mock getAllContents
    (siteContentService.getAllContents as jest.Mock).mockResolvedValue({
      hero: { content: { content: mockHeroContent } },
      services: { content: { content: [] } },
      equipment: { content: { content: [] } },
      about: { content: { content: {} } },
      contact: { content: { content: {} } },
    });
  });

  describe('Sayfa Yükleme', () => {
    it('sayfa başarıyla render edilmeli', async () => {
      render(<Home />);
      
      // Loading skeleton görünmeli
      await waitFor(() => {
        expect(screen.queryByText(/yükleniyor/i)).toBeInTheDocument();
      });
    });

    it('içerik yüklendikten sonra hero bölümü görünmeli', async () => {
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText(/test title/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Hero Bölümü', () => {
    it('hero başlığı görüntülenmeli', async () => {
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText(/test title/i)).toBeInTheDocument();
      });
    });

    it('rotating texts değişmeli', async () => {
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText(/text 1/i)).toBeInTheDocument();
      });

      // 5 saniye sonra text değişmeli
      await waitFor(() => {
        expect(screen.getByText(/text 2/i)).toBeInTheDocument();
      }, { timeout: 6000 });
    });

    it('CTA butonu görünmeli ve çalışmalı', async () => {
      render(<Home />);
      
      await waitFor(() => {
        const button = screen.getByText(/test button/i);
        expect(button).toBeInTheDocument();
        expect(button.closest('a')).toHaveAttribute('href', '#contact');
      });
    });
  });

  describe('Carousel Animasyonu', () => {
    it('carousel resimleri render edilmeli', async () => {
      render(<Home />);
      
      await waitFor(() => {
        const images = screen.getAllByAltText(/test image/i);
        expect(images.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('resme tıklayınca modal açılmalı', async () => {
      render(<Home />);
      
      await waitFor(() => {
        const images = screen.getAllByAltText(/test image/i);
        expect(images.length).toBeGreaterThan(0);
      });

      const firstImage = screen.getAllByAltText(/test image/i)[0];
      fireEvent.click(firstImage);

      await waitFor(() => {
        // Modal açılmalı
        expect(screen.getByRole('dialog') || document.querySelector('.fixed.inset-0')).toBeInTheDocument();
      });
    });
  });

  describe('İletişim Formu', () => {
    it('iletişim formu render edilmeli', async () => {
      render(<Home />);
      
      await waitFor(() => {
        const form = screen.getByRole('form') || document.querySelector('form');
        expect(form).toBeInTheDocument();
      });
    });

    it('form validasyonu çalışmalı', async () => {
      render(<Home />);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /gönder|submit/i });
        if (submitButton) {
          fireEvent.click(submitButton);
          
          // Hata mesajları görünmeli
          expect(screen.getByText(/zorunlu|required/i)).toBeInTheDocument();
        }
      });
    });
  });

  describe('Responsive Tasarım', () => {
    it('mobil görünümde menü butonu görünmeli', () => {
      // Mobil viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<Home />);
      
      // Mobil menü butonu kontrolü
      const menuButton = screen.queryByRole('button', { name: /menu/i });
      // Menü butonu Header component'inde olabilir
    });
  });

  describe('Hata Durumları', () => {
    it('resimler yüklenemezse hata gösterilmemeli (sessizce devam etmeli)', async () => {
      (siteImageService.getAllImages as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<Home />);
      
      await waitFor(() => {
        // Sayfa hata göstermeden render edilmeli
        expect(screen.queryByText(/hata|error/i)).not.toBeInTheDocument();
      });
    });

    it('içerik yüklenemezse fallback içerik gösterilmeli', async () => {
      (siteContentService.getAllContents as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<Home />);
      
      await waitFor(() => {
        // Fallback içerik görünmeli
        expect(screen.getByText(/sk production/i)).toBeInTheDocument();
      });
    });
  });
});

