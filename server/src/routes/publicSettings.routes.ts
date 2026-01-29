import express from 'express';
import * as systemSettingsController from '../controllers/systemSettings.controller';

const router = express.Router();

// ============ PUBLIC ROUTES ============

/**
 * @route   GET /api/public/maintenance
 * @desc    Get maintenance mode status (fast check)
 * @access  Public
 */
router.get('/maintenance', systemSettingsController.getMaintenanceStatus);

export default router;
