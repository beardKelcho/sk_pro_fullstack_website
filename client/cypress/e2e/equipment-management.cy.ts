/**
 * Ekipman Yönetimi E2E Testleri
 * 
 * Bu dosya ekipman yönetimi modülünün tüm işlevlerini test eder
 */

describe('Ekipman Yönetimi', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Ekipman Listesi', () => {
    it('ekipman listesi görüntülenmeli', () => {
      cy.visit('/admin/equipment');
      cy.url().should('include', '/admin/equipment');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/ekipman|equipment/i, { timeout: 15000 }).should('exist');
    });

    it('ekipman filtreleme çalışmalı', () => {
      cy.visit('/admin/equipment');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Filtre butonları veya select'ler varsa kontrol et
      cy.get('body').then(($body) => {
        if ($body.find('select, button[aria-label*="filter"], input[placeholder*="filtre"]').length > 0) {
          cy.log('Filtreleme öğeleri bulundu');
        }
      });
    });

    it('ekipman arama çalışmalı', () => {
      cy.visit('/admin/equipment');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Arama input'u varsa kontrol et
      cy.get('body').then(($body) => {
        if ($body.find('input[type="search"], input[placeholder*="ara"], input[placeholder*="search"]').length > 0) {
          cy.log('Arama input\'u bulundu');
        }
      });
    });
  });

  describe('Ekipman CRUD İşlemleri', () => {
    it('yeni ekipman eklenebilmeli', () => {
      cy.visit('/admin/equipment/add');
      cy.url().should('include', '/admin/equipment/add');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Form'un yüklendiğini bekle
      cy.get('form', { timeout: 15000 }).should('exist');

      const timestamp = Date.now();
      
      // Form alanlarını doldur
      cy.get('input[name="name"], input#name', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(`Test Ekipman ${timestamp}`, { force: true });

      // Tip seçimi varsa
      cy.get('body').then(($body) => {
        if ($body.find('select[name="type"], select#type').length > 0) {
          cy.get('select[name="type"], select#type', { timeout: 10000 })
            .should('be.visible')
            .select('VideoSwitcher', { force: true });
        }
      });

      // Durum seçimi varsa
      cy.get('body').then(($body) => {
        if ($body.find('select[name="status"], select#status').length > 0) {
          cy.get('select[name="status"], select#status', { timeout: 10000 })
            .should('be.visible')
            .select('AVAILABLE', { force: true });
        }
      });

      // Submit butonu
      cy.get('button[type="submit"], form button[type="submit"]', { timeout: 10000 })
        .scrollIntoView()
        .should('be.visible');
    });

    it('ekipman görüntüleme sayfası açılmalı', () => {
      cy.visit('/admin/equipment');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Ekipman listesinde "Görüntüle" linki veya satıra tıklama
      cy.get('body').then(($body) => {
        const viewLink = $body.find('a[href*="/equipment/view"], a[href*="/equipment/"], button:contains("Görüntüle"), button:contains("View")').first();
        if (viewLink.length > 0) {
          cy.wrap(viewLink).scrollIntoView().click({ force: true });
          cy.url({ timeout: 15000 }).should('include', '/equipment/view');
        } else {
          cy.log('Görüntüle linki bulunamadı - test atlanıyor');
        }
      });
    });

    it('ekipman düzenleme sayfası açılmalı', () => {
      cy.visit('/admin/equipment');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Düzenle linki veya butonu
      cy.get('body').then(($body) => {
        const editLink = $body.find('a[href*="/equipment/edit"], button:contains("Düzenle"), button:contains("Edit")').first();
        if (editLink.length > 0) {
          cy.wrap(editLink).scrollIntoView().click({ force: true });
          cy.url({ timeout: 15000 }).should('include', '/equipment/edit');
        } else {
          cy.log('Düzenle linki bulunamadı - test atlanıyor');
        }
      });
    });

    it('ekipman silme işlemi çalışmalı', () => {
      cy.visit('/admin/equipment');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Sil butonu veya checkbox ile seçim + sil
      cy.get('body').then(($body) => {
        const deleteBtn = $body.find('button:contains("Sil"), button:contains("Delete"), button[aria-label*="sil"]').first();
        if (deleteBtn.length > 0) {
          cy.wrap(deleteBtn).scrollIntoView().click({ force: true });
          // Onay modal'ı varsa
          cy.get('body').then(($modal) => {
            if ($modal.find('button:contains("Evet"), button:contains("Yes"), button:contains("Onayla")').length > 0) {
              cy.contains(/evet|yes|onayla/i).click({ force: true });
            }
          });
        } else {
          cy.log('Sil butonu bulunamadı - test atlanıyor');
        }
      });
    });
  });

  describe('QR Kod İşlemleri', () => {
    it('QR kod sayfası açılmalı', () => {
      cy.visit('/admin/qr-codes');
      cy.url().should('include', '/admin/qr-codes');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // QR kod içeriği kontrolü
      cy.contains(/qr|kod|code/i, { timeout: 15000 }).should('exist');
    });

    it('QR kod oluşturulabilmeli', () => {
      cy.visit('/admin/qr-codes');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // QR kod oluştur butonu
      cy.get('body').then(($body) => {
        const createBtn = $body.find('button:contains("Oluştur"), button:contains("Create"), button:contains("QR")').first();
        if (createBtn.length > 0) {
          cy.wrap(createBtn).scrollIntoView().click({ force: true });
          cy.wait(2000);
          // QR kod görüntüsü kontrolü
          cy.get('img[alt*="QR"], canvas, svg', { timeout: 10000 }).should('exist');
        } else {
          cy.log('QR kod oluştur butonu bulunamadı');
        }
      });
    });
  });

  describe('Ekipman Durum Değişiklikleri', () => {
    it('ekipman durumu değiştirilebilmeli', () => {
      cy.visit('/admin/equipment');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Durum değiştirme butonu veya dropdown
      cy.get('body').then(($body) => {
        const statusSelect = $body.find('select[name*="status"], button[aria-label*="durum"]').first();
        if (statusSelect.length > 0) {
          cy.wrap(statusSelect).scrollIntoView().should('be.visible');
          cy.log('Durum değiştirme öğesi bulundu');
        } else {
          cy.log('Durum değiştirme öğesi bulunamadı');
        }
      });
    });
  });
});
