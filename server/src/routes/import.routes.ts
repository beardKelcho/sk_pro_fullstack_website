/**
 * Import Routes
 * Handles data import functionality
 */
import express from 'express';
import { importData, downloadTemplate } from '../controllers/import.controller';
import { authenticate as protect, authorize as restrictTo } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'manager'));

// Generic import route
// POST /api/import
router.post('/', upload.single('file'), importData);

// GET /api/import/template?type=inventory
router.get('/template', downloadTemplate);

export default router;
