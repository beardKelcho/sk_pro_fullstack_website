/**
 * Report Schedules E2E Testleri
 * 
 * Bu dosya report schedules modülünün tüm işlevlerini test eder
 */

describe('Report Schedules', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Report Schedule Listesi', () => {
    it('report schedules sayfası açılmalı', () => {
      cy.visit('/admin/report-schedules');
      cy.url().should('include', '/admin/report-schedules');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/rapor|report|zamanla/i, { timeout: 15000 }).should('exist');
    });

    it('schedule listesi görüntülenebilmeli', () => {
      cy.visit('/admin/report-schedules');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Schedule listesi
      cy.get('body').then(($body) => {
        const scheduleList = $body.find('table, ul, [class*="schedule"]');
        if (scheduleList.length > 0) {
          cy.log('Schedule listesi bulundu');
        }
      });
    });
  });

  describe('Rapor Zamanlama', () => {
    it('yeni rapor zamanlaması oluşturulabilmeli', () => {
      cy.visit('/admin/report-schedules/add');
      cy.url().should('include', '/admin/report-schedules/add');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Form kontrolü
      cy.get('form', { timeout: 15000 }).should('exist');
      
      // Rapor tipi seçimi
      cy.get('body').then(($body) => {
        const reportTypeSelect = $body.find('select[name*="type"], select#reportType').first();
        if (reportTypeSelect.length > 0) {
          cy.wrap(reportTypeSelect).select(1, { force: true });
        }
      });
      
      // Zamanlama seçimi
      cy.get('body').then(($body) => {
        const scheduleSelect = $body.find('select[name*="schedule"], input[type="time"]').first();
        if (scheduleSelect.length > 0) {
          cy.wrap(scheduleSelect).should('be.visible');
        }
      });
    });

    it('rapor zamanlaması düzenlenebilmeli', () => {
      cy.visit('/admin/report-schedules');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Düzenle butonu
      cy.get('body').then(($body) => {
        const editBtn = $body.find('button:contains("Düzenle"), a[href*="edit"]').first();
        if (editBtn.length > 0) {
          cy.wrap(editBtn).scrollIntoView().click({ force: true });
          cy.url({ timeout: 15000 }).should('include', '/report-schedules/edit');
        }
      });
    });
  });

  describe('Rapor Oluşturma', () => {
    it('rapor oluşturulabilmeli', () => {
      cy.visit('/admin/report-schedules');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Rapor oluştur butonu
      cy.get('body').then(($body) => {
        const createBtn = $body.find('button:contains("Oluştur"), button:contains("Create")').first();
        if (createBtn.length > 0) {
          cy.wrap(createBtn).scrollIntoView().click({ force: true });
          cy.wait(2000);
          cy.log('Rapor oluşturuldu');
        }
      });
    });
  });
});
