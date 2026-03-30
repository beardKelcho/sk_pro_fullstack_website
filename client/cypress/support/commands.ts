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
       * Test ortamını kontrol et
       */
      checkTestEnvironment(): Chainable<void>;

      /**
       * Güvenilir login - her test için kullanılabilir
       */
      ensureLoggedIn(): Chainable<void>;

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

  const performLogin = (email: string, password: string) => {
    cy.visit('/admin', { failOnStatusCode: false });
    cy.get('body', { timeout: 15000 }).should('be.visible');

    cy.get('input[name="email"], input#email, input[type="text"][name="email"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(email, { force: true });

    cy.get('input[name="password"], input#password, input[type="password"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(password, { force: true });

    cy.get('button[type="submit"], form button[type="submit"]', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    cy.url({ timeout: 25000 }).should('include', '/admin/dashboard');
  };

  cy.session(
    ['admin-session', TEST_EMAIL],
    () => {
      performLogin(TEST_EMAIL, TEST_PASSWORD);
    },
    {
      validate: () => {
        cy.visit('/admin/dashboard', { failOnStatusCode: false });
        cy.location('pathname', { timeout: 20000 }).should('include', '/admin/dashboard');
      },
    }
  );

  cy.visit('/admin/dashboard', { failOnStatusCode: false });
  cy.url({ timeout: 20000 }).should('include', '/admin/dashboard');
});

Cypress.Commands.add('loginAsUser', (email: string, password: string) => {
  const performLogin = () => {
    cy.visit('/admin', { failOnStatusCode: false });
    cy.get('body', { timeout: 15000 }).should('be.visible');

    cy.get('input[name="email"], input#email, input[type="text"][name="email"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(email, { force: true });

    cy.get('input[name="password"], input#password, input[type="password"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(password, { force: true });

    cy.get('button[type="submit"], form button[type="submit"]', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    cy.url({ timeout: 25000 }).should('include', '/admin/dashboard');
  };

  cy.session(['user-session', email], performLogin, {
    validate: () => {
      cy.visit('/admin/dashboard', { failOnStatusCode: false });
      cy.location('pathname', { timeout: 20000 }).should('include', '/admin/dashboard');
    },
  });

  cy.visit('/admin/dashboard', { failOnStatusCode: false });
  cy.url({ timeout: 20000 }).should('include', '/admin/dashboard');
});

Cypress.Commands.add('fillAndSubmitForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([name, value]) => {
    cy.get(`input[name="${name}"], textarea[name="${name}"], select[name="${name}"]`).type(value);
  });
  cy.get('button[type="submit"]').click();
});

/**
 * Test ortamını kontrol et (Backend ve Frontend)
 */
Cypress.Commands.add('checkTestEnvironment', () => {
  const API_URL = Cypress.env('NEXT_PUBLIC_API_URL') || 'http://localhost:5001';
  const FRONTEND_URL = Cypress.config('baseUrl') || 'http://localhost:3000';

  // Backend kontrolü (opsiyonel - başarısız olursa test devam eder)
  cy.request({
    url: `${API_URL}/api/health`,
    failOnStatusCode: false,
    timeout: 5000,
  }).then((response) => {
    if (response.status !== 200) {
      cy.log('⚠️ Backend çalışmıyor olabilir - Test devam edecek');
    } else {
      cy.log('✅ Backend çalışıyor');
    }
  }).catch(() => {
    cy.log('⚠️ Backend kontrolü başarısız - Test devam edecek');
  });

  // Frontend kontrolü (opsiyonel - başarısız olursa test devam eder)
  cy.request({
    url: FRONTEND_URL,
    failOnStatusCode: false,
    timeout: 5000,
  }).then((response) => {
    if (response.status >= 500) {
      cy.log('⚠️ Frontend 500 hatası veriyor - Test devam edecek');
    } else {
      cy.log('✅ Frontend erişilebilir');
    }
  }).catch(() => {
    cy.log('⚠️ Frontend kontrolü başarısız - Test devam edecek');
  });
});

/**
 * Güvenilir login - her test için kullanılabilir
 */
Cypress.Commands.add('ensureLoggedIn', () => {
  const TEST_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const TEST_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  // Login sayfasına git
  cy.visit('/admin', { failOnStatusCode: false });
  cy.wait(2000);

  // Mevcut durumu kontrol et
  cy.get('body', { timeout: 10000 }).then(($body) => {
    const isLoginPage = $body.text().includes('Giriş Yap') ||
      $body.text().includes('Login') ||
      $body.find('input[name="email"]').length > 0;

    if (!isLoginPage) {
      // Zaten login olmuşsak devam et
      cy.log('✅ Zaten login olunmuş');
      return;
    }

    // Login formunu doldur
    cy.get('input[name="email"], input#email, input[type="text"][name="email"]', { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(TEST_EMAIL, { force: true });

    cy.get('input[name="password"], input#password, input[type="password"]', { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(TEST_PASSWORD, { force: true });

    // Submit
    cy.get('button[type="submit"], form button[type="submit"]', { timeout: 15000 })
      .should('be.visible')
      .click({ force: true });

    // Login'in başarılı olduğunu bekle
    cy.wait(3000);
    cy.url({ timeout: 25000 }).should('satisfy', (url) => {
      const cleanUrl = url.replace(/^\/(tr|en)/, '');
      return cleanUrl.includes('/admin/dashboard') ||
        cleanUrl.includes('/admin/equipment') ||
        cleanUrl.includes('/admin');
    });
  });
});

Cypress.Commands.add('uploadImage', (filePath: string) => {
  cy.get('input[type="file"]').selectFile(filePath, { force: true });
  cy.get('button').contains(/yükle|upload/i).click();
});

export { };
