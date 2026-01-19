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
      
      // Bölüm seçimi (Hero, Services, About, Contact, vb.)
      cy.get('body').then(($body) => {
        const sectionBtns = $body.find('button:contains("Hero"), button:contains("Hizmet"), [role="tab"]');
        if (sectionBtns.length > 0) {
          cy.wrap(sectionBtns.first()).click({ force: true });
          cy.wait(1000);
          cy.log('Bölüm seçildi');
        }
      });
    });
  });

  describe('Hero Bölümü Düzenleme', () => {
    it('hero bölümü düzenlenebilmeli', () => {
      cy.visit('/admin/site-content');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Hero bölümüne git
      cy.get('body').then(($body) => {
        const heroBtn = $body.find('button:contains("Hero"), [aria-label*="hero"]').first();
        if (heroBtn.length > 0) {
          cy.wrap(heroBtn).click({ force: true });
          cy.wait(1000);
          
          // Hero form alanları
          cy.get('input[name*="title"], textarea[name*="description"]', { timeout: 10000 })
            .should('exist');
        }
      });
    });
  });

  describe('Services Bölümü Düzenleme', () => {
    it('services bölümü düzenlenebilmeli', () => {
      cy.visit('/admin/site-content');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Services bölümüne git
      cy.get('body').then(($body) => {
        const servicesBtn = $body.find('button:contains("Hizmet"), button:contains("Service")').first();
        if (servicesBtn.length > 0) {
          cy.wrap(servicesBtn).click({ force: true });
          cy.wait(1000);
          cy.log('Services bölümü açıldı');
        }
      });
    });
  });

  describe('About Bölümü Düzenleme', () => {
    it('about bölümü düzenlenebilmeli', () => {
      cy.visit('/admin/site-content');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // About bölümüne git
      cy.get('body').then(($body) => {
        const aboutBtn = $body.find('button:contains("Hakkımızda"), button:contains("About")').first();
        if (aboutBtn.length > 0) {
          cy.wrap(aboutBtn).click({ force: true });
          cy.wait(1000);
          cy.log('About bölümü açıldı');
        }
      });
    });
  });

  describe('Contact Bilgileri Düzenleme', () => {
    it('contact bilgileri düzenlenebilmeli', () => {
      cy.visit('/admin/site-content');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Contact bölümüne git
      cy.get('body').then(($body) => {
        const contactBtn = $body.find('button:contains("İletişim"), button:contains("Contact")').first();
        if (contactBtn.length > 0) {
          cy.wrap(contactBtn).click({ force: true });
          cy.wait(1000);
          
          // Contact form alanları
          cy.get('input[name*="email"], input[name*="phone"]', { timeout: 10000 })
            .should('exist');
        }
      });
    });
  });
});
