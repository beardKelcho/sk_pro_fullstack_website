import express from 'express';
import { exportData } from '../controllers/export.controller';
import { authenticate as protect, authorize as restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'manager'));

// Generic export route
// GET /api/export?type=inventory&format=csv
router.get('/', exportData);

export default router;
