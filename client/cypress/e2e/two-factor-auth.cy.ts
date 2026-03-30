const stubAdminShell = () => {
  cy.intercept('GET', '**/api/auth/profile*', {
    statusCode: 200,
    body: {
      success: true,
      user: {
        _id: '507f1f77bcf86cd799439001',
        name: 'Test Admin',
        email: 'test@example.com',
        role: 'ADMIN',
        permissions: [],
        isActive: true,
      },
    },
  }).as('getAuthProfile');

  cy.intercept('GET', '**/api/notifications/unread-count*', {
    statusCode: 200,
    body: {
      success: true,
      unreadCount: 0,
    },
  }).as('getUnreadCount');
};

describe('2FA Yönetimi', () => {
  beforeEach(() => {
    stubAdminShell();
    cy.loginAsAdmin();
  });

  it('2FA kurulumunu başlatıp doğrulama akışını tamamlamalı', () => {
    let isEnabled = false;

    cy.intercept('GET', '**/api/two-factor/status*', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          is2FAEnabled: isEnabled,
          hasBackupCodes: isEnabled,
        },
      });
    }).as('get2FAStatus');

    cy.intercept('POST', '**/api/two-factor/setup', {
      statusCode: 200,
      body: {
        success: true,
        secret: 'TESTSECRET',
        qrCode: 'data:image/png;base64,ZmFrZS1xci1jb2Rl',
        backupCodes: ['AAAA-BBBB', 'CCCC-DDDD', 'EEEE-FFFF', 'GGGG-HHHH'],
        message: '2FA setup started',
      },
    }).as('setup2FA');

    cy.intercept('POST', '**/api/two-factor/verify', (req) => {
      expect(req.body).to.deep.equal({ token: '123456', backupCode: '' });
      isEnabled = true;

      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: '2FA enabled',
        },
      });
    }).as('verify2FA');

    cy.visit('/admin/two-factor');

    cy.get('[data-testid="two-factor-status-card"]', { timeout: 20000 }).should('contain.text', '2FA Devre Dışı');
    cy.get('[data-testid="two-factor-enable-button"]').click();

    cy.wait('@setup2FA');
    cy.get('[data-testid="two-factor-verify-form"]').should('be.visible');
    cy.contains('AAAA-BBBB').should('be.visible');

    cy.get('[data-testid="two-factor-token-input"]').type('123456');
    cy.get('[data-testid="two-factor-verify-submit"]').click();

    cy.wait('@verify2FA');
    cy.get('[data-testid="two-factor-status-card"]', { timeout: 20000 }).should('contain.text', '2FA Aktif');
    cy.contains("2FA'yı Devre Dışı Bırak").should('be.visible');
  });

  it('2FA devre dışı bırakma akışını tamamlamalı', () => {
    let isEnabled = true;

    cy.intercept('GET', '**/api/two-factor/status*', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          is2FAEnabled: isEnabled,
          hasBackupCodes: true,
        },
      });
    }).as('get2FAStatus');

    cy.intercept('POST', '**/api/two-factor/disable', (req) => {
      expect(req.body).to.deep.equal({
        password: 'Test123!',
        token: '654321',
      });
      isEnabled = false;

      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: '2FA disabled',
        },
      });
    }).as('disable2FA');

    cy.visit('/admin/two-factor');

    cy.get('[data-testid="two-factor-status-card"]', { timeout: 20000 }).should('contain.text', '2FA Aktif');
    cy.get('[data-testid="two-factor-disable-button"]').click();
    cy.get('[data-testid="two-factor-disable-form"]').should('be.visible');

    cy.get('[data-testid="two-factor-disable-password"]').type('Test123!');
    cy.get('[data-testid="two-factor-disable-token"]').type('654321');
    cy.get('[data-testid="two-factor-disable-submit"]').click();

    cy.wait('@disable2FA');
    cy.get('[data-testid="two-factor-status-card"]', { timeout: 20000 }).should('contain.text', '2FA Devre Dışı');
    cy.get('[data-testid="two-factor-enable-button"]').should('be.visible');
  });
});
