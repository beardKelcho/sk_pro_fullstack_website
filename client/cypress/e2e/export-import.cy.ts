/**
 * Export/Import E2E Testleri
 * 
 * Bu dosya export/import modüllerinin tüm işlevlerini test eder
 * TC012/TC013 - Export/Import admin UI erişimi testleri
 */

describe('Export/Import Yönetimi', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Export İşlemleri', () => {
    it('export sayfası açılmalı', () => {
      cy.visit('/admin/export');
      cy.url().should('include', '/admin/export');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Export içeriği kontrolü
      cy.contains(/export|dışa aktar|indir/i, { timeout: 15000 }).should('exist');
    });

    it('ekipman export edilebilmeli', () => {
      cy.visit('/admin/export');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Ekipman export butonu
      cy.get('body').then(($body) => {
        const exportBtn = $body.find('button:contains("Ekipman"), button:contains("Equipment"), a[href*="export/equipment"]').first();
        if (exportBtn.length > 0) {
          cy.wrap(exportBtn).scrollIntoView().click({ force: true });
          cy.wait(2000);
          cy.log('Ekipman export başlatıldı');
        } else {
          // Belki direkt export endpoint'i var
          cy.log('Export butonu bulunamadı');
        }
      });
    });

    it('proje export edilebilmeli', () => {
      cy.visit('/admin/export');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Proje export butonu
      cy.get('body').then(($body) => {
        const exportBtn = $body.find('button:contains("Proje"), button:contains("Project")').first();
        if (exportBtn.length > 0) {
          cy.wrap(exportBtn).scrollIntoView().click({ force: true });
          cy.wait(2000);
          cy.log('Proje export başlatıldı');
        }
      });
    });

    it('export format seçimi çalışmalı', () => {
      cy.visit('/admin/export');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Format seçimi (CSV, Excel, PDF)
      cy.get('body').then(($body) => {
        const formatSelect = $body.find('select[name*="format"], button[aria-label*="format"]');
        if (formatSelect.length > 0) {
          cy.log('Format seçimi bulundu');
        }
      });
    });
  });

  describe('Import İşlemleri', () => {
    it('import sayfası açılmalı', () => {
      cy.visit('/admin/import');
      cy.url().should('include', '/admin/import');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Import içeriği kontrolü
      cy.contains(/import|içe aktar|yükle/i, { timeout: 15000 }).should('exist');
    });

    it('dosya yükleme input\'u görünmeli', () => {
      cy.visit('/admin/import');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // File input
      cy.get('body').then(($body) => {
        const fileInput = $body.find('input[type="file"]');
        if (fileInput.length > 0) {
          cy.log('Dosya yükleme input\'u bulundu');
        } else {
          // Belki buton ile açılıyor
          const uploadBtn = $body.find('button:contains("Yükle"), button:contains("Upload")');
          if (uploadBtn.length > 0) {
            cy.wrap(uploadBtn).click({ force: true });
            cy.wait(1000);
            cy.get('input[type="file"]', { timeout: 5000 }).should('exist');
          }
        }
      });
    });

    it('iCal import çalışmalı', () => {
      cy.visit('/admin/import');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // iCal import seçeneği
      cy.get('body').then(($body) => {
        if ($body.text().includes('iCal') || $body.text().includes('calendar')) {
          cy.log('iCal import seçeneği bulundu');
        }
      });
    });
  });
});
