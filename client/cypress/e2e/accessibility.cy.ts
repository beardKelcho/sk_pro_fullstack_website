describe('Accessibility (axe-core)', () => {
  it('Homepage: WCAG A/AA (color contrast dahil) kontrolü', () => {
    cy.visit('/');
    cy.injectAxe();

    cy.checkA11y(
      undefined,
      {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
        rules: {
          // Color contrast kontrolü için gerçek tarayıcı gerekiyor (Cypress bunu sağlar)
          'color-contrast': { enabled: true },
        },
      },
      undefined,
      false
    );
  });

  it('Admin Login: WCAG A/AA (color contrast dahil) kontrolü', () => {
    cy.visit('/admin');
    cy.injectAxe();

    cy.checkA11y(
      undefined,
      {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
        rules: {
          'color-contrast': { enabled: true },
        },
      },
      undefined,
      false
    );
  });
});

