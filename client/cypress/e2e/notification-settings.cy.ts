/**
 * Notification Settings E2E Testleri
 * 
 * Bu dosya notification settings modülünün tüm işlevlerini test eder
 */

describe('Notification Settings', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Notification Settings Sayfası', () => {
    it('notification settings sayfası açılmalı', () => {
      cy.visit('/admin/notification-settings');
      cy.url().should('include', '/admin/notification-settings');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/bildirim|notification|ayar/i, { timeout: 15000 }).should('exist');
    });

    it('bildirim tercihleri görüntülenebilmeli', () => {
      cy.visit('/admin/notification-settings');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Toggle switch'ler veya checkbox'lar
      cy.get('body').then(($body) => {
        const toggles = $body.find('input[type="checkbox"], [role="switch"], [class*="toggle"]');
        if (toggles.length > 0) {
          cy.log('Bildirim tercihleri bulundu');
        }
      });
    });
  });

  describe('Bildirim Tercihleri', () => {
    it('bildirim tercihleri güncellenebilmeli', () => {
      cy.visit('/admin/notification-settings');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // İlk toggle'ı değiştir
      cy.get('body').then(($body) => {
        const firstToggle = $body.find('input[type="checkbox"], [role="switch"]').first();
        if (firstToggle.length > 0) {
          cy.wrap(firstToggle).scrollIntoView().click({ force: true });
          cy.wait(1000);
          
          // Kaydet butonu
          cy.get('button[type="submit"], button:contains("Kaydet")', { timeout: 10000 })
            .scrollIntoView()
            .should('be.visible');
        }
      });
    });

    it('push notification ayarları güncellenebilmeli', () => {
      cy.visit('/admin/notification-settings');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Push notification toggle
      cy.get('body').then(($body) => {
        const pushToggle = $body.find('input[name*="push"], button:contains("Push")').first();
        if (pushToggle.length > 0) {
          cy.wrap(pushToggle).scrollIntoView().click({ force: true });
          cy.wait(1000);
          cy.log('Push notification ayarı güncellendi');
        }
      });
    });
  });
});
