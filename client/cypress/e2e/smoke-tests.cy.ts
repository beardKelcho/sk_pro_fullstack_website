/**
 * Smoke Tests - Kritik Fonksiyonların Hızlı Testi
 * 
 * Bu testler production'a çıkmadan önce kritik fonksiyonların çalıştığını doğrular
 */

describe('Smoke Tests - Kritik Fonksiyonlar', () => {
  beforeEach(() => {
    cy.visit('/', { failOnStatusCode: false });
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.get('header', { timeout: 20000 }).should('be.visible');
  });

  it('ana sayfa yüklenmeli', () => {
    // fallbackData.ts içindeki title ile uyumlu hale getir
    cy.contains(/SK Production/i, { timeout: 15000 }).should('be.visible');
  });

  it('navigasyon çalışmalı', () => {
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const isMaintenanceMode =
        $body.find('[data-testid="maintenance-page"]').length > 0 ||
        $body.text().toLowerCase().includes('maintenance') ||
        $body.text().toLowerCase().includes('bakım');

      if (isMaintenanceMode) {
        cy.log('Bakım modu aktif — navigasyon testi atlanıyor');
        return;
      }
    });

    cy.get('nav[role="navigation"], header nav, [role="navigation"]', { timeout: 20000 })
      .should('be.visible')
      .find('a')
      .should('have.length.greaterThan', 0);
  });

  it('footer görünmeli', () => {
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const isMaintenanceMode =
        $body.find('[data-testid="maintenance-page"]').length > 0 ||
        $body.text().toLowerCase().includes('maintenance') ||
        $body.text().toLowerCase().includes('bakım');

      if (isMaintenanceMode) {
        cy.log('Bakım modu aktif — footer testi atlanıyor');
        return;
      }
    });

    cy.get('footer', { timeout: 20000 })
      .scrollIntoView()
      .should('be.visible');
  });

  it('admin login sayfasına erişilebilmeli', () => {
    cy.visit('/admin');
    cy.get('input[name="email"], input#email, input[type="text"][name="email"]', { timeout: 10000 }).should('be.visible');
    cy.get('input[name="password"], input#password, input[type="password"]', { timeout: 10000 }).should('be.visible');
    cy.get('button[type="submit"]', { timeout: 10000 }).should('be.visible');
  });

  it('404 sayfası çalışmalı', () => {
    cy.visit('/nonexistent-page', { failOnStatusCode: false });
    // Next.js default veya özel 404 sayfası içeriği
    cy.get('body').should('contain.text', '404');
  });
});
