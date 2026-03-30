describe('Admin Kritik Smoke', () => {
  const expectLastRequestUrlToInclude = (alias: string, expectedFragment: string) => {
    cy.wait(700);
    cy.get(`${alias}.all`).then((requests: any) => {
      const lastRequest = requests[requests.length - 1];
      expect(lastRequest?.request?.url).to.include(expectedFragment);
    });
  };

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('dashboard yüklenmeli', () => {
    cy.visit('/admin/dashboard', { failOnStatusCode: false });
    cy.contains('h1', 'Dashboard', { timeout: 20000 }).should('be.visible');
    cy.contains('Son Projeler', { timeout: 20000 }).should('be.visible');
  });

  it('kullanıcı filtreleri backend query paramlarıyla çalışmalı', () => {
    cy.intercept('GET', '**/api/users*').as('getUsers');

    cy.visit('/admin/users', { failOnStatusCode: false });
    cy.wait('@getUsers').its('request.url').should('include', 'page=1');

    cy.get('#search').clear().type('test');
    expectLastRequestUrlToInclude('@getUsers', 'search=test');

    cy.get('#status-filter').select('Aktif');
    expectLastRequestUrlToInclude('@getUsers', 'isActive=true');

    cy.get('#role-filter').select('Teknisyen');
    expectLastRequestUrlToInclude('@getUsers', 'role=TEKNISYEN');
  });

  it('proje filtreleri backend query paramlarıyla çalışmalı', () => {
    cy.intercept('GET', '**/api/projects*').as('getProjects');

    cy.visit('/admin/projects', { failOnStatusCode: false });
    cy.wait('@getProjects').its('request.url').should('include', 'page=1');

    cy.get('#project-search').clear().type('festival');
    expectLastRequestUrlToInclude('@getProjects', 'search=festival');

    cy.get('#project-status-filter').select('Onay Bekleyen');
    expectLastRequestUrlToInclude('@getProjects', 'status=PENDING_APPROVAL');

    cy.get('#project-date-filter').select('Yaklaşan Etkinlikler');
    expectLastRequestUrlToInclude('@getProjects', 'dateScope=upcoming');
  });

  it('görev filtreleri backend query paramlarıyla çalışmalı', () => {
    cy.intercept('GET', '**/api/tasks*').as('getTasks');

    cy.visit('/admin/tasks', { failOnStatusCode: false });
    cy.wait('@getTasks').its('request.url').should('include', 'page=1');

    cy.get('#search').clear().type('kamera');
    expectLastRequestUrlToInclude('@getTasks', 'search=kamera');

    cy.get('#priority-filter').select('Yüksek');
    expectLastRequestUrlToInclude('@getTasks', 'priority=HIGH');

    cy.get('#status-filter').select('Tamamlandı');
    expectLastRequestUrlToInclude('@getTasks', 'status=COMPLETED');
  });
});
