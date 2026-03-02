import { Router } from 'express';
import {
    createCase,
    getCases,
    getCaseById,
    processCaseQR,
} from '../controllers/case.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Bütün route'lar login olmayı gerektirir
router.use(authenticate);

router.post('/process-qr', processCaseQR);

router
    .route('/')
    .post(authorize('admin', 'owner', 'manager'), createCase)
    .get(getCases);

router
    .route('/:id')
    .get(getCaseById);

export default router;
