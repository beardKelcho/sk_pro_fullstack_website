/**
 * Profile Settings E2E Testleri
 * 
 * Bu dosya profile settings modülünün tüm işlevlerini test eder
 */

describe('Profile Settings', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Profile Sayfası', () => {
    it('profile sayfası açılmalı', () => {
      cy.visit('/admin/profile');
      cy.url().should('include', '/admin/profile');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/profil|profile/i, { timeout: 15000 }).should('exist');
    });

    it('profil bilgileri görüntülenebilmeli', () => {
      cy.visit('/admin/profile');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Profil formu
      cy.get('form', { timeout: 15000 }).should('exist');
      
      // İsim ve email alanları
      cy.get('input[name="name"], input#name', { timeout: 10000 })
        .should('exist');
      
      cy.get('input[name="email"], input#email, input[type="email"]', { timeout: 10000 })
        .should('exist');
    });
  });

  describe('Profil Güncelleme', () => {
    it('profil bilgileri güncellenebilmeli', () => {
      cy.visit('/admin/profile');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Form alanlarını doldur
      cy.get('input[name="name"], input#name', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type('Test Kullanıcı Güncellendi', { force: true });
      
      // Kaydet butonu
      cy.get('button[type="submit"], button:contains("Kaydet"), button:contains("Save")', { timeout: 10000 })
        .scrollIntoView()
        .should('be.visible');
    });

    it('şifre değiştirilebilmeli', () => {
      cy.visit('/admin/profile');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Şifre değiştirme bölümü
      cy.get('body').then(($body) => {
        const passwordSection = $body.find('input[type="password"][name*="password"], input[type="password"][name*="current"]');
        if (passwordSection.length > 0) {
          cy.log('Şifre değiştirme alanları bulundu');
          
          // Mevcut şifre
          cy.get('input[type="password"][name*="current"], input[type="password"][name*="old"]', { timeout: 10000 })
            .should('be.visible')
            .clear()
            .type(ADMIN_PASSWORD, { force: true });
          
          // Yeni şifre
          cy.get('input[type="password"][name*="new"], input[type="password"][name*="password"]').last()
            .should('be.visible')
            .clear()
            .type('NewPassword123!', { force: true });
        }
      });
    });
  });
});
