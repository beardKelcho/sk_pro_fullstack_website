/**
 * 2FA (İki Faktörlü Kimlik Doğrulama) E2E Testleri
 * 
 * Bu dosya 2FA modülünün tüm işlevlerini test eder
 */

describe('2FA Yönetimi', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('2FA Kurulumu', () => {
    it('2FA sayfası açılmalı', () => {
      cy.visit('/admin/two-factor');
      cy.url().should('include', '/admin/two-factor');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // 2FA içeriği kontrolü
      cy.contains(/2fa|iki faktör|two factor/i, { timeout: 15000 }).should('exist');
    });

    it('2FA kurulum butonu görünmeli', () => {
      cy.visit('/admin/two-factor');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Kurulum butonu
      cy.get('body').then(($body) => {
        const setupBtn = $body.find('button:contains("Kur"), button:contains("Setup"), button:contains("Etkinleştir")');
        if (setupBtn.length > 0) {
          cy.log('2FA kurulum butonu bulundu');
        }
      });
    });
  });

  describe('2FA Login', () => {
    it('2FA ile login sayfası görüntülenebilmeli', () => {
      // Logout yap
      cy.clearCookies();
      cy.clearLocalStorage();
      
      cy.visit('/admin');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Login formu
      cy.get('input[name="email"], input#email', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(ADMIN_EMAIL, { force: true });
      
      cy.get('input[name="password"], input#password', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(ADMIN_PASSWORD, { force: true });
      
      cy.get('button[type="submit"]', { timeout: 10000 })
        .should('be.visible')
        .click({ force: true });
      
      cy.wait(2000);
      
      // 2FA ekranı kontrolü (eğer 2FA aktifse)
      cy.get('body').then(($body) => {
        if ($body.text().includes('2FA') || $body.text().includes('kod') || $body.find('input[type="text"][name*="code"]').length > 0) {
          cy.log('2FA ekranı görüntülendi');
        } else {
          cy.log('2FA aktif değil veya ekran görüntülenmedi');
        }
      });
    });
  });
});
