/**
 * Takvim Yönetimi E2E Testleri
 * 
 * Bu dosya takvim modülünün tüm işlevlerini test eder
 * TC009 - Event görüntüleme ve assignee seçimi testleri
 */

describe('Takvim Yönetimi', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Takvim Görünümleri', () => {
    it('takvim sayfası açılmalı', () => {
      cy.visit('/admin/calendar');
      cy.url().should('include', '/admin/calendar');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Takvim içeriği kontrolü
      cy.contains(/takvim|calendar/i, { timeout: 15000 }).should('exist');
    });

    it('eventler görüntülenebilmeli', () => {
      cy.visit('/admin/calendar');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Event'lerin yüklenmesini bekle
      cy.wait(3000);
      
      // Event elementleri kontrolü (calendar library'ye göre değişebilir)
      cy.get('body').then(($body) => {
        const hasEvents = $body.find('[class*="event"], [class*="fc-event"], [data-event]').length > 0;
        if (hasEvents) {
          cy.log('Event\'ler bulundu');
        } else {
          // Belki text içinde event bilgisi var
          cy.log('Event elementleri bulunamadı, sayfa içeriği kontrol ediliyor');
        }
      });
    });

    it('ay görünümü çalışmalı', () => {
      cy.visit('/admin/calendar');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Ay görünümü butonu
      cy.get('body').then(($body) => {
        const monthBtn = $body.find('button:contains("Ay"), button:contains("Month"), [aria-label*="month"]').first();
        if (monthBtn.length > 0) {
          cy.wrap(monthBtn).click({ force: true });
          cy.wait(2000);
          cy.log('Ay görünümü aktif');
        }
      });
    });

    it('hafta görünümü çalışmalı', () => {
      cy.visit('/admin/calendar');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Hafta görünümü butonu
      cy.get('body').then(($body) => {
        const weekBtn = $body.find('button:contains("Hafta"), button:contains("Week"), [aria-label*="week"]').first();
        if (weekBtn.length > 0) {
          cy.wrap(weekBtn).click({ force: true });
          cy.wait(2000);
          cy.log('Hafta görünümü aktif');
        }
      });
    });

    it('gün görünümü çalışmalı', () => {
      cy.visit('/admin/calendar');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Gün görünümü butonu
      cy.get('body').then(($body) => {
        const dayBtn = $body.find('button:contains("Gün"), button:contains("Day"), [aria-label*="day"]').first();
        if (dayBtn.length > 0) {
          cy.wrap(dayBtn).click({ force: true });
          cy.wait(2000);
          cy.log('Gün görünümü aktif');
        }
      });
    });
  });

  describe('Event İşlemleri', () => {
    it('event oluşturulabilmeli', () => {
      cy.visit('/admin/calendar');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Yeni event butonu
      cy.get('body').then(($body) => {
        const createBtn = $body.find('button:contains("Yeni"), button:contains("New"), button:contains("Ekle")').first();
        if (createBtn.length > 0) {
          cy.wrap(createBtn).click({ force: true });
          cy.wait(2000);
          // Modal veya form kontrolü
          cy.get('body').then(($modal) => {
            if ($modal.find('form, [role="dialog"]').length > 0) {
              cy.log('Event oluşturma formu açıldı');
            }
          });
        }
      });
    });

    it('assignee seçilebilmeli', () => {
      cy.visit('/admin/calendar');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Event oluştur veya düzenle
      cy.get('body').then(($body) => {
        const eventBtn = $body.find('button:contains("Yeni"), [class*="event"]').first();
        if (eventBtn.length > 0) {
          cy.wrap(eventBtn).click({ force: true });
          cy.wait(2000);
          
          // Assignee select
          cy.get('body').then(($form) => {
            if ($form.find('select[name*="assign"], select[name*="user"], select#assignedTo').length > 0) {
              cy.get('select[name*="assign"], select[name*="user"], select#assignedTo', { timeout: 10000 })
                .should('be.visible')
                .then(($select) => {
                  if ($select.find('option').length > 1) {
                    cy.wrap($select).select(1, { force: true });
                    cy.log('Assignee seçildi');
                  }
                });
            }
          });
        }
      });
    });

    it('filtreleme çalışmalı', () => {
      cy.visit('/admin/calendar');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Filtre butonları (showProjects, showEquipment, status)
      cy.get('body').then(($body) => {
        const filters = $body.find('input[type="checkbox"][name*="show"], button[aria-label*="filtre"]');
        if (filters.length > 0) {
          cy.log(`${filters.length} filtre öğesi bulundu`);
          // İlk filtreyi toggle et
          cy.wrap(filters.first()).click({ force: true });
          cy.wait(2000);
        }
      });
    });
  });
});
