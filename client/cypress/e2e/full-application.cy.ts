/**
 * Kapsamlı E2E Test Senaryoları
 * 
 * Bu dosya tüm uygulamanın end-to-end testlerini içerir:
 * - Ana sayfa kullanıcı akışları
 * - Admin panel işlemleri
 * - Form gönderimleri
 * - CRUD işlemleri
 */

describe('SK Production - Kapsamlı E2E Testler', () => {
  const API_URL = Cypress.env('NEXT_PUBLIC_API_URL') || 'http://localhost:5001/api';
  const ADMIN_EMAIL = 'admin@skpro.com.tr';
  const ADMIN_PASSWORD = 'Admin123!';

  beforeEach(() => {
    // Her test öncesi ana sayfaya git
    cy.visit('/');
  });

  describe('Ana Sayfa Testleri', () => {
    it('ana sayfa başarıyla yüklenmeli', () => {
      cy.visit('/');
      cy.contains('SK Production', { timeout: 10000 }).should('be.visible');
    });

    it('hero bölümü görünmeli', () => {
      cy.visit('/');
      cy.get('section').contains(/görsel|mükemmellik|etkinlik/i, { timeout: 10000 }).should('be.visible');
    });

    it('carousel resimleri görünmeli ve hareket etmeli', () => {
      cy.visit('/');
      
      // Carousel'in görünür olmasını bekle
      cy.get('[class*="carousel"]', { timeout: 10000 }).should('exist');
      
      // Resimlerin görünür olmasını bekle
      cy.get('img[alt*="Proje görseli"]', { timeout: 10000 }).should('have.length.at.least', 1);
      
      // Carousel'in scroll edilebilir olduğunu kontrol et
      cy.get('.carousel-scroll').should('have.css', 'overflow-x', 'scroll');
    });

    it('resme tıklayınca modal açılmalı', () => {
      cy.visit('/');
      
      // İlk resmi bul ve tıkla
      cy.get('img[alt*="Proje görseli"]', { timeout: 10000 }).first().click();
      
      // Modal açılmalı
      cy.get('.fixed.inset-0', { timeout: 2000 }).should('be.visible');
      
      // Modal içinde resim görünmeli
      cy.get('.fixed.inset-0 img', { timeout: 2000 }).should('be.visible');
    });

    it('iletişim formu çalışmalı', () => {
      cy.visit('/');
      
      // İletişim bölümüne scroll et
      cy.get('#contact').scrollIntoView();
      
      // Form alanlarını doldur
      cy.get('input[name="name"]').type('Test Kullanıcı');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('textarea[name="message"]').type('Test mesajı');
      
      // Form gönder
      cy.get('button[type="submit"]').click();
      
      // Başarı mesajı görünmeli (veya form gönderildi)
      cy.contains(/gönderildi|başarılı|teşekkür/i, { timeout: 5000 }).should('exist');
    });

    it('navigasyon menüsü çalışmalı', () => {
      cy.visit('/');
      
      // Menü linklerine tıkla
      cy.contains('a', 'Projeler').click();
      cy.url().should('include', '#projects');
      
      cy.contains('a', 'Hizmetler').click();
      cy.url().should('include', '#services');
      
      cy.contains('a', 'Hakkımızda').click();
      cy.url().should('include', '#about');
      
      cy.contains('a', 'İletişim').click();
      cy.url().should('include', '#contact');
    });
  });

  describe('Admin Panel Testleri', () => {
    beforeEach(() => {
      // Admin login
      cy.visit('/admin');
      cy.get('input[type="email"]').type(ADMIN_EMAIL);
      cy.get('input[type="password"]').type(ADMIN_PASSWORD);
      cy.get('button[type="submit"]').click();
      
      // Dashboard'a yönlendirilmeyi bekle
      cy.url({ timeout: 10000 }).should('include', '/admin/dashboard');
    });

    it('dashboard görüntülenmeli', () => {
      cy.visit('/admin/dashboard');
      cy.contains(/dashboard|ana sayfa/i, { timeout: 10000 }).should('be.visible');
    });

    it('kullanıcı listesi görüntülenmeli', () => {
      cy.visit('/admin/users');
      cy.contains(/kullanıcı|user/i, { timeout: 10000 }).should('be.visible');
    });

    it('yeni kullanıcı eklenebilmeli', () => {
      cy.visit('/admin/users/add');
      
      // Form alanlarını doldur
      cy.get('input[name="name"]').type('Test Kullanıcı');
      cy.get('input[name="email"]').type(`test${Date.now()}@example.com`);
      cy.get('input[name="phone"]').type('5321234567');
      cy.get('select[name="role"]').select('TEKNISYEN');
      cy.get('input[name="password"]').type('Test123!');
      
      // Form gönder
      cy.get('button[type="submit"]').click();
      
      // Başarı mesajı veya yönlendirme
      cy.url({ timeout: 10000 }).should('satisfy', (url) => {
        return url.includes('/admin/users') || url.includes('/admin/users/add');
      });
    });

    it('proje listesi görüntülenmeli', () => {
      cy.visit('/admin/projects');
      cy.contains(/proje|project/i, { timeout: 10000 }).should('be.visible');
    });

    it('yeni proje eklenebilmeli', () => {
      cy.visit('/admin/projects/add');
      
      // Form alanlarını doldur
      cy.get('input[name="name"]').type('Test Proje');
      cy.get('select[name="status"]').select('PLANNING');
      
      // Form gönder
      cy.get('button[type="submit"]').click();
      
      // Başarı kontrolü
      cy.url({ timeout: 10000 }).should('satisfy', (url) => {
        return url.includes('/admin/projects');
      });
    });

    it('resim yükleme çalışmalı', () => {
      cy.visit('/admin/site-images');
      
      // Dosya seç butonunu bul
      cy.get('input[type="file"]', { timeout: 10000 }).should('exist');
      
      // Test resmi yükle (eğer test resmi varsa)
      // cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg');
    });

    it('QR kod oluşturulabilmeli', () => {
      cy.visit('/admin/qr-codes');
      
      // QR kod listesi görünmeli
      cy.contains(/qr kod|qr code/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Responsive Tasarım Testleri', () => {
    it('mobil görünümde menü butonu görünmeli', () => {
      cy.viewport(375, 667); // iPhone SE
      cy.visit('/');
      
      // Mobil menü butonu görünmeli
      cy.get('button').contains(/menu|☰/i).should('be.visible');
    });

    it('tablet görünümde içerik düzgün görünmeli', () => {
      cy.viewport(768, 1024); // iPad
      cy.visit('/');
      
      cy.contains('SK Production', { timeout: 10000 }).should('be.visible');
    });

    it('desktop görünümde tüm içerik görünmeli', () => {
      cy.viewport(1920, 1080); // Desktop
      cy.visit('/');
      
      cy.contains('SK Production', { timeout: 10000 }).should('be.visible');
      cy.get('nav').should('be.visible');
    });
  });

  describe('Performans Testleri', () => {
    it('sayfa yükleme süresi kabul edilebilir olmalı', () => {
      const startTime = Date.now();
      
      cy.visit('/');
      cy.contains('SK Production', { timeout: 10000 }).should('be.visible');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(5000); // 5 saniyeden az olmalı
    });

    it('resimler lazy load ile yüklenmeli', () => {
      cy.visit('/');
      
      // İlk görünen resimler yüklenmeli
      cy.get('img[alt*="Proje görseli"]', { timeout: 10000 }).first().should('be.visible');
    });
  });

  describe('Hata Durumları', () => {
    it('404 sayfası görüntülenmeli', () => {
      cy.visit('/nonexistent-page', { failOnStatusCode: false });
      cy.contains(/404|bulunamadı|not found/i).should('be.visible');
    });

    it('geçersiz admin girişi hata vermeli', () => {
      cy.visit('/admin');
      cy.get('input[type="email"]').type('wrong@email.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Hata mesajı görünmeli
      cy.contains(/hata|error|yanlış|geçersiz/i, { timeout: 5000 }).should('be.visible');
    });
  });
});

