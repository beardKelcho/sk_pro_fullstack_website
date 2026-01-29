import express from 'express';
import { getMedia, uploadMedia } from '../controllers/media.controller';
import { upload } from '../middleware/upload.middleware';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, authorize('admin', 'editor'), getMedia);
router.post('/upload', protect, authorize('admin', 'editor'), upload.single('file'), uploadMedia);

export default router;
