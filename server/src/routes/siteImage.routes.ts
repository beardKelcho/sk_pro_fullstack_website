import express from 'express';
import * as siteImageController from '../controllers/siteImage.controller';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';

const router = express.Router();

// Resmi ID ile serve et (public endpoint - resim gösterimi için)
// BU ROUTE /public'ten ÖNCE olmalı, yoksa /public tüm istekleri yakalar
router.get(
  '/public/:id/image',
  siteImageController.serveImageById
);

// Tüm resimleri listele (public endpoint - anasayfa için)
router.get(
  '/public',
  siteImageController.getAllImages
);

// Tüm resimleri listele (admin için)
router.get(
  '/',
  authenticate,
  requirePermission(Permission.EQUIPMENT_VIEW), // Genel görüntüleme yetkisi
  siteImageController.getAllImages
);

// Tek bir resmi getir
router.get(
  '/:id',
  authenticate,
  requirePermission(Permission.EQUIPMENT_VIEW),
  siteImageController.getImageById
);

// Yeni resim oluştur
router.post(
  '/',
  authenticate,
  requirePermission(Permission.FILE_UPLOAD),
  siteImageController.createImage
);

// Resim güncelle
router.put(
  '/:id',
  authenticate,
  requirePermission(Permission.FILE_UPLOAD),
  siteImageController.updateImage
);

// Resim sil
router.delete(
  '/:id',
  authenticate,
  requirePermission(Permission.FILE_DELETE),
  siteImageController.deleteImage
);

// Toplu resim sil
router.delete(
  '/bulk/delete',
  authenticate,
  requirePermission(Permission.FILE_DELETE),
  siteImageController.deleteMultipleImages
);

// Resim sıralamasını güncelle
router.put(
  '/order/update',
  authenticate,
  requirePermission(Permission.FILE_UPLOAD),
  siteImageController.updateImageOrder
);

export default router;

