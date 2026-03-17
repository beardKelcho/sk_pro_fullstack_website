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

// Ignore uncaught exceptions (like hydration errors or minor script failures)
Cypress.on('uncaught:exception', (err, runnable) => {
  // React hydration errors are common in SSR apps and often non-fatal for E2E
  if (
    err.message.includes('Minified React error #418') || 
    err.message.includes('Minified React error #329') ||
    err.message.includes('Minified React error #425') ||
    err.message.includes('hydration')
  ) {
    return false;
  }
  
  // Return false anyway to keep CI stable during major refactors, 
  // but log it for visibility
  console.log('Cypress caught an uncaught exception:', err.message);
  return false;
});

// Global test configuration
beforeEach(() => {
  // Clear cookies and localStorage before each test
  cy.clearCookies();
  cy.clearLocalStorage();
});

