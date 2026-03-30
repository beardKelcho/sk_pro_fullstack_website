describe('Envanter Yönetimi', () => {
  const categoryId = '507f1f77bcf86cd799439011';
  const locationId = '507f1f77bcf86cd799439012';
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

  const availableItem = {
    _id: '507f191e810c19729de860ea',
    name: 'Sony FX6',
    category: { _id: categoryId, name: 'Kamera', slug: 'kamera' },
    location: { _id: locationId, name: 'Merkez Depo', type: 'WAREHOUSE' },
    trackingType: 'SERIALIZED',
    serialNumber: 'FX6-001',
    quantity: 1,
    status: 'AVAILABLE',
    brand: 'Sony',
    model: 'FX6',
    criticalStockLevel: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const inUseItem = {
    ...availableItem,
    _id: '507f191e810c19729de860eb',
    name: 'Aputure 600D',
    serialNumber: 'AP-600D-01',
    status: 'IN_USE',
    brand: 'Aputure',
    model: '600D',
  };

  beforeEach(() => {
    stubAdminShell();
    cy.loginAsAdmin();

    cy.intercept('GET', '**/api/inventory/categories*', {
      statusCode: 200,
      body: {
        data: [{ _id: categoryId, name: 'Kamera', slug: 'kamera' }],
      },
    }).as('getInventoryCategories');

    cy.intercept('GET', '**/api/inventory/locations*', {
      statusCode: 200,
      body: {
        data: [{ _id: locationId, name: 'Merkez Depo', type: 'WAREHOUSE' }],
      },
    }).as('getInventoryLocations');
  });

  it('filtreleri backend query paramlarıyla çalıştırmalı', () => {
    cy.intercept('GET', '**/api/inventory/items*', {
      statusCode: 200,
      body: {
        data: [availableItem],
        pagination: {
          total: 1,
          page: 1,
          limit: 50,
        },
      },
    }).as('getInventoryItems');

    cy.visit('/admin/inventory');
    cy.wait(['@getInventoryCategories', '@getInventoryLocations', '@getInventoryItems']);

    cy.get('[data-testid="inventory-search-input"]').type('Sony');
    cy.wait('@getInventoryItems')
      .its('request.url')
      .should('include', 'search=Sony');

    cy.get('[data-testid="inventory-category-filter"]').select(categoryId);
    cy.wait('@getInventoryItems')
      .its('request.url')
      .should('include', `category=${categoryId}`);

    cy.get('[data-testid="inventory-location-filter"]').select(locationId);
    cy.wait('@getInventoryItems')
      .its('request.url')
      .should('include', `location=${locationId}`);

    cy.get('[data-testid="inventory-clear-filters"]').click();
    cy.wait('@getInventoryItems')
      .its('request.url')
      .should('not.include', 'search=Sony');
  });

  it('müsait ürün için projeye atama modalını açmalı', () => {
    cy.intercept('GET', '**/api/inventory/items*', {
      statusCode: 200,
      body: {
        data: [availableItem],
        pagination: {
          total: 1,
          page: 1,
          limit: 50,
        },
      },
    }).as('getInventoryItems');

    cy.intercept('GET', '**/api/projects*', {
      statusCode: 200,
      body: {
        projects: [
          {
            _id: '507f1f77bcf86cd799439013',
            name: 'Festival Prodüksiyonu',
            status: 'ACTIVE',
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    }).as('getProjectsForAssignment');

    cy.visit('/admin/inventory');
    cy.wait('@getInventoryItems');

    cy.get(`[data-testid="inventory-assign-${availableItem._id}"]`).click();
    cy.wait('@getProjectsForAssignment');

    cy.contains('Projeye Ekipman Ata').should('be.visible');
    cy.contains('Sony FX6').should('be.visible');
    cy.contains('Projeye Ata').should('be.visible');
  });

  it('kullanımdaki ürün için iade modalını açmalı', () => {
    cy.intercept('GET', '**/api/inventory/items*', {
      statusCode: 200,
      body: {
        data: [inUseItem],
        pagination: {
          total: 1,
          page: 1,
          limit: 50,
        },
      },
    }).as('getInventoryItems');

    cy.visit('/admin/inventory');
    cy.wait('@getInventoryItems');

    cy.get(`[data-testid="inventory-return-${inUseItem._id}"]`).click();

    cy.contains('Projeden İade Al').should('be.visible');
    cy.contains('Aputure 600D').should('be.visible');
    cy.contains('İade Al').should('be.visible');
  });
});
