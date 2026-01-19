/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Admin olarak giriş yap
       */
      loginAsAdmin(): Chainable<void>;

      /**
       * Belirli bir role sahip kullanıcı olarak giriş yap
       */
      loginAsUser(email: string, password: string): Chainable<void>;

      /**
       * Form doldur ve gönder
       */
      fillAndSubmitForm(formData: Record<string, string>): Chainable<void>;

      /**
       * Resim yükle
       */
      uploadImage(filePath: string): Chainable<void>;

      /**
       * cypress-axe: sayfaya axe enjekte eder
       */
      injectAxe(): Chainable<void>;

      /**
       * cypress-axe: erişilebilirlik kontrolü çalıştırır
       */
      checkA11y(
        context?: any,
        options?: any,
        violationCallback?: any,
        skipFailures?: boolean
      ): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginAsAdmin', () => {
  // Test kullanıcısı kullan (2FA kapalı, test için hazır)
  const TEST_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const TEST_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  cy.visit('/admin');
  // Sayfa yüklenmesini bekle
  cy.get('body', { timeout: 15000 }).should('be.visible');

  // Eğer zaten giriş yapılmışsa tekrar giriş yapma
  cy.url().then(url => {
    if (url.includes('/admin/dashboard')) {
      cy.log('Zaten giriş yapılmış.');
      return;
    }

    // Admin login sayfası input[type="text"] kullanıyor, name="email" ile
    cy.get('input[name="email"], input#email, input[type="text"][name="email"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(TEST_EMAIL, { force: true });

    cy.get('input[name="password"], input#password, input[type="password"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(TEST_PASSWORD, { force: true });

    // Form submit butonunu bul ve tıkla
    cy.get('form', { timeout: 10000 }).then(($form) => {
      if ($form.length > 0) {
        cy.get('button[type="submit"], form button[type="submit"]', { timeout: 10000 })
          .should('be.visible')
          .click({ force: true });
      } else {
        // Form yoksa direkt buton tıkla
        cy.get('button[type="submit"]', { timeout: 10000 })
          .should('be.visible')
          .click({ force: true });
      }
    });

    // Dashboard'a yönlendirilmeyi bekle
    // URL kontrolü + Sayfada belirgin bir element kontrolü
    cy.wait(1000); // Kısa bir bekleme (redirect için)
    cy.url({ timeout: 20000 }).then(url => {
      if (url.includes('/admin/dashboard')) {
        return;
      }
      // Eğer hala /admin'deysek hata mesajı var mı bak
      cy.get('body').then($body => {
        if ($body.text().includes('Hata') || $body.text().includes('Error') || $body.text().includes('Yalnış')) {
          cy.log('Login Hatası Tespit Edildi:', $body.text());
        }
      });
    });
    cy.url({ timeout: 20000 }).should('include', '/admin/dashboard');
    cy.contains(/dashboard|ana sayfa|hoşgeldin/i, { timeout: 15000 }).should('exist');
  });
});

Cypress.Commands.add('loginAsUser', (email: string, password: string) => {
  cy.visit('/admin');
  cy.get('body', { timeout: 15000 }).should('be.visible');

  cy.get('input[name="email"], input#email, input[type="text"][name="email"]', { timeout: 10000 })
    .should('be.visible')
    .clear()
    .type(email, { force: true });

  cy.get('input[name="password"], input#password, input[type="password"]', { timeout: 10000 })
    .should('be.visible')
    .clear()
    .type(password, { force: true });

  cy.get('form', { timeout: 10000 }).then(($form) => {
    if ($form.length > 0) {
      cy.get('button[type="submit"], form button[type="submit"]', { timeout: 10000 })
        .should('be.visible')
        .click({ force: true });
    } else {
      cy.get('button[type="submit"]', { timeout: 10000 })
        .should('be.visible')
        .click({ force: true });
    }
  });

  cy.url({ timeout: 20000 }).should('include', '/admin');
});

Cypress.Commands.add('fillAndSubmitForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([name, value]) => {
    cy.get(`input[name="${name}"], textarea[name="${name}"], select[name="${name}"]`).type(value);
  });
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('uploadImage', (filePath: string) => {
  cy.get('input[type="file"]').selectFile(filePath, { force: true });
  cy.get('button').contains(/yükle|upload/i).click();
});

export { };

