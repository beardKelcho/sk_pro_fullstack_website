import express from 'express';
import * as siteContentController from '../controllers/siteContentV2.controller';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ============ ADMIN ROUTES ============

/**
 * @route   GET /api/admin/site-content
 * @desc    Get all site content (including inactive)
 * @access  Admin
 */
router.get(
    '/',
    requirePermission(Permission.EQUIPMENT_VIEW), // Using existing permission
    siteContentController.getAllContent
);

/**
 * @route   POST /api/admin/site-content
 * @desc    Create or update content by section
 * @access  Admin
 */
router.post(
    '/',
    requirePermission(Permission.EQUIPMENT_UPDATE),
    siteContentController.upsertContent
);

/**
 * @route   PATCH /api/admin/site-content/:section/toggle
 * @desc    Toggle section active status
 * @access  Admin
 */
router.patch(
    '/:section/toggle',
    requirePermission(Permission.EQUIPMENT_UPDATE),
    siteContentController.toggleSectionStatus
);

/**
 * @route   DELETE /api/admin/site-content/:section
 * @desc    Delete content section
 * @access  Admin
 */
router.delete(
    '/:section',
    requirePermission(Permission.EQUIPMENT_DELETE),
    siteContentController.deleteContent
);

export default router;
