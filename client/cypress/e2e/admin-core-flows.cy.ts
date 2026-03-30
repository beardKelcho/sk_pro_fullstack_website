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

describe('Admin Çekirdek Akışları', () => {
  beforeEach(() => {
    stubAdminShell();
    cy.loginAsAdmin();
  });

  it('proje oluşturma formu backend payloadını doğru maplemeli', () => {
    const customerId = '507f1f77bcf86cd799439041';
    const teamMemberId = '507f1f77bcf86cd799439042';
    const projectName = `Cypress Proje ${Date.now()}`;

    cy.intercept('GET', '**/api/clients*', {
      statusCode: 200,
      body: {
        clients: [
          {
            _id: customerId,
            company: 'Test Etkinlik A.Ş.',
            name: 'Selin Müşteri',
            email: 'selin@example.com',
            phone: '+90 555 000 00 00',
            contacts: [],
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    }).as('getCustomers');

    cy.intercept('GET', '**/api/users*', {
      statusCode: 200,
      body: {
        users: [
          {
            _id: teamMemberId,
            name: 'Okan Operasyon',
            role: 'PROJE_YONETICISI',
            email: 'okan@example.com',
            isActive: true,
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    }).as('getProjectUsers');

    cy.intercept('GET', '**/api/inventory/categories*', {
      statusCode: 200,
      body: {
        categories: [],
        data: [],
      },
    }).as('getProjectInventoryCategories');

    cy.intercept('GET', '**/api/inventory/items*', {
      statusCode: 200,
      body: {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 50,
        },
      },
    }).as('getProjectInventoryItems');

    cy.intercept('POST', '**/api/projects', (req) => {
      expect(req.body).to.include({
        name: projectName,
        client: customerId,
        contactPerson: 'Selin Müşteri',
        contactEmail: 'selin@example.com',
        contactPhone: '+90 555 000 00 00',
        location: 'İstanbul Kongre Merkezi',
        status: 'APPROVED',
      });
      expect(req.body.team).to.deep.equal([teamMemberId]);

      req.reply({
        statusCode: 201,
        body: {
          project: {
            _id: '507f1f77bcf86cd799439043',
            ...req.body,
          },
        },
      });
    }).as('createProject');

    cy.intercept('GET', '**/api/projects*', {
      statusCode: 200,
      body: {
        projects: [
          {
            _id: '507f1f77bcf86cd799439043',
            name: projectName,
            status: 'APPROVED',
            client: customerId,
            startDate: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    }).as('getProjectsAfterCreate');

    cy.visit('/admin/projects/add');
    cy.get('[data-testid="project-form"]', { timeout: 20000 }).should('be.visible');

    cy.get('[data-testid="project-form"]').within(() => {
      cy.get('#name').type(projectName).should('have.value', projectName);
      cy.get('#customerName').type('Test Etkinlik');
    });

    cy.get('[data-testid="customer-option"]').click();
    cy.get('#location').type('İstanbul Kongre Merkezi');
    cy.get('#status').select('Onaylanan');
    cy.contains('button', 'Ekip Seç').click();
    cy.contains('label', 'Okan Operasyon').click();
    cy.get('[data-testid="project-submit"]').click();

    cy.wait('@createProject');
    cy.contains('Proje başarıyla eklendi').should('be.visible');
    cy.url({ timeout: 10000 }).should('include', '/admin/projects');
  });

  it('export menüsünden CSV indirme isteğini tetiklemeli', () => {
    cy.intercept('GET', '**/api/inventory/categories*', {
      statusCode: 200,
      body: {
        data: [],
      },
    }).as('getInventoryCategories');

    cy.intercept('GET', '**/api/inventory/locations*', {
      statusCode: 200,
      body: {
        data: [],
      },
    }).as('getInventoryLocations');

    cy.intercept('GET', '**/api/inventory/items*', {
      statusCode: 200,
      body: {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 50,
        },
      },
    }).as('getInventoryItems');

    cy.intercept('GET', '**/api/export?type=inventory&format=csv*', {
      statusCode: 200,
      body: 'id,name\n1,Sony FX6',
      headers: {
        'content-type': 'text/csv',
      },
    }).as('exportInventoryCsv');

    cy.visit('/admin/inventory');
    cy.window().then((win) => {
      cy.stub(win.URL, 'createObjectURL').returns('blob:inventory-export').as('createObjectURL');
      cy.stub(win.URL, 'revokeObjectURL').as('revokeObjectURL');
      cy.stub(win.HTMLAnchorElement.prototype, 'click').as('downloadClick');
    });

    cy.wait(['@getInventoryCategories', '@getInventoryLocations', '@getInventoryItems']);
    cy.get('[data-testid="export-menu-trigger-inventory"]').click();
    cy.get('[data-testid="export-option-inventory-csv"]').click();

    cy.wait('@exportInventoryCsv');
    cy.get('@createObjectURL').should('have.been.called');
    cy.get('@downloadClick').should('have.been.calledOnce');
  });
});
