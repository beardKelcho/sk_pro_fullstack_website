import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createStorage } from '../config/storage';

// Upload klasörünü oluştur (local storage için)
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine oluştur (local/cloudinary/s3)
const storage = createStorage();

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // İzin verilen dosya tipleri
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|zip|rar|mp4|webm|mov|avi|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/');

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Geçersiz dosya tipi. Sadece resim, video ve belge yüklenebilir.'));
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },
    fileFilter,
});
