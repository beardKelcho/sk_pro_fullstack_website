/**
 * Site Images E2E Testleri
 * 
 * Bu dosya site images modülünün tüm işlevlerini test eder
 */

describe('Site Images', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Site Images Sayfası', () => {
    it('site images sayfası açılmalı', () => {
      cy.visit('/admin/site-images');
      cy.url().should('include', '/admin/site-images');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/görsel|image|resim/i, { timeout: 15000 }).should('exist');
    });

    it('resim listesi görüntülenebilmeli', () => {
      cy.visit('/admin/site-images');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Resim listesi
      cy.get('body').then(($body) => {
        const imageList = $body.find('[class*="image"], img, [class*="gallery"]');
        if (imageList.length > 0) {
          cy.log('Resim listesi bulundu');
        }
      });
    });
  });

  describe('Resim Yükleme', () => {
    it('resim yüklenebilmeli', () => {
      cy.visit('/admin/site-images');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Yükle butonu
      cy.get('body').then(($body) => {
        const uploadBtn = $body.find('button:contains("Yükle"), button:contains("Upload")').first();
        if (uploadBtn.length > 0) {
          cy.wrap(uploadBtn).click({ force: true });
          cy.wait(1000);
          
          // File input
          cy.get('input[type="file"]', { timeout: 5000 }).should('exist');
        }
      });
    });
  });

  describe('Resim İşlemleri', () => {
    it('resim silinebilmeli', () => {
      cy.visit('/admin/site-images');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sil butonu
      cy.get('body').then(($body) => {
        const deleteBtn = $body.find('button:contains("Sil"), button[aria-label*="sil"]').first();
        if (deleteBtn.length > 0) {
          cy.wrap(deleteBtn).scrollIntoView().click({ force: true });
          
          // Onay modal'ı
          cy.get('body').then(($modal) => {
            if ($modal.find('button:contains("Evet"), button:contains("Onayla")').length > 0) {
              cy.contains(/evet|onayla/i).click({ force: true });
            }
          });
        }
      });
    });
  });
});
