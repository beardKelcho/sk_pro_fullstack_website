import express from 'express';
import { getMedia, uploadMedia } from '../controllers/media.controller';
import { upload } from '../middleware/upload.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'editor'), getMedia);
router.post('/upload', authenticate, authorize('admin', 'editor'), upload.single('file'), uploadMedia);

export default router;
