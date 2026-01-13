/**
 * Smoke Tests - Kritik Fonksiyonların Hızlı Testi
 * 
 * Bu testler production'a çıkmadan önce kritik fonksiyonların çalıştığını doğrular
 */

describe('Smoke Tests - Kritik Fonksiyonlar', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('ana sayfa yüklenmeli', () => {
    cy.contains('SK Production', { timeout: 10000 }).should('be.visible');
  });

  it('navigasyon çalışmalı', () => {
    cy.get('nav').should('be.visible');
    cy.contains('a', 'Projeler').should('exist');
    cy.contains('a', 'Hizmetler').should('exist');
    cy.contains('a', 'Hakkımızda').should('exist');
    cy.contains('a', 'İletişim').should('exist');
  });

  it('footer görünmeli', () => {
    cy.get('footer').should('be.visible');
  });

  it('admin login sayfasına erişilebilmeli', () => {
    cy.visit('/admin');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('404 sayfası çalışmalı', () => {
    cy.visit('/nonexistent-page', { failOnStatusCode: false });
    cy.contains(/404|bulunamadı|not found/i).should('be.visible');
  });
});

