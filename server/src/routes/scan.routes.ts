import express from 'express';
import scanController from '../controllers/scan.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate); // All scan routes require authentication

router.get('/:code', scanController.scanItem);

export default router;
