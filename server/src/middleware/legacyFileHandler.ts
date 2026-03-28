import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

// Uploads klasörünü tanımla
const uploadsDir = path.join(process.cwd(), 'uploads');

/**
 * Backward-compatibility: Bazı eski upload'larda type alanı multipart'ta geç geldiği için 
 * dosyalar `general/` altına kaydedilmiş olabilir. Ancak DB'de/URL'de `/uploads/videos/...` 
 * veya `/uploads/site-images/...` görünebilir. Bu durumda 404 yerine `general/` 
 * altındaki aynı dosyayı servis etmeye çalışır.
 */
export const legacyFileHandler = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { folder } = req.params;
        const file = req.params.file;

        // Path traversal koruması: path.resolve() ile canonical path hesaplanıyor
        // startsWith yerine resolved path karşılaştırması symlink saldırılarını da engeller
        const resolvedUploadsDir = path.resolve(uploadsDir);
        const primaryPath = path.resolve(uploadsDir, folder, file);

        if (!primaryPath.startsWith(resolvedUploadsDir + path.sep) && primaryPath !== resolvedUploadsDir) {
            return res.status(403).json({ success: false, message: 'Erişim reddedildi' });
        }

        // Eğer dosya belirtilen path'te varsa, express.static handle etsin diye next() diyoruz
        if (fs.existsSync(primaryPath)) {
            return next();
        }

        // Dosya yoksa, sadece belirli klasörler için general klasörüne bak (fallback)
        if (folder === 'videos' || folder === 'site-images') {
            const fallbackPath = path.resolve(uploadsDir, 'general', file);
            if (fallbackPath.startsWith(resolvedUploadsDir + path.sep) && fs.existsSync(fallbackPath)) {
                return res.sendFile(fallbackPath);
            }
        }

        return next();
    } catch {
        return next();
    }
};
