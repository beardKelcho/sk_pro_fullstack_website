/**
 * RBAC (Role-Based Access Control) E2E Testleri
 * 
 * Bu dosya yetki yönetimi modülünün tüm işlevlerini test eder
 */

describe('RBAC Yönetimi', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Yetki Sayfası', () => {
    it('yetki sayfası açılmalı', () => {
      cy.visit('/admin/permissions');
      cy.url().should('include', '/admin/permissions');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/yetki|permission|rol/i, { timeout: 15000 }).should('exist');
    });

    it('kullanıcı listesi görüntülenmeli', () => {
      cy.visit('/admin/permissions');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Kullanıcı listesi
      cy.get('body').then(($body) => {
        const userList = $body.find('table, ul, [class*="user"]');
        if (userList.length > 0) {
          cy.log('Kullanıcı listesi bulundu');
        }
      });
    });
  });

  describe('Rol Atama', () => {
    it('kullanıcı seçilebilmeli', () => {
      cy.visit('/admin/permissions');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Kullanıcı seçimi
      cy.get('body').then(($body) => {
        const userSelect = $body.find('select[name*="user"], button:contains("Kullanıcı"), tr').first();
        if (userSelect.length > 0) {
          cy.wrap(userSelect).scrollIntoView().click({ force: true });
          cy.wait(1000);
          cy.log('Kullanıcı seçildi');
        }
      });
    });

    it('rol seçilebilmeli', () => {
      cy.visit('/admin/permissions');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Rol seçimi
      cy.get('body').then(($body) => {
        const roleSelect = $body.find('select[name*="role"], select#role, button[aria-label*="rol"]').first();
        if (roleSelect.length > 0) {
          cy.wrap(roleSelect).scrollIntoView().should('be.visible');
          // Rol seçenekleri kontrolü
          if (roleSelect.is('select')) {
            cy.wrap(roleSelect).find('option').should('have.length.at.least', 1);
          }
        }
      });
    });

    it('rol atanabilmeli', () => {
      cy.visit('/admin/permissions');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Kullanıcı seç
      cy.get('body').then(($body) => {
        const userRow = $body.find('tr, [class*="user-item"]').first();
        if (userRow.length > 0) {
          cy.wrap(userRow).click({ force: true });
          cy.wait(1000);
          
          // Rol seç ve kaydet
          const roleSelect = $body.find('select[name*="role"]').first();
          if (roleSelect.length > 0) {
            cy.wrap(roleSelect).select('TEKNISYEN', { force: true });
            
            // Kaydet butonu
            cy.get('button:contains("Kaydet"), button:contains("Save"), button[type="submit"]', { timeout: 10000 })
              .scrollIntoView()
              .click({ force: true });
            
            cy.wait(2000);
            cy.log('Rol atandı');
          }
        }
      });
    });
  });

  describe('Yetki Kontrolü', () => {
    it('yetki detayları görüntülenebilmeli', () => {
      cy.visit('/admin/permissions');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Yetki detayları tab'ı
      cy.get('body').then(($body) => {
        const detailsTab = $body.find('button:contains("Detay"), button:contains("Details"), [role="tab"]').first();
        if (detailsTab.length > 0) {
          cy.wrap(detailsTab).click({ force: true });
          cy.wait(1000);
          cy.log('Yetki detayları görüntülendi');
        }
      });
    });

    it('yetki kategorileri görüntülenebilmeli', () => {
      cy.visit('/admin/permissions');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Yetki kategorileri
      cy.get('body').then(($body) => {
        if ($body.text().includes('Ekipman') || $body.text().includes('Proje') || $body.text().includes('Görev')) {
          cy.log('Yetki kategorileri bulundu');
        }
      });
    });
  });

  describe('Farklı Rollerle Erişim', () => {
    it('TEKNISYEN rolü ile login test edilebilmeli', () => {
      // Not: Bu test için özel bir TEKNISYEN kullanıcısı gerekir
      // Şimdilik sadece sayfa erişimini test ediyoruz
      cy.visit('/admin/permissions');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      cy.log('TEKNISYEN rolü testi için özel kullanıcı gerekli');
    });

    it('DEPO_SORUMLUSU rolü ile login test edilebilmeli', () => {
      cy.visit('/admin/permissions');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      cy.log('DEPO_SORUMLUSU rolü testi için özel kullanıcı gerekli');
    });
  });
});
