import express from 'express';
import { getMedia, uploadMedia, deleteMedia } from '../controllers/media.controller';
import { upload } from '../middleware/upload.middleware';
import { Role } from "../config/permissions";
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, authorize(Role.PROJE_YONETICISI, Role.DEPO_SORUMLUSU), getMedia);
router.post('/upload', authenticate, authorize(Role.PROJE_YONETICISI, Role.DEPO_SORUMLUSU), upload.single('file'), uploadMedia);
router.delete('/:id', authenticate, authorize(Role.PROJE_YONETICISI, Role.DEPO_SORUMLUSU), deleteMedia);

export default router;
