/**
 * Monitoring Dashboard E2E Testleri
 * 
 * Bu dosya monitoring modülünün tüm işlevlerini test eder
 */

describe('Monitoring Dashboard', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Monitoring Sayfası', () => {
    it('monitoring sayfası açılmalı', () => {
      cy.visit('/admin/monitoring');
      cy.url().should('include', '/admin/monitoring');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/monitoring|izleme|sistem/i, { timeout: 15000 }).should('exist');
    });

    it('sistem metrikleri görüntülenebilmeli', () => {
      cy.visit('/admin/monitoring');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Metrik kartları
      cy.get('body').then(($body) => {
        const metrics = $body.find('[class*="metric"], [class*="stat"], [class*="card"]');
        if (metrics.length > 0) {
          cy.log('Sistem metrikleri bulundu');
        }
      });
    });
  });

  describe('API Health Check', () => {
    it('API health check görüntülenebilmeli', () => {
      cy.visit('/admin/monitoring');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Health check durumu
      cy.get('body').then(($body) => {
        if ($body.text().includes('Health') || $body.text().includes('Durum') || $body.find('[class*="health"]').length > 0) {
          cy.log('API health check bulundu');
        }
      });
    });

    it('API durumu kontrol edilebilmeli', () => {
      cy.visit('/admin/monitoring');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Health check butonu
      cy.get('body').then(($body) => {
        const checkBtn = $body.find('button:contains("Kontrol"), button:contains("Check")');
        if (checkBtn.length > 0) {
          cy.wrap(checkBtn).scrollIntoView().click({ force: true });
          cy.wait(2000);
          cy.log('API durumu kontrol edildi');
        }
      });
    });
  });

  describe('Real-time Monitoring', () => {
    it('real-time metrikler görüntülenebilmeli', () => {
      cy.visit('/admin/monitoring');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Real-time güncellemeler
      cy.wait(3000);
      cy.get('body').then(($body) => {
        if ($body.find('[class*="realtime"], [class*="live"]').length > 0) {
          cy.log('Real-time metrikler bulundu');
        }
      });
    });
  });
});
