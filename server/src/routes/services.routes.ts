import express from 'express';
import {
    getAllServices,
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
router.get('/:id', getServiceById);

// Admin routes (protected)
router.post('/', authenticate, authorize(Role.ADMIN), createService);
router.put('/reorder', authenticate, authorize(Role.ADMIN), reorderServices);
router.put('/:id', authenticate, authorize(Role.ADMIN), updateService);
router.delete('/:id', authenticate, authorize(Role.ADMIN), deleteService);

export default router;
