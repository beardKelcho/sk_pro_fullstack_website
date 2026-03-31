const DEFAULT_DEV_CLIENT_ORIGIN = 'http://localhost:3000';

const normalizeOrigin = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/\/+$/, '');
};

export const getPrimaryClientOrigin = (): string | undefined => {
  const configuredOrigin = normalizeOrigin(process.env.FRONTEND_URL) || normalizeOrigin(process.env.CLIENT_URL);
  if (configuredOrigin) {
    return configuredOrigin;
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEFAULT_DEV_CLIENT_ORIGIN;
  }

  return undefined;
};

export const requirePrimaryClientOrigin = (context: string): string => {
  const origin = getPrimaryClientOrigin();
  if (origin) {
    return origin;
  }

  throw new Error(`${context} için FRONTEND_URL veya CLIENT_URL tanımlı değil.`);
};

export const buildClientUrl = (pathname: string, context = 'İstemci URL üretimi'): string => {
  const origin = requirePrimaryClientOrigin(context);
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${origin}${normalizedPath}`;
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
