/**
 * Email Templates E2E Testleri
 * 
 * Bu dosya email templates modülünün tüm işlevlerini test eder
 */

describe('Email Templates', () => {
  const fillTemplateForm = (key: string, name: string, subject: string, html: string) => {
    cy.get('input[placeholder="örn: task_assigned"]').clear().type(key);
    cy.get('input[placeholder="örn: Görev Atandı"]').clear().type(name);
    cy.get('input[placeholder="örn: Görev Güncellendi - SK Production"]')
      .clear()
      .type(subject, { parseSpecialCharSequences: false });
    cy.get('textarea[placeholder="<div>...</div>"]').clear().type(html, { parseSpecialCharSequences: false });
  };

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Template Listesi', () => {
    it('email templates sayfası açılmalı', () => {
      cy.visit('/admin/email-templates');
      cy.url().should('include', '/admin/email-templates');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/email|şablon|template/i, { timeout: 15000 }).should('exist');
    });

    it('template listesi görüntülenebilmeli', () => {
      cy.visit('/admin/email-templates');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Template listesi - gerçek assertion ile
      cy.get('table, ul, [class*="template"]', { timeout: 10000 })
        .first()
        .should('exist')
        .should('be.visible');
    });
  });

  describe('Template İşlemleri', () => {
    it('template düzenlenebilmeli', () => {
      cy.visit('/admin/email-templates');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      const uniqueKey = `cypress_template_${Date.now()}`;
      const initialName = `Cypress Template ${Date.now()}`;
      const updatedName = `${initialName} Updated`;

      fillTemplateForm(
        uniqueKey,
        initialName,
        'Ilk konu',
        '<div>Merhaba {{userName}}</div>'
      );

      cy.contains('button', 'Oluştur').click({ force: true });
      cy.contains(initialName, { timeout: 10000 }).should('exist');

      cy.contains('tr', initialName, { timeout: 10000 }).within(() => {
        cy.contains('button', 'Düzenle').click({ force: true });
      });

      cy.contains('Şablon Düzenle', { timeout: 10000 }).should('exist');
      cy.get('input[placeholder="örn: Görev Atandı"]').clear().type(updatedName);
      cy.contains('button', 'Kaydet').click({ force: true });
      cy.contains(updatedName, { timeout: 10000 }).should('exist');
    });

    it('template preview görüntülenebilmeli', () => {
      cy.visit('/admin/email-templates');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      fillTemplateForm(
        `preview_template_${Date.now()}`,
        'Preview Template',
        'Merhaba {{userName}}',
        '<div><strong>{{userName}}</strong></div>'
      );

      cy.contains('button', 'Çalıştır', { timeout: 10000 })
        .should('exist')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      
      cy.wait(2000);
      
      cy.get('iframe[title="Email template preview"]', { timeout: 10000 })
        .should('exist')
        .should('be.visible')
        .invoke('attr', 'srcdoc')
        .should('contain', 'Ahmet');

      cy.contains('Subject:', { timeout: 10000 }).should('exist');
    });
  });
});
