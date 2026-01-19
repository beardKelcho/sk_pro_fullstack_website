/**
 * Email Templates E2E Testleri
 * 
 * Bu dosya email templates modülünün tüm işlevlerini test eder
 */

describe('Email Templates', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Template Listesi', () => {
    it('email templates sayfası açılmalı', () => {
      cy.visit('/admin/email-templates');
      cy.url().should('include', '/admin/email-templates');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/email|şablon|template/i, { timeout: 15000 }).should('exist');
    });

    it('template listesi görüntülenebilmeli', () => {
      cy.visit('/admin/email-templates');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Template listesi - gerçek assertion ile
      cy.get('table, ul, [class*="template"]', { timeout: 10000 })
        .first()
        .should('exist')
        .should('be.visible');
    });
  });

  describe('Template İşlemleri', () => {
    it('template düzenlenebilmeli', () => {
      cy.visit('/admin/email-templates');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Düzenle butonu - gerçek assertion ile
      cy.get('button:contains("Düzenle"), button:contains("Edit"), a[href*="edit"]', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      
      cy.wait(2000);
      
      // Düzenleme formu - gerçek assertion ile
      cy.get('form, textarea, input[name*="subject"], input[name*="title"]', { timeout: 10000 })
        .should('exist')
        .should('be.visible');
    });

    it('template preview görüntülenebilmeli', () => {
      cy.visit('/admin/email-templates');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Preview butonu - gerçek assertion ile
      cy.get('button:contains("Önizle"), button:contains("Preview")', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      
      cy.wait(2000);
      
      // Preview modal - gerçek assertion ile
      cy.get('[role="dialog"], .modal, [class*="preview"]', { timeout: 10000 })
        .should('exist')
        .should('be.visible');
    });
  });
});
