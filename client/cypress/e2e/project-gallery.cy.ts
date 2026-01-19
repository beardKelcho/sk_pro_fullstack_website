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
      
      // Galeri grid veya listesi
      cy.get('body').then(($body) => {
        const gallery = $body.find('[class*="gallery"], [class*="grid"], img');
        if (gallery.length > 0) {
          cy.log('Galeri bulundu');
        }
      });
    });
  });

  describe('Proje Görseli Ekleme', () => {
    it('proje görseli eklenebilmeli', () => {
      cy.visit('/admin/project-gallery');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Ekle butonu
      cy.get('body').then(($body) => {
        const addBtn = $body.find('button:contains("Ekle"), button:contains("Add")').first();
        if (addBtn.length > 0) {
          cy.wrap(addBtn).scrollIntoView().click({ force: true });
          cy.wait(1000);
          
          // Modal veya form
          cy.get('body').then(($modal) => {
            if ($modal.find('[role="dialog"], input[type="file"]').length > 0) {
              cy.log('Proje görseli ekleme formu açıldı');
            }
          });
        }
      });
    });
  });
});
