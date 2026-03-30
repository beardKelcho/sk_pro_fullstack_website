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
  const TEST_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@example.com';
  const TEST_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';
  const API_URL = Cypress.env('NEXT_PUBLIC_API_URL') || 'http://localhost:5001/api';

  const performLogin = (email: string, password: string) => {
    cy.request('POST', `${API_URL}/auth/login`, {
      email,
      password,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body?.success).to.eq(true);
      expect(response.body?.requires2FA).to.not.eq(true);

      const rawUser = response.body?.user;
      const userData = {
        id: rawUser?.id || rawUser?._id,
        _id: rawUser?.id || rawUser?._id,
        name: rawUser?.name,
        email: rawUser?.email,
        role: rawUser?.role,
        permissions: rawUser?.permissions || [],
        isActive: rawUser?.isActive !== undefined ? rawUser.isActive : true,
      };

      cy.visit('/admin/dashboard', {
        failOnStatusCode: false,
        onBeforeLoad(win) {
          win.sessionStorage.setItem('user', JSON.stringify(userData));
        },
      });
    });

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
  const API_URL = Cypress.env('NEXT_PUBLIC_API_URL') || 'http://localhost:5001/api';

  const performLogin = () => {
    cy.request('POST', `${API_URL}/auth/login`, {
      email,
      password,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body?.success).to.eq(true);
      expect(response.body?.requires2FA).to.not.eq(true);

      const rawUser = response.body?.user;
      const userData = {
        id: rawUser?.id || rawUser?._id,
        _id: rawUser?.id || rawUser?._id,
        name: rawUser?.name,
        email: rawUser?.email,
        role: rawUser?.role,
        permissions: rawUser?.permissions || [],
        isActive: rawUser?.isActive !== undefined ? rawUser.isActive : true,
      };

      cy.visit('/admin/dashboard', {
        failOnStatusCode: false,
        onBeforeLoad(win) {
          win.sessionStorage.setItem('user', JSON.stringify(userData));
        },
      });
    });

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
  cy.loginAsAdmin();
});

Cypress.Commands.add('uploadImage', (filePath: string) => {
  cy.get('input[type="file"]').selectFile(filePath, { force: true });
  cy.get('button').contains(/yükle|upload/i).click();
});

export { };
