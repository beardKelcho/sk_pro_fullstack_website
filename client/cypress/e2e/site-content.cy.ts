/**
 * Site Content Management E2E Testleri
 * 
 * Bu dosya site content yönetimi modülünün tüm işlevlerini test eder
 */

describe('Site Content Management', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/admin/site-management');
    cy.url({ timeout: 20000 }).should('include', '/admin/site-management');
    cy.contains('h1', 'Site Yönetimi', { timeout: 15000 }).should('be.visible');
  });

  describe('Site Management Sayfası', () => {
    it('site yönetimi sayfası açılmalı', () => {
      cy.contains('h3', 'Hero Bölümü').should('be.visible');
      cy.contains('h3', 'Hakkımızda').should('be.visible');
      cy.contains('h3', 'Hizmetler').should('be.visible');
      cy.contains('h3', 'İletişim').should('be.visible');
      cy.contains('h3', 'Projeler').should('be.visible');
    });

    it('bölüm seçimi çalışmalı', () => {
      cy.contains('h3', 'Hero Bölümü')
        .scrollIntoView()
        .click({ force: true });

      cy.contains('h2', 'Hero Bölümü Düzenle', { timeout: 10000 }).should('be.visible');
      cy.contains('Metin İçerikleri').should('be.visible');
    });
  });

  describe('Hero Bölümü Düzenleme', () => {
    it('hero bölümü düzenlenebilmeli', () => {
      cy.contains('h3', 'Hero Bölümü')
        .scrollIntoView()
        .click({ force: true });

      cy.contains('h2', 'Hero Bölümü Düzenle', { timeout: 10000 }).should('be.visible');
      cy.get('input[placeholder*="Piksellerin Ötesinde"]', { timeout: 10000 }).should('be.visible');
      cy.get('textarea[placeholder*="Kısa açıklama"]', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Services Bölümü Düzenleme', () => {
    it('services bölümü düzenlenebilmeli', () => {
      cy.contains('h3', 'Hizmetler')
        .scrollIntoView()
        .click({ force: true });

      cy.contains('h2', 'Hizmetler Yönetimi', { timeout: 10000 }).should('be.visible');
      cy.contains('Hizmet Listesi').should('be.visible');
      cy.contains('Yeni Ekle').should('be.visible');
    });
  });

  describe('About Bölümü Düzenleme', () => {
    it('about bölümü düzenlenebilmeli', () => {
      cy.contains('h3', 'Hakkımızda')
        .scrollIntoView()
        .click({ force: true });

      cy.contains('h2', 'Hakkımızda Yönetimi', { timeout: 10000 }).should('be.visible');
      cy.get('input[placeholder*="SK Production Hakkında"]', { timeout: 10000 }).should('be.visible');
      cy.get('textarea[placeholder*="Şirket hakkında detaylı açıklama"]', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Contact Bilgileri Düzenleme', () => {
    it('contact bilgileri düzenlenebilmeli', () => {
      cy.contains('h3', 'İletişim')
        .scrollIntoView()
        .click({ force: true });

      cy.contains('h2', 'İletişim Yönetimi', { timeout: 10000 }).should('be.visible');
      cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible');
      cy.get('input[type="tel"]', { timeout: 10000 }).should('be.visible');
      cy.get('input[type="url"]', { timeout: 10000 }).should('be.visible');
    });
  });
});
