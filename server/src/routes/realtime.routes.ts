import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { streamRealtime } from '../controllers/realtime.controller';

const router = express.Router();

router.get('/stream', authenticate, streamRealtime);

export default router;

