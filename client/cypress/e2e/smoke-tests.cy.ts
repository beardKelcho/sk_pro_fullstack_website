/**
 * Smoke Tests - Kritik Fonksiyonların Hızlı Testi
 * 
 * Bu testler production'a çıkmadan önce kritik fonksiyonların çalıştığını doğrular
 */

describe('Smoke Tests - Kritik Fonksiyonlar', () => {
  beforeEach(() => {
    cy.visit('/', { failOnStatusCode: false });
    cy.get('body', { timeout: 15000 }).should('be.visible');
  });

  it('ana sayfa yüklenmeli', () => {
    cy.contains(/SK Production|SKPRO|skproduction/i, { timeout: 15000 }).should('be.visible');
  });

  it('navigasyon çalışmalı', () => {
    cy.get('nav, header nav, [role="navigation"]', { timeout: 10000 }).should('be.visible');
    // Navigasyon linklerini daha esnek kontrol et
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const hasNavLinks = $body.find('a, nav a, header a').length > 0;
      expect(hasNavLinks).to.be.true;
    });
  });

  it('footer görünmeli', () => {
    cy.get('footer').should('be.visible');
  });

  it('admin login sayfasına erişilebilmeli', () => {
    cy.visit('/admin');
    cy.get('input[name="email"], input#email, input[type="text"][name="email"]', { timeout: 10000 }).should('be.visible');
    cy.get('input[name="password"], input#password, input[type="password"]', { timeout: 10000 }).should('be.visible');
    cy.get('button[type="submit"]', { timeout: 10000 }).should('be.visible');
  });

  it('404 sayfası çalışmalı', () => {
    cy.visit('/nonexistent-page', { failOnStatusCode: false });
    cy.contains(/404|bulunamadı|not found/i).should('be.visible');
  });
});

