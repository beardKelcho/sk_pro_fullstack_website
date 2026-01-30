import express from 'express';
import {
    getShowcaseProjects,
    getShowcaseProjectById,
    createShowcaseProject,
    updateShowcaseProject,
    deleteShowcaseProject,
    reorderProjects,
} from '../controllers/showcaseProjects.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getShowcaseProjects);
router.get('/:id', getShowcaseProjectById);

// Admin routes (protected)
router.post('/', authenticate, authorize('admin'), createShowcaseProject);
router.put('/reorder', authenticate, authorize('admin'), reorderProjects);
router.put('/:id', authenticate, authorize('admin'), updateShowcaseProject);
router.delete('/:id', authenticate, authorize('admin'), deleteShowcaseProject);

export default router;
