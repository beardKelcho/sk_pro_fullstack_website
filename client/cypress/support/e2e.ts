/// <reference types="cypress" />
// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import 'cypress-axe';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Ignore all uncaught exceptions (React hydration, Next.js router, etc.)
Cypress.on('uncaught:exception', () => false);

// Global test configuration
beforeEach(() => {
  // Clear cookies and localStorage before each test
  cy.clearCookies();
  cy.clearLocalStorage();
});

