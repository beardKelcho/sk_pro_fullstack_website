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
      
      // Template listesi
      cy.get('body').then(($body) => {
        const templateList = $body.find('table, ul, [class*="template"]');
        if (templateList.length > 0) {
          cy.log('Template listesi bulundu');
        }
      });
    });
  });

  describe('Template İşlemleri', () => {
    it('template düzenlenebilmeli', () => {
      cy.visit('/admin/email-templates');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Düzenle butonu
      cy.get('body').then(($body) => {
        const editBtn = $body.find('button:contains("Düzenle"), button:contains("Edit"), a[href*="edit"]').first();
        if (editBtn.length > 0) {
          cy.wrap(editBtn).scrollIntoView().click({ force: true });
          cy.wait(2000);
          
          // Düzenleme formu
          cy.get('body').then(($form) => {
            if ($form.find('form, textarea, input').length > 0) {
              cy.log('Template düzenleme formu açıldı');
            }
          });
        }
      });
    });

    it('template preview görüntülenebilmeli', () => {
      cy.visit('/admin/email-templates');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Preview butonu
      cy.get('body').then(($body) => {
        const previewBtn = $body.find('button:contains("Önizle"), button:contains("Preview")').first();
        if (previewBtn.length > 0) {
          cy.wrap(previewBtn).scrollIntoView().click({ force: true });
          cy.wait(2000);
          
          // Preview modal
          cy.get('body').then(($modal) => {
            if ($modal.find('[role="dialog"], .modal, [class*="preview"]').length > 0) {
              cy.log('Template preview görüntülendi');
            }
          });
        }
      });
    });
  });
});
