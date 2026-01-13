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
    }
  }
}

Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/admin');
  cy.get('input[type="email"]').type('admin@skpro.com.tr');
  cy.get('input[type="password"]').type('Admin123!');
  cy.get('button[type="submit"]').click();
  cy.url({ timeout: 10000 }).should('include', '/admin/dashboard');
});

Cypress.Commands.add('loginAsUser', (email: string, password: string) => {
  cy.visit('/admin');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url({ timeout: 10000 }).should('include', '/admin');
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

export {};

