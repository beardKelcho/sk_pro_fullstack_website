import express from 'express';
import {
    getAllServices,
    getAllServicesAdmin,
    getServiceById,
    createService,
    updateService,
    deleteService,
    reorderServices,
} from '../controllers/services.controller';
import { Role } from "../config/permissions";
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/admin/all', authenticate, authorize(Role.ADMIN, Role.FIRMA_SAHIBI), getAllServicesAdmin);
router.get('/:id', getServiceById);

// Admin routes (protected)
router.post('/', authenticate, authorize(Role.ADMIN, Role.FIRMA_SAHIBI), createService);
router.put('/reorder', authenticate, authorize(Role.ADMIN, Role.FIRMA_SAHIBI), reorderServices);
router.put('/:id', authenticate, authorize(Role.ADMIN, Role.FIRMA_SAHIBI), updateService);
router.delete('/:id', authenticate, authorize(Role.ADMIN, Role.FIRMA_SAHIBI), deleteService);

export default router;
