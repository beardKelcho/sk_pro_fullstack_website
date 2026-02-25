import express from 'express';
import {
    getShowcaseProjects,
    getShowcaseProjectById,
    createShowcaseProject,
    updateShowcaseProject,
    deleteShowcaseProject,
    reorderProjects,
} from '../controllers/showcaseProjects.controller';
import { Role } from "../config/permissions";
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getShowcaseProjects);
router.get('/:id', getShowcaseProjectById);

// Admin routes (protected)
router.post('/', authenticate, authorize(Role.ADMIN), createShowcaseProject);
router.put('/reorder', authenticate, authorize(Role.ADMIN), reorderProjects);
router.put('/:id', authenticate, authorize(Role.ADMIN), updateShowcaseProject);
router.delete('/:id', authenticate, authorize(Role.ADMIN), deleteShowcaseProject);

export default router;
