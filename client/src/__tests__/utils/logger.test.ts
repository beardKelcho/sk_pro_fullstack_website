describe('logger', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalEnableClientLogs = process.env.ENABLE_CLIENT_LOGS;

  const loadLogger = () => {
    jest.resetModules();

    let loadedLogger: typeof import('@/utils/logger').default | undefined;
    jest.isolateModules(() => {
      loadedLogger = jest.requireActual('@/utils/logger').default as typeof import('@/utils/logger').default;
    });

    return loadedLogger as typeof import('@/utils/logger').default;
  };

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.ENABLE_CLIENT_LOGS = originalEnableClientLogs;
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('should log info and debug messages outside production', () => {
    process.env.NODE_ENV = 'development';
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    const logger = loadLogger();

    logger.info('Info message', { ok: true });
    logger.debug('Debug message');

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledTimes(1);
  });

  it('should suppress info and warn messages in production', () => {
    process.env.NODE_ENV = 'production';
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const logger = loadLogger();
    infoSpy.mockClear();
    warnSpy.mockClear();

    logger.info('Hidden info');
    logger.warn('Hidden warning');

    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should suppress info and debug messages in test environment by default', () => {
    process.env.NODE_ENV = 'test';
    delete process.env.ENABLE_CLIENT_LOGS;
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    const logger = loadLogger();

    logger.info('Hidden in tests');
    logger.debug('Hidden debug in tests');

    expect(infoSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('should allow verbose client logs in test environment when explicitly enabled', () => {
    process.env.NODE_ENV = 'test';
    process.env.ENABLE_CLIENT_LOGS = 'true';
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    const logger = loadLogger();

    logger.info('Visible test info');
    logger.debug('Visible test debug');

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledTimes(1);
  });

  it('should always log errors', () => {
    process.env.NODE_ENV = 'production';
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const logger = loadLogger();

    logger.error('Visible error', new Error('boom'));

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
