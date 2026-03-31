describe('clientOrigins config', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalFrontendUrl = process.env.FRONTEND_URL;
  const originalClientUrl = process.env.CLIENT_URL;
  const originalCorsOrigin = process.env.CORS_ORIGIN;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.FRONTEND_URL = originalFrontendUrl;
    process.env.CLIENT_URL = originalClientUrl;
    process.env.CORS_ORIGIN = originalCorsOrigin;
    jest.resetModules();
  });

  it('production ortaminda localhost fallback eklemez', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.CLIENT_URL;
    delete process.env.CORS_ORIGIN;

    const { getAllowedClientOrigins, getPrimaryClientOrigin } = await import('../../config/clientOrigins');

    expect(getPrimaryClientOrigin()).toBeUndefined();
    expect(getAllowedClientOrigins()).not.toContain('http://localhost:3000');
    expect(getAllowedClientOrigins()).toContain('https://skpro.com.tr');
  });

  it('development ortaminda localhost fallback kullanir', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.FRONTEND_URL;
    delete process.env.CLIENT_URL;
    process.env.CORS_ORIGIN = 'https://preview.example.com';

    const { getAllowedClientOrigins, getPrimaryClientOrigin } = await import('../../config/clientOrigins');

    expect(getPrimaryClientOrigin()).toBe('http://localhost:3000');
    expect(getAllowedClientOrigins()).toEqual(
      expect.arrayContaining(['http://localhost:3000', 'https://preview.example.com'])
    );
  });

  it('FRONTEND_URL varsa CLIENT_URL yerine onu tercih eder', async () => {
    process.env.NODE_ENV = 'production';
    process.env.FRONTEND_URL = 'https://panel.example.com/';
    process.env.CLIENT_URL = 'https://legacy.example.com/';

    const { buildClientUrl, getPrimaryClientOrigin } = await import('../../config/clientOrigins');

    expect(getPrimaryClientOrigin()).toBe('https://panel.example.com');
    expect(buildClientUrl('/admin/login')).toBe('https://panel.example.com/admin/login');
  });

  it('production ortaminda origin yoksa URL helper hata firlatir', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.FRONTEND_URL;
    delete process.env.CLIENT_URL;

    const { buildClientUrl } = await import('../../config/clientOrigins');

    expect(() => buildClientUrl('/admin/login', 'Test helper')).toThrow(
      'Test helper için FRONTEND_URL veya CLIENT_URL tanımlı değil.'
    );
  });
});
