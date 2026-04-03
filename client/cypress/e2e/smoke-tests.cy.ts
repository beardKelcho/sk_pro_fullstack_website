/**
 * Smoke Tests - Kritik Fonksiyonların Hızlı Testi
 * 
 * Bu testler production'a çıkmadan önce kritik fonksiyonların çalıştığını doğrular
 */

describe('Smoke Tests - Kritik Fonksiyonlar', () => {
  const waitForHomeContent = () => {
    cy.contains(/SK Production/i, { timeout: 20000 }).should('be.visible');
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

    cy.get('body').then(($body) => {
      const hasNavigation =
        $body.find('nav[role="navigation"], header nav, [role="navigation"]').length > 0;

      if (hasNavigation) {
        cy.get('nav[role="navigation"], header nav, [role="navigation"]', { timeout: 20000 })
          .should('exist')
          .find('a')
          .should('have.length.greaterThan', 0);
        return;
      }

      cy.get('a[href="/#projects"], a[href="#projects"]', { timeout: 20000 }).should('exist');
      cy.get('a[href="/#contact"], a[href="#contact"]', { timeout: 20000 }).should('exist');
    });
  });

  it('footer görünmeli', () => {
    waitForHomeContent();

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

    cy.get('body').then(($body) => {
      const hasFooter = $body.find('footer').length > 0;

      if (hasFooter) {
        cy.get('footer', { timeout: 20000 })
          .scrollIntoView()
          .should('be.visible');
        return;
      }

      cy.contains(/Çalışma Saatleri|İletişim/i, { timeout: 20000 })
        .scrollIntoView()
        .should('be.visible');
    });
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
