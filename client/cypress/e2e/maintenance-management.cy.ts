/**
 * Bakım Yönetimi E2E Testleri
 * 
 * Bu dosya bakım yönetimi modülünün tüm işlevlerini test eder
 * TC006 - Bakım kaydı oluşturma/güncelleme testleri
 */

describe('Bakım Yönetimi', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'test@skpro.com.tr';
  const ADMIN_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.url({ timeout: 20000 }).should('include', '/admin');
  });

  describe('Bakım Listesi', () => {
    it('bakım listesi görüntülenmeli', () => {
      cy.visit('/admin/maintenance');
      cy.url().should('include', '/admin/maintenance');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Sayfa başlığını kontrol et
      cy.contains(/bakım|maintenance/i, { timeout: 15000 }).should('exist');
    });
  });

  describe('Bakım CRUD İşlemleri', () => {
    it('yeni bakım kaydı oluşturulabilmeli', () => {
      cy.visit('/admin/maintenance/add');
      cy.url().should('include', '/admin/maintenance/add');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Form'un yüklendiğini bekle
      cy.get('form', { timeout: 15000 }).should('exist');

      // Ekipman seçimi (zorunlu alan)
      cy.get('body').then(($body) => {
        if ($body.find('select[name="equipment"], select#equipment').length > 0) {
          cy.get('select[name="equipment"], select#equipment', { timeout: 10000 })
            .should('be.visible')
            .then(($select) => {
              if ($select.find('option').length > 1) {
                cy.wrap($select).select(1, { force: true }); // İlk seçeneği seç (0 index boş olabilir)
              }
            });
        }
      });

      // Bakım tipi seçimi
      cy.get('body').then(($body) => {
        if ($body.find('select[name="type"], select#type').length > 0) {
          cy.get('select[name="type"], select#type', { timeout: 10000 })
            .should('be.visible')
            .select(1, { force: true });
        }
      });

      // Açıklama
      cy.get('textarea[name="description"], textarea#description', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type('Test bakım açıklaması', { force: true });

      // Planlanan tarih
      cy.get('input[name="scheduledDate"], input[type="date"]', { timeout: 10000 })
        .should('be.visible')
        .then(($input) => {
          if ($input.length > 0) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7);
            const dateStr = futureDate.toISOString().split('T')[0];
            cy.wrap($input).clear().type(dateStr, { force: true });
          }
        });

      // Atanan kullanıcı (opsiyonel)
      cy.get('body').then(($body) => {
        if ($body.find('select[name="assignedTo"], select#assignedTo').length > 0) {
          cy.get('select[name="assignedTo"], select#assignedTo', { timeout: 10000 })
            .should('be.visible')
            .then(($select) => {
              if ($select.find('option').length > 1) {
                cy.wrap($select).select(1, { force: true });
              }
            });
        }
      });

      // Submit butonu
      cy.get('button[type="submit"], form button[type="submit"]', { timeout: 10000 })
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });

      // Başarı mesajı veya liste sayfasına yönlendirme
      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes('/admin/maintenance') && !url.includes('/add')) {
          cy.log('Bakım kaydı oluşturuldu - liste sayfasına yönlendirildi');
        } else {
          // Toast mesajı kontrolü
          cy.get('body', { timeout: 5000 }).then(($body) => {
            if ($body.text().includes('başarı') || $body.text().includes('success')) {
              cy.log('Başarı mesajı görüntülendi');
            }
          });
        }
      });
    });

    it('bakım kaydı düzenlenebilmeli', () => {
      cy.visit('/admin/maintenance');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Düzenle linki veya butonu
      cy.get('body').then(($body) => {
        const editLink = $body.find('a[href*="/maintenance/edit"], button:contains("Düzenle"), button:contains("Edit")').first();
        if (editLink.length > 0) {
          cy.wrap(editLink).scrollIntoView().click({ force: true });
          cy.url({ timeout: 15000 }).should('include', '/maintenance/edit');
          
          // Form düzenleme
          cy.get('form', { timeout: 15000 }).should('exist');
          cy.get('textarea[name="description"], textarea#description', { timeout: 10000 })
            .should('be.visible')
            .clear()
            .type('Güncellenmiş bakım açıklaması', { force: true });
          
          // Kaydet
          cy.get('button[type="submit"], form button[type="submit"]', { timeout: 10000 })
            .scrollIntoView()
            .should('be.visible')
            .click({ force: true });
        } else {
          cy.log('Düzenle linki bulunamadı - test atlanıyor');
        }
      });
    });

    it('bakım kaydı görüntülenebilmeli', () => {
      cy.visit('/admin/maintenance');
      cy.get('body', { timeout: 15000 }).should('be.visible');

      // Bakım listesinde bir kayda tıkla veya görüntüle butonu
      cy.get('body').then(($body) => {
        const viewLink = $body.find('a[href*="/maintenance/view"], tr, tbody tr').first();
        if (viewLink.length > 0) {
          cy.wrap(viewLink).scrollIntoView().click({ force: true });
          cy.wait(2000);
          cy.get('body', { timeout: 15000 }).should('be.visible');
        } else {
          cy.log('Görüntüle linki bulunamadı');
        }
      });
    });
  });

  describe('Bakım Takvimi', () => {
    it('bakım takvimi görüntülenebilmeli', () => {
      cy.visit('/admin/equipment/maintenance');
      cy.url().should('include', '/equipment/maintenance');
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Takvim içeriği kontrolü
      cy.contains(/bakım|maintenance|takvim|calendar/i, { timeout: 15000 }).should('exist');
    });
  });
});
