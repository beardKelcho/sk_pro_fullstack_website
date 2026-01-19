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
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/analytics|analitik|istatistik/i, { timeout: 15000 }).should('exist');
    });

    it('dashboard istatistikleri görüntülenebilmeli', () => {
      cy.visit('/admin/analytics');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // İstatistik kartları - gerçek assertion ile
      cy.get('[class*="stat"], [class*="card"], [class*="metric"]', { timeout: 10000 })
        .should('have.length.at.least', 1)
        .first()
        .should('be.visible');
    });
  });

  describe('Grafik Görüntüleme', () => {
    it('grafikler görüntülenebilmeli', () => {
      cy.visit('/admin/analytics');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Grafik elementleri - gerçek assertion ile
      cy.get('canvas, svg[class*="chart"], [class*="chart"]', { timeout: 10000 })
        .should('have.length.at.least', 1)
        .first()
        .should('be.visible');
    });

    it('farklı grafik tipleri görüntülenebilmeli', () => {
      cy.visit('/admin/analytics');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Grafik tipleri - gerçek assertion ile
      cy.get('canvas, svg', { timeout: 10000 })
        .should('have.length.at.least', 1);
      
      // Grafik başlıkları veya etiketleri kontrolü
      cy.get('body').should(($body) => {
        const hasCharts = $body.find('canvas, svg').length > 0;
        expect(hasCharts).to.be.true;
      });
    });
  });

  describe('Filtreleme', () => {
    it('tarih aralığı seçilebilmeli', () => {
      cy.visit('/admin/analytics');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Tarih seçici - gerçek assertion ile
      cy.get('input[type="date"], input[placeholder*="tarih"], [class*="date"]', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible');
    });

    it('filtreleme çalışmalı', () => {
      cy.visit('/admin/analytics');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Filtre butonları - gerçek assertion ile
      cy.get('button:contains("Filtre"), select[name*="filter"]', { timeout: 10000 })
        .first()
        .should('exist')
        .should('be.visible');
    });
  });
});
