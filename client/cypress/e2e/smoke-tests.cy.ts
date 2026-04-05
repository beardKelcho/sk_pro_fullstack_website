/**
 * Smoke Tests - Kritik Fonksiyonların Hızlı Testi
 * 
 * Bu testler production'a çıkmadan önce kritik fonksiyonların çalıştığını doğrular
 */

describe('Smoke Tests - Kritik Fonksiyonlar', () => {
  const waitForHomeContent = () => {
    cy.get('body', { timeout: 20000 }).should('be.visible');
    cy.get('[data-testid="site-header"], [data-testid="maintenance-page"], main', {
      timeout: 30000,
    }).should('exist');
  };

  const withPublicSiteGuard = (callback: () => void) => {
    cy.get('body', { timeout: 20000 }).then(($body) => {
      const bodyText = $body.text().toLowerCase();
      const isMaintenanceMode =
        $body.find('[data-testid="maintenance-page"]').length > 0 ||
        bodyText.includes('bakimdayiz') ||
        bodyText.includes('bakımdayız');

      if (isMaintenanceMode) {
        cy.log('Bakım modu aktif — ilgili smoke adımı atlanıyor');
        return;
      }

      callback();
    });
  };

  beforeEach(() => {
    cy.visit('/', { failOnStatusCode: false });
    cy.get('body', { timeout: 15000 }).should('be.visible');
  });

  it('ana sayfa yüklenmeli', () => {
    waitForHomeContent();
  });

  it('navigasyon çalışmalı', () => {
    waitForHomeContent();
    withPublicSiteGuard(() => {
      cy.get('[data-testid="site-navigation"]', { timeout: 30000 })
        .should('be.visible');

      cy.get('[data-testid="site-navigation"] a')
        .its('length')
        .should('be.gte', 4);

      cy.contains('[data-testid="site-navigation"] a', 'Projeler')
        .should('have.attr', 'href')
        .and('include', '#projects');

      cy.contains('[data-testid="site-navigation"] a', 'İletişim')
        .should('have.attr', 'href')
        .and('include', '#contact');
    });
  });

  it('footer görünmeli', () => {
    waitForHomeContent();
    withPublicSiteGuard(() => {
      cy.get('[data-testid="site-footer"]', { timeout: 30000 })
        .scrollIntoView()
        .should('be.visible');

      cy.contains('[data-testid="site-footer"]', 'İletişim', { timeout: 30000 })
        .should('be.visible');

      cy.contains('[data-testid="site-footer"]', 'Çalışma Saatleri', { timeout: 30000 })
        .should('be.visible');
    });
  });

  it('admin login sayfasına erişilebilmeli', () => {
    cy.visit('/admin/login/', { failOnStatusCode: false });
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
