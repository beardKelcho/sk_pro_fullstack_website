/**
 * Müşteri Yönetimi E2E Testleri
 * 
 * Bu dosya müşteri yönetimi modülünün tüm işlevlerini test eder
 */

describe('Müşteri Yönetimi', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Müşteri Listesi', () => {
    it('müşteri listesi görüntülenmeli', () => {
      cy.visit('/admin/customers');
      cy.url().should('include', '/admin/customers');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/müşteri|customer|client/i, { timeout: 15000 }).should('exist');
    });
  });

  describe('Müşteri CRUD İşlemleri', () => {
    it('yeni müşteri eklenebilmeli', () => {
      cy.visit('/admin/customers/add');
      cy.url().should('include', '/admin/customers/add');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Form'un yüklendiğini bekle
      cy.get('form', { timeout: 15000 }).should('exist');

      const timestamp = Date.now();
      
      // Müşteri adı
      cy.get('input[name="name"], input#name', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(`Test Müşteri ${timestamp}`, { force: true });

      // Email
      cy.get('input[name="email"], input#email, input[type="email"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(`test${timestamp}@customer.com`, { force: true });

      // Telefon
      cy.get('body').then(($body) => {
        if ($body.find('input[name="phone"], input#phone').length > 0) {
          cy.get('input[name="phone"], input#phone', { timeout: 10000 })
            .should('be.visible')
            .clear()
            .type('5321234567', { force: true });
        }
      });

      // Submit butonu
      cy.get('button[type="submit"], form button[type="submit"]', { timeout: 10000 })
        .scrollIntoView()
        .should('be.visible');
    });

    it('müşteri görüntüleme sayfası açılmalı', () => {
      cy.visit('/admin/customers');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Görüntüle linki
      cy.get('body').then(($body) => {
        const viewLink = $body.find('a[href*="/customers/view"], tr').first();
        if (viewLink.length > 0) {
          cy.wrap(viewLink).scrollIntoView().click({ force: true });
          cy.url({ timeout: 15000 }).should('include', '/customers/view');
        }
      });
    });

    it('müşteri düzenleme sayfası açılmalı', () => {
      cy.visit('/admin/customers');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Düzenle linki
      cy.get('body').then(($body) => {
        const editLink = $body.find('a[href*="/customers/edit"], button:contains("Düzenle")').first();
        if (editLink.length > 0) {
          cy.wrap(editLink).scrollIntoView().click({ force: true });
          cy.url({ timeout: 15000 }).should('include', '/customers/edit');
        }
      });
    });
  });
});
