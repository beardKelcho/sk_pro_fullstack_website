import express from 'express';
import * as siteContentController from '../controllers/siteContentV2.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

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
    authorize('ADMIN', 'FIRMA_SAHIBI'),
    siteContentController.getAllContent
);

/**
 * @route   POST /api/admin/site-content
 * @desc    Create or update content by section
 * @access  Admin / FIRMA_SAHIBI
 */
router.post(
    '/',
    authorize('ADMIN', 'FIRMA_SAHIBI'),
    siteContentController.upsertContent
);

/**
 * @route   PATCH /api/admin/site-content/:section/toggle
 * @desc    Toggle section active status
 * @access  Admin / FIRMA_SAHIBI
 */
router.patch(
    '/:section/toggle',
    authorize('ADMIN', 'FIRMA_SAHIBI'),
    siteContentController.toggleSectionStatus
);

/**
 * @route   DELETE /api/admin/site-content/:section
 * @desc    Delete content section
 * @access  Admin / FIRMA_SAHIBI
 */
router.delete(
    '/:section',
    authorize('ADMIN', 'FIRMA_SAHIBI'),
    siteContentController.deleteContent
);

export default router;
