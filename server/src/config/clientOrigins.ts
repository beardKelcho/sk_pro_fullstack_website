const DEFAULT_DEV_CLIENT_ORIGIN = 'http://localhost:3000';

export const getPrimaryClientOrigin = (): string | undefined => {
  const configuredOrigin = process.env.CLIENT_URL?.trim();
  if (configuredOrigin) {
    return configuredOrigin;
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEFAULT_DEV_CLIENT_ORIGIN;
  }

  return undefined;
};

export const getAllowedClientOrigins = (extraOrigins: Array<string | undefined> = []): string[] => {
  const origins = [
    getPrimaryClientOrigin(),
    process.env.CORS_ORIGIN?.trim(),
    'https://skpro.com.tr',
    'https://www.skpro.com.tr',
    'app://.',
    ...extraOrigins,
  ].filter(Boolean) as string[];

  return Array.from(new Set(origins));
};
