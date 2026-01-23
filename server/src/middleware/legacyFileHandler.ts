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

        // basic traversal guard
        const safeFile = path.normalize(file).replace(/^(\.\.(\/|\\|$))+/, '');
        const primaryPath = path.join(uploadsDir, folder, safeFile);

        // Eğer dosya belirtilen path'te varsa, express.static handle etsin diye next() diyoruz
        if (primaryPath.startsWith(uploadsDir) && fs.existsSync(primaryPath)) {
            return next();
        }

        // Dosya yoksa, sadece belirli klasörler için general klasörüne bak (fallback)
        if (folder === 'videos' || folder === 'site-images') {
            const fallbackPath = path.join(uploadsDir, 'general', safeFile);
            if (fallbackPath.startsWith(uploadsDir) && fs.existsSync(fallbackPath)) {
                return res.sendFile(fallbackPath);
            }
        }

        return next();
    } catch {
        return next();
    }
};
