/**
 * Takvim Yönetimi E2E Testleri
 * 
 * Bu dosya takvim modülünün tüm işlevlerini test eder
 * TC009 - Event görüntüleme ve assignee seçimi testleri
 */

describe('Takvim Yönetimi', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/calendar/events*').as('calendarEvents');
    cy.loginAsAdmin();
    cy.visit('/admin/calendar');
    cy.url({ timeout: 20000 }).should('include', '/admin/calendar');
    cy.wait('@calendarEvents', { timeout: 20000 });
    cy.contains('h1', 'Proje Takvimi', { timeout: 15000 }).should('be.visible');
  });

  describe('Takvim Görünümleri', () => {
    it('takvim sayfası açılmalı', () => {
      cy.contains('Filtreler').should('be.visible');
      cy.contains('Renk Kodları').scrollIntoView().should('be.visible');
      cy.contains('button', 'Ay').should('exist');
      cy.contains('button', 'Hafta').should('exist');
      cy.contains('button', 'Gün').should('exist');
    });

    it('eventler görüntülenebilmeli', () => {
      cy.get('@calendarEvents')
        .its('response.statusCode')
        .should('be.oneOf', [200, 304]);

      cy.contains('Renk Kodları').scrollIntoView().should('be.visible');
      cy.contains('label', 'Projeler').should('exist');
      cy.contains('label', 'Ekipmanlar').should('exist');
    });

    it('ay görünümü çalışmalı', () => {
      cy.contains('button', 'Ay').click({ force: true });
      cy.contains('button', 'Ay').should('have.class', 'text-white');
      cy.contains('Pzt').should('be.visible');
    });

    it('hafta görünümü çalışmalı', () => {
      cy.contains('button', 'Hafta').click({ force: true });
      cy.contains('button', 'Hafta').should('have.class', 'text-white');
      cy.contains(/Pzt|Sal|Çar|Per|Cum|Cmt|Paz/).should('exist');
    });

    it('gün görünümü çalışmalı', () => {
      cy.contains('button', 'Gün').click({ force: true });
      cy.contains('button', 'Gün').should('have.class', 'text-white');
      cy.contains('Renk Kodları').should('be.visible');
    });
  });

  describe('Takvim Araçları', () => {
    it('filtreleme çalışmalı', () => {
      cy.contains('label', 'Projeler')
        .find('input[type="checkbox"]')
        .as('projectToggle');
      cy.contains('label', 'Ekipmanlar')
        .find('input[type="checkbox"]')
        .as('equipmentToggle');

      cy.get('@projectToggle').should('be.checked');
      cy.get('@projectToggle').click({ force: true });
      cy.contains('label', 'Projeler')
        .find('input[type="checkbox"]')
        .should('not.be.checked');
      cy.contains('label', 'Projeler')
        .find('input[type="checkbox"]')
        .click({ force: true });
      cy.contains('label', 'Projeler')
        .find('input[type="checkbox"]')
        .should('be.checked');

      cy.get('@equipmentToggle').should('be.checked');
      cy.get('@equipmentToggle').click({ force: true });
      cy.contains('label', 'Ekipmanlar')
        .find('input[type="checkbox"]')
        .should('not.be.checked');
      cy.contains('label', 'Ekipmanlar')
        .find('input[type="checkbox"]')
        .click({ force: true });
      cy.contains('label', 'Ekipmanlar')
        .find('input[type="checkbox"]')
        .should('be.checked');
    });

    it('iCal içe aktarma modalı açılıp kapanmalı', () => {
      cy.contains('button', 'iCal İçe Aktar').click({ force: true });
      cy.contains('h2', 'iCal Dosyası İçe Aktar', { timeout: 10000 }).should('be.visible');
      cy.get('input[type="file"]').should('be.visible');
      cy.contains('button', 'İptal').click({ force: true });
      cy.contains('h2', 'iCal Dosyası İçe Aktar').should('not.exist');
    });
  });
});
