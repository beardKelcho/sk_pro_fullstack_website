/**
 * Analytics Dashboard E2E Testleri
 * 
 * Bu dosya analytics modülünün tüm işlevlerini test eder
 */

describe('Analytics Dashboard', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Analytics Sayfası', () => {
    it('analytics sayfası açılmalı', () => {
      cy.visit('/admin/analytics');
      cy.url().should('include', '/admin/analytics');

      // Loading spinner'ın kaybolmasını bekle
      cy.get('.animate-spin', { timeout: 20000 }).should('not.exist');

      // Hata mesajı olmadığını kontrol et
      cy.contains('Hata').should('not.exist');
      cy.contains('yüklenemedi').should('not.exist');

      // Sayfa başlığını kontrol et
      cy.contains('h1', 'Advanced Analytics', { timeout: 20000 }).should('be.visible');
    });

    it('dashboard istatistikleri görüntülenebilmeli', () => {
      cy.visit('/admin/analytics');
      cy.contains('h1', 'Advanced Analytics', { timeout: 20000 }).should('be.visible');

      // İstatistik kartlarını metin içeriğiyle bul
      cy.contains('Projeler (Karşılaştırma)').should('be.visible');
      cy.contains('Görevler (Oluşturulan)').should('be.visible');
      cy.contains('Görevler (Tamamlanan)').should('be.visible');
    });
  });

  describe('Grafik Görüntüleme', () => {
    it('grafikler görüntülenebilmeli', () => {
      cy.visit('/admin/analytics');
      cy.contains('h1', 'Advanced Analytics', { timeout: 20000 }).should('be.visible');

      // Recharts elementleri (wrapper visible olmalı)
      cy.get('.recharts-responsive-container', { timeout: 15000 })
        .should('have.length.at.least', 1)
        .first()
        .should('be.visible');
    });

    it('farklı grafik tipleri görüntülenebilmeli', () => {
      cy.visit('/admin/analytics');
      cy.contains('h1', 'Advanced Analytics', { timeout: 20000 }).should('be.visible');

      cy.get('.recharts-surface, svg', { timeout: 15000 })
        .should('have.length.at.least', 1);
    });
  });

  describe('Filtreleme', () => {
    it('tarih aralığı seçilebilmeli', () => {
      cy.visit('/admin/analytics');
      cy.contains('h1', 'Advanced Analytics', { timeout: 20000 }).should('be.visible');

      // Tarih inputlarını kontrol et
      cy.get('input[type="date"]', { timeout: 15000 }).should('exist');
    });

    it('filtreleme çalışmalı', () => {
      cy.visit('/admin/analytics');
      cy.contains('h1', 'Advanced Analytics', { timeout: 20000 }).should('be.visible');

      // Filtre butonlarını kontrol et
      cy.contains('button', '30 Gün').should('exist');
      cy.contains('button', 'Uygula').should('exist');
    });
  });


});
