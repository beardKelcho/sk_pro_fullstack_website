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

// Tüm diğer oturumları sonlandır
// NOTE: Bu route, `/:sessionId` param route'undan ÖNCE gelmeli.
// Aksi halde Express, `/sessions/all/others` isteğini `sessionId="all"` diye yakalar.
router.delete('/all/others', terminateAllOtherSessions);

// Belirli bir oturumu sonlandır
router.delete('/:sessionId', terminateSession);

export default router;

