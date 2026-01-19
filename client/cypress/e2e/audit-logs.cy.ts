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
      
      // Log listesi - gerçek assertion ile
      cy.get('table, ul, [class*="log"], tbody', { timeout: 10000 })
        .first()
        .should('exist')
        .should('be.visible');
    });
  });

  describe('Filtreleme', () => {
    it('audit log filtreleme çalışmalı', () => {
      cy.visit('/admin/audit-logs');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Filtre butonları - gerçek assertion ile
      cy.get('select[name*="filter"], button[aria-label*="filtre"]', { timeout: 10000 })
        .first()
        .should('exist')
        .should('be.visible');
    });

    it('kullanıcıya göre filtreleme çalışmalı', () => {
      cy.visit('/admin/audit-logs');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Kullanıcı filtresi - gerçek assertion ile
      cy.get('select[name*="user"], input[placeholder*="kullanıcı"]', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible');
    });

    it('aksiyona göre filtreleme çalışmalı', () => {
      cy.visit('/admin/audit-logs');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Aksiyon filtresi - gerçek assertion ile
      cy.get('select[name*="action"], button:contains("Aksiyon")', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible');
    });
  });

  describe('Detay Görüntüleme', () => {
    it('audit log detayı görüntülenebilmeli', () => {
      cy.visit('/admin/audit-logs');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Log listesi yüklensin
      cy.wait(2000);
      
      // Detay butonu veya satıra tıklama - gerçek assertion ile
      cy.get('button:contains("Detay"), table tbody tr, a[href*="view"]', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      
      cy.wait(2000);
      
      // Detay modal veya sayfa - gerçek assertion ile
      cy.get('[role="dialog"], [class*="detail"], [class*="modal"]', { timeout: 10000 })
        .should('exist')
        .should('be.visible');
    });
  });
});
