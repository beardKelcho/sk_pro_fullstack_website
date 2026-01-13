import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getActiveSessions,
  terminateSession,
  terminateAllOtherSessions,
} from '../controllers/session.controller';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authenticate);

// Aktif oturumları getir
router.get('/', getActiveSessions);

// Belirli bir oturumu sonlandır
router.delete('/:sessionId', terminateSession);

// Tüm diğer oturumları sonlandır
router.delete('/all/others', terminateAllOtherSessions);

export default router;

