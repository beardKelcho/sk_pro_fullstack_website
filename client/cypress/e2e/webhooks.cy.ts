describe('Webhooks (Admin)', () => {
  it('should open the webhooks page', () => {
    cy.loginAsAdmin();
    cy.visit('/admin/webhooks');
    cy.contains('Webhook Yönetimi').should('be.visible');
  });
});

