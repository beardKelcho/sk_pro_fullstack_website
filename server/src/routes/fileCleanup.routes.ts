/**
 * File Cleanup Routes
 * Dosya temizleme işlemleri için API endpoint'leri
 */

import express from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import {
  findOrphanedFiles,
  cleanupOrphanedFiles,
  cleanupInactiveFiles,
  checkFileSizes,
} from '../utils/fileCleanup';
import logger from '../utils/logger';

const router = express.Router();

/**
 * Orphaned files'ları listele
 * GET /api/file-cleanup/orphaned
 */
router.get(
  '/orphaned',
  authenticate,
  requirePermission(Permission.FILE_DELETE),
  async (req, res) => {
    try {
      const orphanedFiles = await findOrphanedFiles();
      res.status(200).json({
        success: true,
        count: orphanedFiles.length,
        files: orphanedFiles,
      });
    } catch (error) {
      logger.error('Orphaned files listeleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Orphaned files listelenirken bir hata oluştu',
      });
    }
  }
);

/**
 * Orphaned files'ları temizle
 * POST /api/file-cleanup/orphaned
 * Body: { dryRun: boolean }
 */
router.post(
  '/orphaned',
  authenticate,
  requirePermission(Permission.FILE_DELETE),
  async (req, res) => {
    try {
      const { dryRun = false } = req.body;
      const result = await cleanupOrphanedFiles(dryRun);

      res.status(200).json({
        success: true,
        dryRun,
        ...result,
        message: dryRun
          ? `${result.deleted} dosya silinecek (dry run)`
          : `${result.deleted} dosya silindi`,
      });
    } catch (error) {
      logger.error('Orphaned files temizleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Orphaned files temizlenirken bir hata oluştu',
      });
    }
  }
);

/**
 * Inactive files'ları temizle
 * POST /api/file-cleanup/inactive
 * Body: { daysOld: number }
 */
router.post(
  '/inactive',
  authenticate,
  requirePermission(Permission.FILE_DELETE),
  async (req, res) => {
    try {
      const { daysOld = 90 } = req.body;
      const result = await cleanupInactiveFiles(daysOld);

      res.status(200).json({
        success: true,
        ...result,
        message: `${result.deleted} inactive dosya silindi`,
      });
    } catch (error) {
      logger.error('Inactive files temizleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Inactive files temizlenirken bir hata oluştu',
      });
    }
  }
);

/**
 * Büyük dosyaları kontrol et
 * GET /api/file-cleanup/large-files
 * Query: { maxSizeMB: number }
 */
router.get(
  '/large-files',
  authenticate,
  requirePermission(Permission.FILE_UPLOAD),
  async (req, res) => {
    try {
      const maxSizeMB = parseInt(req.query.maxSizeMB as string) || 50;
      const result = await checkFileSizes(maxSizeMB);

      res.status(200).json({
        success: true,
        count: result.largeFiles.length,
        maxSizeMB,
        files: result.largeFiles.map((file) => ({
          path: file.path,
          size: file.size,
          sizeMB: (file.size / 1024 / 1024).toFixed(2),
        })),
      });
    } catch (error) {
      logger.error('Büyük dosya kontrolü hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Büyük dosyalar kontrol edilirken bir hata oluştu',
      });
    }
  }
);

export default router;

