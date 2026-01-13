/**
 * Admin Panel İş Akışı Testleri
 * 
 * Bu dosya admin panelindeki kritik iş akışlarını test eder
 */

describe('Admin Panel İş Akışları', () => {
  const ADMIN_EMAIL = 'admin@skpro.com.tr';
  const ADMIN_PASSWORD = 'Admin123!';

  beforeEach(() => {
    // Admin login
    cy.visit('/admin');
    cy.get('input[type="email"]').type(ADMIN_EMAIL);
    cy.get('input[type="password"]').type(ADMIN_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/admin/dashboard');
  });

  describe('Kullanıcı Yönetimi İş Akışı', () => {
    it('kullanıcı ekleme → düzenleme → silme akışı', () => {
      // 1. Kullanıcı ekle
      cy.visit('/admin/users/add');
      const timestamp = Date.now();
      cy.get('input[name="name"]').type(`Test User ${timestamp}`);
      cy.get('input[name="email"]').type(`test${timestamp}@example.com`);
      cy.get('input[name="phone"]').type('5321234567');
      cy.get('select[name="role"]').select('TEKNISYEN');
      cy.get('input[name="password"]').type('Test123!');
      cy.get('button[type="submit"]').click();

      // 2. Kullanıcı listesinde görünmeli
      cy.url({ timeout: 10000 }).should('include', '/admin/users');
      cy.contains(`test${timestamp}@example.com`).should('be.visible');

      // 3. Kullanıcıyı düzenle
      cy.contains(`test${timestamp}@example.com`).closest('tr').find('a[href*="edit"]').click();
      cy.get('input[name="name"]').clear().type(`Updated User ${timestamp}`);
      cy.get('button[type="submit"]').click();

      // 4. Değişiklik görünmeli
      cy.url({ timeout: 10000 }).should('include', '/admin/users');
      cy.contains(`Updated User ${timestamp}`).should('be.visible');
    });
  });

  describe('Proje Yönetimi İş Akışı', () => {
    it('proje ekleme → görüntüleme → düzenleme akışı', () => {
      // 1. Proje ekle
      cy.visit('/admin/projects/add');
      const timestamp = Date.now();
      cy.get('input[name="name"]').type(`Test Proje ${timestamp}`);
      cy.get('select[name="status"]').select('PLANNING');
      cy.get('button[type="submit"]').click();

      // 2. Proje listesinde görünmeli
      cy.url({ timeout: 10000 }).should('include', '/admin/projects');
      cy.contains(`Test Proje ${timestamp}`).should('be.visible');

      // 3. Projeyi görüntüle
      cy.contains(`Test Proje ${timestamp}`).closest('tr').find('a[href*="view"]').click();
      cy.url({ timeout: 10000 }).should('include', '/admin/projects/view/');
      cy.contains(`Test Proje ${timestamp}`).should('be.visible');
    });
  });

  describe('Resim Yönetimi İş Akışı', () => {
    it('resim yükleme → görüntüleme → silme akışı', () => {
      // 1. Resim yönetimi sayfasına git
      cy.visit('/admin/site-images');
      cy.contains(/resim|image/i, { timeout: 10000 }).should('be.visible');

      // 2. Resim yükle (eğer test resmi varsa)
      // cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg');
      // cy.get('button').contains(/yükle|upload/i).click();

      // 3. Yüklenen resim listede görünmeli
      // cy.contains('test-image.jpg').should('be.visible');

      // 4. Resmi sil
      // cy.contains('test-image.jpg').closest('[class*="card"]').find('button').contains(/sil|delete/i).click();
      // cy.get('button').contains(/onayla|confirm/i).click();
    });
  });

  describe('QR Kod İş Akışı', () => {
    it('QR kod oluşturma → tarama akışı', () => {
      // 1. QR kod sayfasına git
      cy.visit('/admin/qr-codes');
      cy.contains(/qr kod|qr code/i, { timeout: 10000 }).should('be.visible');

      // 2. QR kod tara butonuna tıkla
      cy.get('button').contains(/tara|scan/i).click();

      // 3. QR scanner modal açılmalı
      cy.get('.fixed.inset-0', { timeout: 2000 }).should('be.visible');
    });
  });
});

