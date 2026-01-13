import express from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import * as qrCodeController from '../controllers/qrCode.controller';

const router = express.Router();

// Tüm QR kodları listele
router.get(
  '/',
  authenticate,
  requirePermission(Permission.QR_VIEW),
  qrCodeController.getAllQRCodes
);

// QR kod oluştur
router.post(
  '/',
  authenticate,
  requirePermission(Permission.QR_CREATE),
  qrCodeController.createQRCode
);

// QR kod tarama (public endpoint - authenticated users)
router.post(
  '/scan',
  authenticate,
  requirePermission(Permission.QR_SCAN),
  qrCodeController.scanQRCode
);

// QR kod detayı
router.get(
  '/:id',
  authenticate,
  requirePermission(Permission.QR_VIEW),
  qrCodeController.getQRCodeById
);

// QR kod güncelle
router.put(
  '/:id',
  authenticate,
  requirePermission(Permission.QR_UPDATE),
  qrCodeController.updateQRCode
);

// QR kod sil
router.delete(
  '/:id',
  authenticate,
  requirePermission(Permission.QR_DELETE),
  qrCodeController.deleteQRCode
);

// QR kod görseli yeniden oluştur
router.post(
  '/:id/regenerate-image',
  authenticate,
  requirePermission(Permission.QR_VIEW),
  qrCodeController.regenerateQRImage
);

export default router;

