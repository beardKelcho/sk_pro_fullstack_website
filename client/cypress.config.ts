import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    // Accessibility testleri için timeout artırıldı
    defaultCommandTimeout: 10000, // 10 saniye (default: 4000ms)
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000, // 30 saniye
    env: {
      // Test kullanıcısı bilgileri (2FA kapalı)
      TEST_USER_EMAIL: 'test@skpro.com.tr',
      TEST_USER_PASSWORD: 'Test123!',
      // Eski admin bilgileri (fallback)
      ADMIN_EMAIL: 'admin@skpro.com.tr',
      ADMIN_PASSWORD: 'Admin123!',
    },
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
  },
}); 