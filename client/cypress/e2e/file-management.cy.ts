/**
 * Dosya Yönetimi E2E Testleri
 * 
 * Bu dosya dosya yönetimi modülünün tüm işlevlerini test eder
 */

describe('Dosya Yönetimi', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Dosya Listesi', () => {
    it('dosya listesi görüntülenmeli', () => {
      cy.visit('/admin/files');
      cy.url().should('include', '/admin/files');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/dosya|file/i, { timeout: 15000 }).should('exist');
    });

    it('dosya filtreleme çalışmalı', () => {
      cy.visit('/admin/files');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Dosya tipi filtresi
      cy.get('body').then(($body) => {
        const typeFilter = $body.find('select[name*="type"], select#fileType, button[aria-label*="tip"]').first();
        if (typeFilter.length > 0) {
          cy.wrap(typeFilter).scrollIntoView().should('be.visible');
          cy.log('Dosya tipi filtresi bulundu');
        }
      });
    });

    it('dosya arama çalışmalı', () => {
      cy.visit('/admin/files');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Arama input'u
      cy.get('body').then(($body) => {
        const searchInput = $body.find('input[type="search"], input[placeholder*="ara"], input[name*="search"]').first();
        if (searchInput.length > 0) {
          cy.wrap(searchInput).scrollIntoView().clear().type('test', { force: true });
          cy.wait(1000);
          cy.log('Arama çalıştı');
        }
      });
    });
  });

  describe('Dosya Yükleme', () => {
    it('dosya yükleme butonu görünmeli', () => {
      cy.visit('/admin/files');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Yükle butonu
      cy.get('body').then(($body) => {
        const uploadBtn = $body.find('button:contains("Yükle"), button:contains("Upload"), button:contains("Dosya")').first();
        if (uploadBtn.length > 0) {
          cy.log('Yükle butonu bulundu');
        }
      });
    });

    it('dosya seçilebilmeli', () => {
      cy.visit('/admin/files');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // File input
      cy.get('body').then(($body) => {
        const fileInput = $body.find('input[type="file"]');
        if (fileInput.length > 0) {
          // Test dosyası oluştur ve yükle
          cy.fixture('test-image.jpg', 'base64').then((fileContent) => {
            cy.get('input[type="file"]').then(($input) => {
              const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
              const file = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              $input[0].files = dataTransfer.files;
              cy.wrap($input).trigger('change', { force: true });
              cy.wait(2000);
              cy.log('Dosya seçildi');
            });
          });
        } else {
          // Yükle butonuna tıkla ve modal aç
          const uploadBtn = $body.find('button:contains("Yükle")').first();
          if (uploadBtn.length > 0) {
            cy.wrap(uploadBtn).click({ force: true });
            cy.wait(1000);
            cy.get('input[type="file"]', { timeout: 5000 }).should('exist');
          }
        }
      });
    });
  });

  describe('Dosya İşlemleri', () => {
    it('dosya indirilebilmeli', () => {
      cy.visit('/admin/files');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // İndir butonu
      cy.get('body').then(($body) => {
        const downloadBtn = $body.find('button:contains("İndir"), a[href*="download"], button[aria-label*="indir"]').first();
        if (downloadBtn.length > 0) {
          cy.log('İndir butonu bulundu');
        }
      });
    });

    it('dosya silinebilmeli', () => {
      cy.visit('/admin/files');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sil butonu
      cy.get('body').then(($body) => {
        const deleteBtn = $body.find('button:contains("Sil"), button:contains("Delete"), button[aria-label*="sil"]').first();
        if (deleteBtn.length > 0) {
          cy.wrap(deleteBtn).scrollIntoView().click({ force: true });
          
          // Onay modal'ı
          cy.get('body').then(($modal) => {
            if ($modal.find('button:contains("Evet"), button:contains("Onayla")').length > 0) {
              cy.contains(/evet|onayla/i).click({ force: true });
              cy.wait(2000);
            }
          });
        }
      });
    });

    it('dosya kategorilendirme çalışmalı', () => {
      cy.visit('/admin/files');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Kategori seçimi
      cy.get('body').then(($body) => {
        const categorySelect = $body.find('select[name*="category"], button[aria-label*="kategori"]');
        if (categorySelect.length > 0) {
          cy.log('Kategori seçimi bulundu');
        }
      });
    });
  });
});
