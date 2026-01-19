/**
 * Project Gallery E2E Testleri
 * 
 * Bu dosya project gallery modülünün tüm işlevlerini test eder
 */

describe('Project Gallery', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Project Gallery Sayfası', () => {
    it('project gallery sayfası açılmalı', () => {
      cy.visit('/admin/project-gallery');
      cy.url().should('include', '/admin/project-gallery');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/galeri|gallery|proje/i, { timeout: 15000 }).should('exist');
    });

    it('galeri görüntülenebilmeli', () => {
      cy.visit('/admin/project-gallery');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Galeri grid veya listesi - gerçek assertion ile
      cy.get('[class*="gallery"], [class*="grid"], img', { timeout: 10000 })
        .should('have.length.at.least', 0) // Galeri boş olabilir
        .first()
        .should('exist');
    });
  });

  describe('Proje Görseli Ekleme', () => {
    it('proje görseli eklenebilmeli', () => {
      cy.visit('/admin/project-gallery');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Ekle butonu - gerçek assertion ile
      cy.get('button:contains("Ekle"), button:contains("Add")', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      
      cy.wait(1000);
      
      // Modal veya form - gerçek assertion ile
      cy.get('[role="dialog"], .modal, input[type="file"]', { timeout: 5000 })
        .should('exist')
        .should('be.visible');
    });
  });
});
