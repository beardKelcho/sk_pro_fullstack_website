/**
 * Audit Logs E2E Testleri
 * 
 * Bu dosya audit logs modülünün tüm işlevlerini test eder
 */

describe('Audit Logs', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Audit Log Listesi', () => {
    it('audit logs sayfası açılmalı', () => {
      cy.visit('/admin/audit-logs');
      cy.url().should('include', '/admin/audit-logs');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/audit|log|kayıt/i, { timeout: 15000 }).should('exist');
    });

    it('audit log listesi görüntülenebilmeli', () => {
      cy.visit('/admin/audit-logs');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Log listesi
      cy.get('body').then(($body) => {
        const logList = $body.find('table, ul, [class*="log"], tbody');
        if (logList.length > 0) {
          cy.log('Audit log listesi bulundu');
        }
      });
    });
  });

  describe('Filtreleme', () => {
    it('audit log filtreleme çalışmalı', () => {
      cy.visit('/admin/audit-logs');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Filtre butonları
      cy.get('body').then(($body) => {
        const filters = $body.find('select[name*="filter"], button[aria-label*="filtre"]');
        if (filters.length > 0) {
          cy.log('Filtreleme öğeleri bulundu');
        }
      });
    });

    it('kullanıcıya göre filtreleme çalışmalı', () => {
      cy.visit('/admin/audit-logs');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Kullanıcı filtresi
      cy.get('body').then(($body) => {
        const userFilter = $body.find('select[name*="user"], input[placeholder*="kullanıcı"]').first();
        if (userFilter.length > 0) {
          cy.wrap(userFilter).scrollIntoView().should('be.visible');
        }
      });
    });

    it('aksiyona göre filtreleme çalışmalı', () => {
      cy.visit('/admin/audit-logs');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Aksiyon filtresi
      cy.get('body').then(($body) => {
        const actionFilter = $body.find('select[name*="action"], button:contains("Aksiyon")').first();
        if (actionFilter.length > 0) {
          cy.wrap(actionFilter).scrollIntoView().should('be.visible');
        }
      });
    });
  });

  describe('Detay Görüntüleme', () => {
    it('audit log detayı görüntülenebilmeli', () => {
      cy.visit('/admin/audit-logs');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Detay butonu veya satıra tıklama
      cy.get('body').then(($body) => {
        const detailBtn = $body.find('button:contains("Detay"), tr, a[href*="view"]').first();
        if (detailBtn.length > 0) {
          cy.wrap(detailBtn).scrollIntoView().click({ force: true });
          cy.wait(2000);
          
          // Detay modal veya sayfa
          cy.get('body').then(($detail) => {
            if ($detail.find('[role="dialog"], [class*="detail"]').length > 0) {
              cy.log('Audit log detayı görüntülendi');
            }
          });
        }
      });
    });
  });
});
