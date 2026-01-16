import { Request, Response, NextFunction } from 'express';

const parseAcceptVersion = (acceptHeader: string | undefined) => {
  if (!acceptHeader) return null;
  // ör: application/vnd.skpro.v1+json
  const m = acceptHeader.match(/application\/vnd\.skpro\.v(\d+)\+json/i);
  return m ? m[1] : null;
};

export const apiVersioning = (req: Request, res: Response, next: NextFunction) => {
  const headerVersionRaw = req.header('x-api-version');
  const acceptVersion = parseAcceptVersion(req.header('accept'));
  const version = (headerVersionRaw || acceptVersion || '1').trim();

  // Şimdilik sadece v1 destekliyoruz
  if (version !== '1') {
    return res.status(400).json({
      success: false,
      message: `Desteklenmeyen API versiyonu: v${version}`,
      supported: ['1'],
    });
  }

  res.setHeader('X-API-Version', version);

  // Deprecation warnings (opsiyonel)
  if (process.env.API_V1_DEPRECATED === 'true') {
    res.setHeader('Deprecation', 'true');
    if (process.env.API_V1_SUNSET) {
      res.setHeader('Sunset', process.env.API_V1_SUNSET);
    }
  }

  (req as any).apiVersion = version;
  next();
};

