import { execFileSync } from 'child_process';
import path from 'path';
import { defineConfig } from 'cypress';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

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
    setupNodeEvents(on, config) {
      on('before:run', () => {
        if (config.env.SKIP_TEST_USER_SEED) {
          // eslint-disable-next-line no-console
          console.log('[cypress] Skipping test user seed because SKIP_TEST_USER_SEED is enabled.');
          return;
        }

        const serverDir = path.resolve(__dirname, '../server');
        const testUserEmail = config.env.TEST_USER_EMAIL || 'test@skpro.com.tr';
        const testUserPassword = config.env.TEST_USER_PASSWORD || 'Test123!';

        // eslint-disable-next-line no-console
        console.log(`[cypress] Ensuring E2E test user exists: ${testUserEmail}`);

        execFileSync(npmCommand, ['run', 'create:test-user'], {
          cwd: serverDir,
          stdio: 'inherit',
          env: {
            ...process.env,
            TEST_USER_EMAIL: testUserEmail,
            TEST_USER_PASSWORD: testUserPassword,
          },
        });
      });

      return config;
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
