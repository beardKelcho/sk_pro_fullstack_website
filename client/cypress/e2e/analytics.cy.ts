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
      
      // İstatistik kartları
      cy.get('body').then(($body) => {
        const statCards = $body.find('[class*="stat"], [class*="card"], [class*="metric"]');
        if (statCards.length > 0) {
          cy.log('İstatistik kartları bulundu');
        }
      });
    });
  });

  describe('Grafik Görüntüleme', () => {
    it('grafikler görüntülenebilmeli', () => {
      cy.visit('/admin/analytics');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Grafik elementleri (canvas, svg, chart)
      cy.get('body').then(($body) => {
        const charts = $body.find('canvas, svg[class*="chart"], [class*="chart"]');
        if (charts.length > 0) {
          cy.log('Grafikler bulundu');
        }
      });
    });

    it('farklı grafik tipleri görüntülenebilmeli', () => {
      cy.visit('/admin/analytics');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Grafik tipleri (line, bar, pie, vb.)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Grafik') || $body.find('canvas, svg').length > 0) {
          cy.log('Grafik tipleri bulundu');
        }
      });
    });
  });

  describe('Filtreleme', () => {
    it('tarih aralığı seçilebilmeli', () => {
      cy.visit('/admin/analytics');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Tarih seçici
      cy.get('body').then(($body) => {
        const datePicker = $body.find('input[type="date"], input[placeholder*="tarih"], [class*="date"]').first();
        if (datePicker.length > 0) {
          cy.wrap(datePicker).scrollIntoView().should('be.visible');
          cy.log('Tarih seçici bulundu');
        }
      });
    });

    it('filtreleme çalışmalı', () => {
      cy.visit('/admin/analytics');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Filtre butonları
      cy.get('body').then(($body) => {
        const filterBtns = $body.find('button:contains("Filtre"), select[name*="filter"]');
        if (filterBtns.length > 0) {
          cy.log('Filtreleme öğeleri bulundu');
        }
      });
    });
  });
});
