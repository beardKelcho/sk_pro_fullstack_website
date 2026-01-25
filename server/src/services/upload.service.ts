import path from 'path';
import fs from 'fs';
import { normalizePath, pathToUrl } from '../utils/pathNormalizer';
import { checkAndOptimizeImage } from '../utils/imageOptimizer';
import { isCloudStorage } from '../config/storage';
import { uploadToCloudinary, deleteFromCloudinary } from './cloudinaryService';
import { uploadToS3, deleteFromS3 } from './s3Service';
import logger from '../utils/logger';

// Upload klasörünü tanımla
const uploadDir = path.join(process.cwd(), 'uploads');

export interface FileInfo {
    filename: string;
    path: string;
    size: number;
    uploadedAt: Date;
    modifiedAt: Date;
    type: 'image' | 'video' | 'document';
    url: string;
    mimetype: string;
}

export interface PaginatedFiles {
    files: FileInfo[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UploadResult {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    url: string;
    path: string;
}

// MIME type helper
const getMimeType = (ext: string): string => {
    const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mov': 'video/quicktime',
        '.avi': 'video/x-msvideo',
    };
    return mimeTypes[ext] || 'application/octet-stream';
};

export class UploadService {
    /**
     * Tüm dosyaları listele
     */
    async listFiles(type: string = 'all', page: number = 1, limit: number = 50, search: string = '') {
        const fileType = type || 'all';
        const searchTerm = search.toLowerCase();

        if (isCloudStorage()) {
            // Cloud storage için şimdilik boş array döndür
            return {
                files: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        }

        // Local storage için dosya listesi
        const files: FileInfo[] = [];
        const typeDir = fileType === 'all' ? uploadDir : path.join(uploadDir, fileType);

        if (fs.existsSync(typeDir)) {
            this.scanDirectory(typeDir, fileType === 'all' ? '' : fileType, files, searchTerm);
        }

        // Sıralama: en yeni önce
        files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

        // Sayfalama
        const total = files.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const paginatedFiles = files.slice(startIndex, startIndex + limit);

        return {
            files: paginatedFiles,
            total,
            page,
            limit,
            totalPages,
        };
    }

    /**
     * Recursive directory scanning
     */
    private scanDirectory(dir: string, basePath: string, files: FileInfo[], searchTerm: string) {
        if (!fs.existsSync(dir)) return;

        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            const relativePath = basePath ? `${basePath}/${item.name}` : item.name;

            if (item.isDirectory()) {
                this.scanDirectory(fullPath, relativePath, files, searchTerm);
            } else {
                // Search filtresi
                if (searchTerm && !item.name.toLowerCase().includes(searchTerm)) {
                    continue;
                }

                const stats = fs.statSync(fullPath);
                const ext = path.extname(item.name).toLowerCase();
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(ext);
                const isVideo = /\.(mp4|webm|mov|avi)$/i.test(ext);

                files.push({
                    filename: item.name,
                    path: relativePath,
                    size: stats.size,
                    uploadedAt: stats.birthtime,
                    modifiedAt: stats.mtime,
                    type: isImage ? 'image' : isVideo ? 'video' : 'document',
                    url: pathToUrl(relativePath),
                    mimetype: getMimeType(ext),
                });
            }
        }
    }

    /**
     * Tek dosya yükle
     */
    async uploadFile(file: Express.Multer.File, type: string = 'general', userId?: string) {
        let fileUrl: string;
        let filePath: string;
        let filename: string;

        // Cloud storage kullanılıyorsa
        if (isCloudStorage() && file.buffer) {
            const storageType = process.env.STORAGE_TYPE?.toLowerCase();

            if (storageType === 'cloudinary') {
                // Cloudinary'ye upload
                const result = await uploadToCloudinary(file.buffer, file.originalname, {
                    folder: type,
                    resource_type: 'auto',
                });

                fileUrl = result.secure_url || '';
                filePath = result.public_id || '';
                filename = (result.public_id ? result.public_id.split('/').pop() : file.originalname) || file.originalname;
            } else if (storageType === 's3') {
                // S3'e upload
                const result = await uploadToS3(file.buffer, file.originalname, {
                    folder: type,
                    contentType: file.mimetype,
                });

                fileUrl = result.url;
                filePath = result.key;
                filename = result.key.split('/').pop() || file.originalname;
            } else {
                throw new Error('Unknown storage type');
            }
        } else {
            // Local storage
            const normalizedPath = normalizePath(`${type}/${file.filename}`, type);
            fileUrl = pathToUrl(normalizedPath);
            filePath = normalizedPath;
            filename = file.filename;

            // Resim dosyası ise optimize et (async, background'da)
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.filename);
            if (isImage) {
                const fullPath = path.join(uploadDir, normalizedPath);
                checkAndOptimizeImage(fullPath).catch((error) => {
                    logger.error(`Resim optimizasyonu hatası (background): ${file.filename}`, error);
                });
            }
        }

        logger.info(`Dosya yüklendi: ${filename} (${(file.size / 1024 / 1024).toFixed(2)}MB) by user ${userId}`);

        return {
            filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: fileUrl,
            path: filePath,
        };
    }

    /**
     * Dosya sil
     */
    async deleteFile(filename: string, type: string = 'general', userId?: string) {
        if (isCloudStorage()) {
            const storageType = process.env.STORAGE_TYPE?.toLowerCase();

            if (storageType === 'cloudinary') {
                const publicId = `${type}/${filename}`;
                const ext = filename.split('.').pop()?.toLowerCase();
                const resourceType = ext && ['mp4', 'webm', 'mov', 'avi'].includes(ext) ? 'video' : 'image';
                await deleteFromCloudinary(publicId, resourceType);
            } else if (storageType === 's3') {
                const key = `${type}/${filename}`;
                await deleteFromS3(key);
            }
        } else {
            const filePath = path.join(uploadDir, type, filename);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                logger.info(`Dosya silindi: ${filename} by user ${userId}`);
            } else {
                throw new Error('File not found');
            }
        }
    }
}

export default new UploadService();
