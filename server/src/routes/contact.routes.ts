import express from 'express';
import { sendMessage, getAllMessages, markAsRead } from '../controllers/contact.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { contactRateLimiter } from '../middleware/rateLimiters';

const router = express.Router();

/** Contact form gönderimi — rate limit ile bot koruması */
router.post('/send', contactRateLimiter, sendMessage);

// Admin routes - Manage messages (sadece ADMIN ve FIRMA_SAHIBI erişebilir)
router.get('/messages', authenticate, authorize('ADMIN', 'FIRMA_SAHIBI'), getAllMessages);
router.patch('/messages/:id/read', authenticate, authorize('ADMIN', 'FIRMA_SAHIBI'), markAsRead);

export default router;
