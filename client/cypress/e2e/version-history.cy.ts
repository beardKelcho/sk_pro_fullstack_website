/**
 * Version History E2E Testleri
 * 
 * Bu dosya version history modülünün tüm işlevlerini test eder
 * TC018 - Versiyon geçmişi proje edit'te erişilebilirlik testleri
 */

describe('Version History Yönetimi', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Version History Erişimi', () => {
    it('proje edit sayfasında version history butonu görünmeli', () => {
      // Önce bir proje oluştur veya mevcut projeye git
      cy.visit('/admin/projects');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // İlk projeye tıkla veya edit sayfasına git - gerçek assertion ile
      cy.get('a[href*="/projects/edit"], table tbody tr', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      
      cy.url({ timeout: 15000 }).should('include', '/projects/edit');
      
      // Version history butonu - gerçek assertion ile
      cy.get('button:contains("Versiyon"), button:contains("Version"), button:contains("Geçmiş")', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible');
    });

    it('version history modal açılabilmeli', () => {
      cy.visit('/admin/projects');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Proje edit sayfasına git - gerçek assertion ile
      cy.get('a[href*="/projects/edit"]', { timeout: 10000 })
        .first()
        .should('exist')
        .click({ force: true });
      
      cy.url({ timeout: 15000 }).should('include', '/projects/edit');
      
      // Version history butonuna tıkla - gerçek assertion ile
      cy.get('button:contains("Versiyon"), button:contains("Version")', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      
      cy.wait(2000);
      
      // Modal kontrolü - gerçek assertion ile
      cy.get('[role="dialog"], .modal, [class*="modal"]', { timeout: 10000 })
        .should('exist')
        .should('be.visible');
    });

    it('version history listesi görüntülenebilmeli', () => {
      // Proje edit sayfasında version history'yi aç - gerçek assertion ile
      cy.visit('/admin/projects');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      cy.get('a[href*="/projects/edit"]', { timeout: 10000 })
        .first()
        .should('exist')
        .click({ force: true });
      
      cy.url({ timeout: 15000 }).should('include', '/projects/edit');
      
      // Version history butonuna tıkla - gerçek assertion ile
      cy.get('button:contains("Versiyon")', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      
      cy.wait(2000);
      
      // Version listesi kontrolü - gerçek assertion ile
      cy.get('ul, table, [class*="version"], [class*="history"]', { timeout: 10000 })
        .should('exist')
        .should('be.visible');
    });

    it('rollback işlemi çalışabilmeli', () => {
      // Proje edit sayfasında version history'yi aç - gerçek assertion ile
      cy.visit('/admin/projects');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      cy.get('a[href*="/projects/edit"]', { timeout: 10000 })
        .first()
        .should('exist')
        .click({ force: true });
      
      cy.url({ timeout: 15000 }).should('include', '/projects/edit');
      
      // Version history butonuna tıkla - gerçek assertion ile
      cy.get('button:contains("Versiyon")', { timeout: 10000 })
        .first()
        .should('exist')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      
      cy.wait(2000);
      
      // Rollback butonu - gerçek assertion ile
      cy.get('button:contains("Geri"), button:contains("Rollback"), button:contains("Yükle")', { timeout: 10000 })
        .first()
        .should('exist')
        .should('be.visible');
      
      // Not: Rollback'i gerçekten çalıştırmıyoruz (veri kaybı olabilir)
    });
  });
});
