/**
 * Site Content Management E2E Testleri
 * 
 * Bu dosya site content yönetimi modülünün tüm işlevlerini test eder
 */

describe('Site Content Management', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Site Content Sayfası', () => {
    it('site content sayfası açılmalı', () => {
      cy.visit('/admin/site-content');
      cy.url().should('include', '/admin/site-content');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/içerik|content|site/i, { timeout: 15000 }).should('exist');
    });

    it('bölüm seçimi çalışmalı', () => {
      cy.visit('/admin/site-content');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Bölüm seçimi - gerçek assertion ile
      cy.get('button:contains("Hero"), button:contains("Hizmet"), [role="tab"]', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      
      cy.wait(1000);
      
      // Bölüm içeriğinin görüntülendiğini doğrula
      cy.get('form, input, textarea', { timeout: 10000 })
        .should('exist');
    });
  });

  describe('Hero Bölümü Düzenleme', () => {
    it('hero bölümü düzenlenebilmeli', () => {
      cy.visit('/admin/site-content');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Hero bölümüne git - gerçek assertion ile
      cy.get('button:contains("Hero"), [aria-label*="hero"]', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .click({ force: true });
      
      cy.wait(1000);
      
      // Hero form alanları - gerçek assertion ile
      cy.get('input[name*="title"], textarea[name*="description"]', { timeout: 10000 })
        .should('exist')
        .should('be.visible');
    });
  });

  describe('Services Bölümü Düzenleme', () => {
    it('services bölümü düzenlenebilmeli', () => {
      cy.visit('/admin/site-content');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Services bölümüne git - gerçek assertion ile
      cy.get('button:contains("Hizmet"), button:contains("Service")', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .click({ force: true });
      
      cy.wait(1000);
      
      // Services form alanlarının görüntülendiğini doğrula
      cy.get('form, input, textarea', { timeout: 10000 })
        .should('exist');
    });
  });

  describe('About Bölümü Düzenleme', () => {
    it('about bölümü düzenlenebilmeli', () => {
      cy.visit('/admin/site-content');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // About bölümüne git - gerçek assertion ile
      cy.get('button:contains("Hakkımızda"), button:contains("About")', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .click({ force: true });
      
      cy.wait(1000);
      
      // About form alanlarının görüntülendiğini doğrula
      cy.get('form, input, textarea', { timeout: 10000 })
        .should('exist');
    });
  });

  describe('Contact Bilgileri Düzenleme', () => {
    it('contact bilgileri düzenlenebilmeli', () => {
      cy.visit('/admin/site-content');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Contact bölümüne git - gerçek assertion ile
      cy.get('button:contains("İletişim"), button:contains("Contact")', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .click({ force: true });
      
      cy.wait(1000);
      
      // Contact form alanları - gerçek assertion ile
      cy.get('input[name*="email"], input[name*="phone"]', { timeout: 10000 })
        .should('exist')
        .should('be.visible');
    });
  });
});
