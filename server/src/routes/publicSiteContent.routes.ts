import express from 'express';
import * as siteContentController from '../controllers/siteContentV2.controller';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';

const router = express.Router();

// ============ PUBLIC ROUTES ============

/**
 * @route   GET /api/public/site-content
 * @desc    Get all active site content
 * @access  Public
 */
router.get('/', siteContentController.getAllPublicContent);

/**
 * @route   GET /api/public/site-content/:section
 * @desc    Get content by section (hero, about, services, etc.)
 * @access  Public
 */
router.get('/:section', siteContentController.getPublicContentBySection);

export default router;
