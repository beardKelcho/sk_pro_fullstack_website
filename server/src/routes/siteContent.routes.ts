import express from 'express';
import { siteContentController } from '../controllers';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';

const router = express.Router();

// Tüm içerikleri listele (public endpoint - anasayfa için)
router.get(
  '/public',
  siteContentController.getAllContents
);

// Section'a göre içerik getir (public)
router.get(
  '/public/:section',
  siteContentController.getContentBySection
);

// Tüm içerikleri listele (admin için)
router.get(
  '/',
  authenticate,
  requirePermission(Permission.EQUIPMENT_VIEW),
  siteContentController.getAllContents
);

// Section'a göre içerik getir (public)
router.get(
  '/section/:section',
  siteContentController.getContentBySection
);

// Tek bir içeriği getir (public)
router.get(
  '/:id',
  siteContentController.getContentBySection
);

// Yeni içerik oluştur
router.post(
  '/',
  authenticate,
  requirePermission(Permission.FILE_UPLOAD),
  siteContentController.createContent
);

// İçerik güncelle
router.put(
  '/:id',
  authenticate,
  requirePermission(Permission.FILE_UPLOAD),
  siteContentController.updateContent
);

// Section'a göre içerik güncelle
router.put(
  '/section/:section',
  authenticate,
  requirePermission(Permission.FILE_UPLOAD),
  siteContentController.updateContentBySection
);

// İçerik sil
router.delete(
  '/:id',
  authenticate,
  requirePermission(Permission.FILE_DELETE),
  siteContentController.deleteContent
);

export default router;

