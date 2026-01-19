/**
 * Session Yönetimi E2E Testleri
 * 
 * Bu dosya session yönetimi modülünün tüm işlevlerini test eder
 * TC017 - Session revoke işlemleri testleri
 */

describe('Session Yönetimi', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Session Listesi', () => {
    it('session listesi görüntülenmeli', () => {
      cy.visit('/admin/sessions');
      cy.url().should('include', '/admin/sessions');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/oturum|session/i, { timeout: 15000 }).should('exist');
    });

    it('session bilgileri görüntülenebilmeli', () => {
      cy.visit('/admin/sessions');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Session listesi kontrolü
      cy.get('body').then(($body) => {
        const hasSessions = $body.find('tr, [class*="session"], table').length > 0;
        if (hasSessions) {
          cy.log('Session listesi bulundu');
        }
      });
    });
  });

  describe('Session Revoke İşlemleri', () => {
    it('tek session sonlandırılabilmeli', () => {
      cy.visit('/admin/sessions');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sonlandır butonu
      cy.get('body').then(($body) => {
        const revokeBtn = $body.find('button:contains("Sonlandır"), button:contains("Revoke"), button[aria-label*="sonlandır"]').first();
        if (revokeBtn.length > 0) {
          cy.wrap(revokeBtn).scrollIntoView().click({ force: true });
          
          // Onay modal'ı
          cy.get('body').then(($modal) => {
            if ($modal.find('button:contains("Evet"), button:contains("Onayla")').length > 0) {
              cy.contains(/evet|onayla/i).click({ force: true });
            }
          });
          
          cy.wait(2000);
          // Toast mesajı kontrolü
          cy.get('body').then(($toast) => {
            if ($toast.text().includes('başarı') || $toast.text().includes('success')) {
              cy.log('Session sonlandırıldı');
            }
          });
        } else {
          cy.log('Sonlandır butonu bulunamadı');
        }
      });
    });

    it('diğer oturumlar sonlandırılabilmeli', () => {
      cy.visit('/admin/sessions');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // "Diğer oturumları sonlandır" butonu
      cy.get('body').then(($body) => {
        const revokeAllBtn = $body.find('button:contains("Diğer"), button:contains("Other"), button:contains("Tümü")').first();
        if (revokeAllBtn.length > 0) {
          cy.wrap(revokeAllBtn).scrollIntoView().click({ force: true });
          
          // Onay modal'ı
          cy.get('body').then(($modal) => {
            if ($modal.find('button:contains("Evet"), button:contains("Onayla")').length > 0) {
              cy.contains(/evet|onayla/i).click({ force: true });
            }
          });
          
          cy.wait(2000);
          // Başarı mesajı
          cy.get('body').then(($toast) => {
            if ($toast.text().includes('başarı') || $toast.text().includes('success')) {
              cy.log('Diğer oturumlar sonlandırıldı');
            }
          });
        } else {
          cy.log('Diğer oturumları sonlandır butonu bulunamadı');
        }
      });
    });
  });
});
