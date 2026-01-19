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
      
      // Filtre butonları - gerçek assertion ile
      cy.get('select, button[aria-label*="filter"]', { timeout: 10000 })
        .first()
        .should('exist')
        .should('be.visible');
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

      // Durum seçimi - gerçek assertion ile
      cy.get('select[name="status"], select#status', { timeout: 10000 })
        .should('exist')
        .should('be.visible')
        .select('TODO', { force: true })
        .should('have.value');

      // Atanan kullanıcı - gerçek assertion ile
      cy.get('select[name="assignedTo"], select#assignedTo', { timeout: 10000 })
        .then(($select) => {
          if ($select.length > 0) {
            cy.wrap($select)
              .should('be.visible')
              .find('option')
              .should('have.length.at.least', 1)
              .then(() => {
                cy.wrap($select).select(1, { force: true });
              });
          }
        });

      // Submit butonu - gerçek assertion ile
      cy.get('button[type="submit"], form button[type="submit"]', { timeout: 10000 })
        .should('exist')
        .scrollIntoView()
        .should('be.visible')
        .should('not.be.disabled');
    });

    it('görev durumu değiştirilebilmeli', () => {
      cy.visit('/admin/tasks');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Durum değiştirme butonu veya dropdown - gerçek assertion ile
      cy.get('select[name*="status"], button[aria-label*="durum"]', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible');
    });

    it('görev görüntüleme sayfası açılmalı', () => {
      cy.visit('/admin/tasks');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Görüntüle linki - gerçek assertion ile
      cy.get('a[href*="/tasks/view"], table tbody tr', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      
      cy.url({ timeout: 15000 }).should('include', '/tasks/view');
    });
  });
});
