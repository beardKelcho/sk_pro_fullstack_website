import express from 'express';
import {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    reorderServices,
} from '../controllers/services.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Admin routes (protected)
router.post('/', authenticate, authorize('admin'), createService);
router.put('/reorder', authenticate, authorize('admin'), reorderServices);
router.put('/:id', authenticate, authorize('admin'), updateService);
router.delete('/:id', authenticate, authorize('admin'), deleteService);

export default router;
