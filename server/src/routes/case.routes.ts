import { Router } from 'express';
import {
    createCase,
    getCases,
    getCaseById,
    processCaseQR,
} from '../controllers/case.controller';
import { authenticate, authorize, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';

const router = Router();

// Bütün route'lar login olmayı gerektirir
router.use(authenticate);

// QR tarama: sadece QR_SCAN yetkisi olan roller (stok düşme + envanter log işlemi)
router.post('/process-qr', requirePermission(Permission.QR_SCAN), processCaseQR);

router
    .route('/')
    .post(authorize('ADMIN', 'FIRMA_SAHIBI', 'PROJE_YONETICISI'), createCase)
    .get(requirePermission(Permission.QR_VIEW), getCases);

router
    .route('/:id')
    .get(requirePermission(Permission.QR_VIEW), getCaseById);

export default router;
