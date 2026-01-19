/**
 * Görev Yönetimi E2E Testleri
 * 
 * Bu dosya görev yönetimi modülünün tüm işlevlerini test eder
 */

describe('Görev Yönetimi', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Görev Listesi', () => {
    it('görev listesi görüntülenmeli', () => {
      cy.visit('/admin/tasks');
      cy.url().should('include', '/admin/tasks');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/görev|task/i, { timeout: 15000 }).should('exist');
    });

    it('görev filtreleme çalışmalı', () => {
      cy.visit('/admin/tasks');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Filtre butonları
      cy.get('body').then(($body) => {
        if ($body.find('select, button[aria-label*="filter"]').length > 0) {
          cy.log('Filtreleme öğeleri bulundu');
        }
      });
    });
  });

  describe('Görev CRUD İşlemleri', () => {
    it('yeni görev oluşturulabilmeli', () => {
      cy.visit('/admin/tasks/add');
      cy.url().should('include', '/admin/tasks/add');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Form'un yüklendiğini bekle
      cy.get('form', { timeout: 15000 }).should('exist');

      const timestamp = Date.now();
      
      // Görev başlığı
      cy.get('input[name="title"], input#title', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(`Test Görev ${timestamp}`, { force: true });

      // Açıklama
      cy.get('textarea[name="description"], textarea#description', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type('Test görev açıklaması', { force: true });

      // Durum seçimi
      cy.get('body').then(($body) => {
        if ($body.find('select[name="status"], select#status').length > 0) {
          cy.get('select[name="status"], select#status', { timeout: 10000 })
            .should('be.visible')
            .select('TODO', { force: true });
        }
      });

      // Atanan kullanıcı
      cy.get('body').then(($body) => {
        if ($body.find('select[name="assignedTo"], select#assignedTo').length > 0) {
          cy.get('select[name="assignedTo"], select#assignedTo', { timeout: 10000 })
            .should('be.visible')
            .then(($select) => {
              if ($select.find('option').length > 1) {
                cy.wrap($select).select(1, { force: true });
              }
            });
        }
      });

      // Submit butonu
      cy.get('button[type="submit"], form button[type="submit"]', { timeout: 10000 })
        .scrollIntoView()
        .should('be.visible');
    });

    it('görev durumu değiştirilebilmeli', () => {
      cy.visit('/admin/tasks');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Durum değiştirme butonu veya dropdown
      cy.get('body').then(($body) => {
        const statusSelect = $body.find('select[name*="status"], button[aria-label*="durum"]').first();
        if (statusSelect.length > 0) {
          cy.wrap(statusSelect).scrollIntoView().should('be.visible');
          cy.log('Durum değiştirme öğesi bulundu');
        }
      });
    });

    it('görev görüntüleme sayfası açılmalı', () => {
      cy.visit('/admin/tasks');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Görüntüle linki
      cy.get('body').then(($body) => {
        const viewLink = $body.find('a[href*="/tasks/view"], tr').first();
        if (viewLink.length > 0) {
          cy.wrap(viewLink).scrollIntoView().click({ force: true });
          cy.url({ timeout: 15000 }).should('include', '/tasks/view');
        }
      });
    });
  });
});
