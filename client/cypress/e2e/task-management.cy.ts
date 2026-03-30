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

describe('Görev Yönetimi', () => {
  beforeEach(() => {
    stubAdminShell();
    cy.loginAsAdmin();
  });

  it('yeni görev oluştururken backend payloadını doğru göndermeli', () => {
    const userId = '507f1f77bcf86cd799439021';
    const projectId = '507f1f77bcf86cd799439022';
    const taskTitle = `Cypress Görev ${Date.now()}`;

    cy.intercept('GET', '**/api/users*', {
      statusCode: 200,
      body: {
        users: [
          {
            _id: userId,
            name: 'Test Teknisyen',
            role: 'TEKNISYEN',
            email: 'tech@example.com',
            isActive: true,
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    }).as('getTaskUsers');

    cy.intercept('GET', '**/api/projects*', {
      statusCode: 200,
      body: {
        projects: [
          {
            _id: projectId,
            name: 'Festival Prodüksiyonu',
            status: 'ACTIVE',
            client: '507f1f77bcf86cd799439023',
            startDate: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    }).as('getTaskProjects');

    cy.intercept('POST', '**/api/tasks', (req) => {
      expect(req.body).to.include({
        title: taskTitle,
        description: 'Görev açıklaması',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignedTo: userId,
        project: projectId,
      });
      expect(req.body.dueDate).to.match(/T23:59:59\.999Z$/);

      req.reply({
        statusCode: 201,
        body: {
          task: {
            _id: '507f1f77bcf86cd799439024',
            ...req.body,
          },
        },
      });
    }).as('createTask');

    cy.intercept('GET', '**/api/tasks?*', {
      statusCode: 200,
      body: {
        tasks: [
          {
            _id: '507f1f77bcf86cd799439024',
            title: taskTitle,
            description: 'Görev açıklaması',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            assignedTo: { _id: userId, name: 'Test Teknisyen', role: 'TEKNISYEN' },
            project: { _id: projectId, name: 'Festival Prodüksiyonu', status: 'ACTIVE' },
            dueDate: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    }).as('getTasksAfterCreate');

    cy.visit('/admin/tasks/add');
    cy.get('[data-testid="task-form"]', { timeout: 20000 }).should('be.visible');
    cy.get('#assignedTo option', { timeout: 20000 }).should('have.length.at.least', 2);
    cy.get('#relatedProject option', { timeout: 20000 }).should('have.length.at.least', 2);

    cy.get('[data-testid="task-form"]').within(() => {
      cy.get('#title').type(taskTitle);
      cy.get('#description').type('Görev açıklaması');
      cy.get('#status').select('Devam Ediyor');
      cy.get('#priority').select('Yüksek');
      cy.get('#assignedTo').select(userId);
      cy.get('#relatedProject').select(projectId);
      cy.get('[data-testid="task-submit"]').click();
    });

    cy.wait('@createTask');
    cy.get('[data-testid="task-success-notice"]').should('be.visible');
    cy.url({ timeout: 10000 }).should('include', '/admin/tasks');
  });

  it('görev detay sayfasını gerçek görev verisiyle açmalı', () => {
    const taskId = '507f1f77bcf86cd799439031';

    cy.intercept('GET', `**/api/tasks/${taskId}`, {
      statusCode: 200,
      body: {
        task: {
          _id: taskId,
          title: 'Sahne kurulumu',
          description: 'Kurulum öncesi kontrol listesi',
          priority: 'HIGH',
          status: 'TODO',
          assignedTo: { _id: '507f1f77bcf86cd799439032', name: 'Ayşe Teknik', role: 'TEKNISYEN' },
          project: { _id: '507f1f77bcf86cd799439033', name: 'Konser', status: 'ACTIVE' },
          dueDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    }).as('getTaskById');

    cy.visit(`/admin/tasks/view?id=${taskId}`);
    cy.wait('@getTaskById');
    cy.url().should('satisfy', (url) => url.includes(`/admin/tasks/view?id=${taskId}`) || url.includes(`/admin/tasks/view/?id=${taskId}`));
    cy.contains('h1', 'Sahne kurulumu').should('be.visible');
    cy.contains('Ayşe Teknik').should('be.visible');
    cy.contains('Konser').should('be.visible');
  });
});
