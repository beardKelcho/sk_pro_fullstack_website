import express from 'express';
import * as systemSettingsController from '../controllers/systemSettings.controller';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ============ ADMIN ROUTES ============

/**
 * @route   GET /api/admin/settings
 * @desc    Get all system settings
 * @access  Admin
 */
router.get(
    '/',
    requirePermission(Permission.EQUIPMENT_VIEW),
    systemSettingsController.getAllSettings
);

/**
 * @route   GET /api/admin/settings/:key
 * @desc    Get setting by key
 * @access  Admin
 */
router.get(
    '/:key',
    requirePermission(Permission.EQUIPMENT_VIEW),
    systemSettingsController.getSettingByKey
);

/**
 * @route   PUT /api/admin/settings/:key
 * @desc    Update setting by key
 * @access  Admin
 */
router.put(
    '/:key',
    requirePermission(Permission.EQUIPMENT_UPDATE),
    systemSettingsController.updateSetting
);

/**
 * @route   POST /api/admin/settings/maintenance/toggle
 * @desc    Toggle maintenance mode (convenience endpoint)
 * @access  Admin
 */
router.post(
    '/maintenance/toggle',
    requirePermission(Permission.EQUIPMENT_UPDATE),
    systemSettingsController.toggleMaintenanceMode
);

/**
 * @route   DELETE /api/admin/settings/:key
 * @desc    Delete setting
 * @access  Admin
 */
router.delete(
    '/:key',
    requirePermission(Permission.EQUIPMENT_DELETE),
    systemSettingsController.deleteSetting
);

export default router;
