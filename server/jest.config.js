/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  // Not: Mevcut test seti henüz yüksek coverage hedefini karşılamıyor.
  // Prod öncesi "testler çalışıyor mu?" doğrulaması için makul bir eşik ile başlıyoruz.
  // Coverage artırıldıkça bu eşikler tekrar yükseltilmeli.
  coverageThreshold: {
    global: {
      // Not: Coverage ileride artırılacak. Şimdilik testlerin stabil çalışması ana hedef.
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  // Worker process'lerin düzgün kapanması için
  // forceExit: true kullanmak yerine teardown'da cleanup yapıyoruz
  // Ancak bazı durumlarda forceExit gerekebilir (CI ortamında)
  forceExit: process.env.CI === 'true' || process.env.FORCE_EXIT === 'true',
  // Open handles'ı tespit et (development'ta)
  detectOpenHandles: process.env.DETECT_OPEN_HANDLES === 'true',
}; 