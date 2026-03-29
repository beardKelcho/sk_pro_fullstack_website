import express from 'express';
import * as systemSettingsController from '../controllers/systemSettings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

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
    authorize('ADMIN', 'FIRMA_SAHIBI'),
    systemSettingsController.getAllSettings
);

/**
 * @route   GET /api/admin/settings/:key
 * @desc    Get setting by key
 * @access  Admin
 */
router.get(
    '/:key',
    authorize('ADMIN', 'FIRMA_SAHIBI'),
    systemSettingsController.getSettingByKey
);

/**
 * @route   PUT /api/admin/settings/:key
 * @desc    Update setting by key
 * @access  Admin
 */
router.put(
    '/:key',
    authorize('ADMIN', 'FIRMA_SAHIBI'),
    systemSettingsController.updateSetting
);

/**
 * @route   POST /api/admin/settings/maintenance/toggle
 * @desc    Toggle maintenance mode (convenience endpoint)
 * @access  Admin
 */
router.post(
    '/maintenance/toggle',
    authorize('ADMIN', 'FIRMA_SAHIBI'),
    systemSettingsController.toggleMaintenanceMode
);

/**
 * @route   DELETE /api/admin/settings/:key
 * @desc    Delete setting
 * @access  Admin
 */
router.delete(
    '/:key',
    authorize('ADMIN', 'FIRMA_SAHIBI'),
    systemSettingsController.deleteSetting
);

export default router;
