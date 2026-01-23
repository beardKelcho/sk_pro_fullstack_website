import { Request, Response } from 'express';
import uploadService from '../services/upload.service';
import logger from '../utils/logger';

export class UploadController {

    /**
     * Dosya listeleme handler
     */
    async list(req: Request, res: Response) {
        try {
            const { type, page = '1', limit = '50', search = '' } = req.query;
            const result = await uploadService.listFiles(
                type as string,
                parseInt(page as string, 10),
                parseInt(limit as string, 10),
                search as string
            );

            res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error) {
            logger.error('Dosya listesi hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Dosya listesi alınırken bir hata oluştu',
            });
        }
    }

    /**
     * Tek dosya yükleme handler
     */
    async uploadSingle(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Dosya yüklenmedi',
                });
            }

            const fileType = (req.body.type || req.query.type || 'general') as string;
            const result = await uploadService.uploadFile(req.file, fileType, req.user?.id);

            res.status(200).json({
                success: true,
                file: result,
            });
        } catch (error) {
            logger.error('Dosya yükleme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Dosya yüklenirken bir hata oluştu',
            });
        }
    }

    /**
     * Çoklu dosya yükleme handler
     */
    async uploadMultiple(req: Request, res: Response) {
        try {
            if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dosya yüklenmedi',
                });
            }

            const fileType = (req.body.type || req.query.type || 'general') as string;
            const files = await Promise.all(
                (req.files as Express.Multer.File[]).map((file) =>
                    uploadService.uploadFile(file, fileType, req.user?.id)
                )
            );

            logger.info(`${files.length} dosya yüklendi by user ${req.user?.id}`);

            res.status(200).json({
                success: true,
                files,
            });
        } catch (error) {
            logger.error('Dosya yükleme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Dosya yüklenirken bir hata oluştu',
            });
        }
    }

    /**
     * Dosya silme handler
     */
    async deleteFile(req: Request, res: Response) {
        try {
            const { filename } = req.params;
            const fileType = (req.query.type as string) || 'general';

            await uploadService.deleteFile(filename, fileType, req.user?.id);

            res.status(200).json({
                success: true,
                message: 'Dosya başarıyla silindi',
            });
        } catch (error: any) {
            logger.error('Dosya silme hatası:', error);

            if (error.message === 'File not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Dosya bulunamadı',
                });
            }

            res.status(500).json({
                success: false,
                message: 'Dosya silinirken bir hata oluştu',
            });
        }
    }
}

export default new UploadController();
