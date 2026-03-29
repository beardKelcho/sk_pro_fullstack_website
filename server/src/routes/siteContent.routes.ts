import express from 'express';
import { siteContentController } from '../controllers';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/zod.middleware';
import { createSiteContentSchema, updateSiteContentSchema } from '../utils/zodSchemas';
const router = express.Router();

/** Admin-only yazma yetkisi kontrolü — sadece ADMIN ve FIRMA_SAHIBI rolleri site içeriği değiştirebilir */

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
  authorize('ADMIN', 'FIRMA_SAHIBI'),
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

// Yeni içerik oluştur — sadece ADMIN ve FIRMA_SAHIBI
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'FIRMA_SAHIBI'),
  validate(createSiteContentSchema),
  siteContentController.createContent
);

// İçerik güncelle — sadece ADMIN ve FIRMA_SAHIBI
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'FIRMA_SAHIBI'),
  validate(updateSiteContentSchema),
  siteContentController.updateContent
);

// Section'a göre içerik güncelle — sadece ADMIN ve FIRMA_SAHIBI
router.put(
  '/section/:section',
  authenticate,
  authorize('ADMIN', 'FIRMA_SAHIBI'),
  siteContentController.updateContentBySection
);

// İçerik sil — sadece ADMIN ve FIRMA_SAHIBI
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'FIRMA_SAHIBI'),
  siteContentController.deleteContent
);

export default router;

