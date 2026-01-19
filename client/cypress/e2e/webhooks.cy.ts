describe('Webhooks (Admin)', () => {
  it('should open the webhooks page', () => {
    cy.loginAsAdmin();
    // Webhooks sayfasına git
    cy.visit('/admin/webhooks');

    // Yönlendirmeyi kontrol et
    cy.url().should('include', '/admin/webhooks');

    // Sayfa yüklendiğini kontrol et
    cy.get('body', { timeout: 15000 }).should('be.visible');

    // Webhook içeriği kontrolü - sayfa başlığını ara
    cy.contains(/webhook|Webhook|Webhook Yönetimi/i, { timeout: 15000 }).should('exist');
  });
});

