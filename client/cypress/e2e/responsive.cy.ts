describe('Responsive Design Tests', () => {
  const viewports = [
    { width: 320, height: 568, device: 'iPhone 5' },
    { width: 375, height: 667, device: 'iPhone 6/7/8' },
    { width: 414, height: 736, device: 'iPhone 6/7/8 Plus' },
    { width: 768, height: 1024, device: 'iPad' },
    { width: 1024, height: 1366, device: 'Laptop' },
    { width: 1440, height: 900, device: 'Desktop' },
  ];

  viewports.forEach(({ width, height, device }) => {
    it(`should display correctly on ${device}`, () => {
      cy.viewport(width, height);
      cy.visit('/');

      // Header tests
      cy.get('header').should('be.visible');
      cy.get('nav').should('be.visible');

      // Hero section tests
      cy.get('section.hero').should('be.visible');
      cy.get('section.hero h1').should('be.visible');
      cy.get('section.hero p').should('be.visible');

      // Services section tests
      cy.get('section.services').should('be.visible');
      cy.get('section.services .service-card').should('have.length.at.least', 1);

      // Projects section tests
      cy.get('section.projects').should('be.visible');
      cy.get('section.projects .project-card').should('have.length.at.least', 1);

      // Contact section tests
      cy.get('section.contact').should('be.visible');
      cy.get('section.contact form').should('be.visible');

      // Footer tests
      cy.get('footer').should('be.visible');
      cy.get('footer .social-links').should('be.visible');

      // Navigation menu tests
      if (width < 768) {
        cy.get('button.menu-toggle').should('be.visible');
        cy.get('nav .menu-items').should('not.be.visible');
      } else {
        cy.get('button.menu-toggle').should('not.exist');
        cy.get('nav .menu-items').should('be.visible');
      }

      // Image tests
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'src');
        cy.wrap($img).should('have.attr', 'alt');
      });

      // Link tests
      cy.get('a').each(($link) => {
        cy.wrap($link).should('have.attr', 'href');
      });
    });
  });
}); 