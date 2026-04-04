import express from 'express';
import {
    getShowcaseProjects,
    getShowcaseProjectsAdmin,
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
router.get('/admin/all', authenticate, authorize(Role.ADMIN, Role.FIRMA_SAHIBI), getShowcaseProjectsAdmin);
router.get('/:id', getShowcaseProjectById);

// Admin routes (protected)
router.post('/', authenticate, authorize(Role.ADMIN, Role.FIRMA_SAHIBI), createShowcaseProject);
router.put('/reorder', authenticate, authorize(Role.ADMIN, Role.FIRMA_SAHIBI), reorderProjects);
router.put('/:id', authenticate, authorize(Role.ADMIN, Role.FIRMA_SAHIBI), updateShowcaseProject);
router.delete('/:id', authenticate, authorize(Role.ADMIN, Role.FIRMA_SAHIBI), deleteShowcaseProject);

export default router;
