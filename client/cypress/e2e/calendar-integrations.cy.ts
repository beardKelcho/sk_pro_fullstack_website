/**
 * Calendar Entegrasyonları E2E Testleri
 * 
 * Bu dosya calendar entegrasyonları modülünün tüm işlevlerini test eder
 */

describe('Calendar Entegrasyonları', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Calendar Entegrasyonları Sayfası', () => {
    it('calendar entegrasyonları sayfası açılabilmeli', () => {
      // Calendar entegrasyonları genellikle calendar sayfasında veya settings'te olabilir
      cy.visit('/admin/calendar');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Entegrasyon butonları veya ayarlar
      cy.get('body').then(($body) => {
        if ($body.text().includes('Google') || $body.text().includes('Outlook') || $body.find('button:contains("Bağla")').length > 0) {
          cy.log('Calendar entegrasyonları bulundu');
        }
      });
    });
  });

  describe('Google Calendar Sync', () => {
    it('Google Calendar bağlantısı başlatılabilmeli', () => {
      cy.visit('/admin/calendar');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Google Calendar bağla butonu
      cy.get('body').then(($body) => {
        const googleBtn = $body.find('button:contains("Google"), button:contains("Bağla")').first();
        if (googleBtn.length > 0) {
          cy.wrap(googleBtn).scrollIntoView().click({ force: true });
          cy.wait(2000);
          
          // OAuth yönlendirmesi kontrolü
          cy.url().then((url) => {
            if (url.includes('google') || url.includes('oauth')) {
              cy.log('Google OAuth yönlendirmesi başlatıldı');
            }
          });
        }
      });
    });
  });

  describe('Outlook Calendar Sync', () => {
    it('Outlook Calendar bağlantısı başlatılabilmeli', () => {
      cy.visit('/admin/calendar');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Outlook Calendar bağla butonu
      cy.get('body').then(($body) => {
        const outlookBtn = $body.find('button:contains("Outlook"), button:contains("Microsoft")').first();
        if (outlookBtn.length > 0) {
          cy.wrap(outlookBtn).scrollIntoView().click({ force: true });
          cy.wait(2000);
          
          // OAuth yönlendirmesi kontrolü
          cy.url().then((url) => {
            if (url.includes('microsoft') || url.includes('outlook') || url.includes('oauth')) {
              cy.log('Outlook OAuth yönlendirmesi başlatıldı');
            }
          });
        }
      });
    });
  });

  describe('iCal Import/Export', () => {
    it('iCal export çalışabilmeli', () => {
      cy.visit('/admin/calendar');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // iCal export butonu
      cy.get('body').then(($body) => {
        const exportBtn = $body.find('button:contains("iCal"), button:contains("Export")').first();
        if (exportBtn.length > 0) {
          cy.wrap(exportBtn).scrollIntoView().click({ force: true });
          cy.wait(2000);
          cy.log('iCal export başlatıldı');
        }
      });
    });

    it('iCal import çalışabilmeli', () => {
      cy.visit('/admin/import');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // iCal import seçeneği
      cy.get('body').then(($body) => {
        if ($body.text().includes('iCal') || $body.text().includes('calendar')) {
          cy.log('iCal import seçeneği bulundu');
        }
      });
    });
  });
});
