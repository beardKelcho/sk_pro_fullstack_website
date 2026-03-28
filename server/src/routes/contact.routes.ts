import express from 'express';
import { sendMessage, getAllMessages, markAsRead } from '../controllers/contact.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Public route - Send contact message
router.post('/send', sendMessage);

// Admin routes - Manage messages (sadece ADMIN ve FIRMA_SAHIBI erişebilir)
router.get('/messages', authenticate, authorize('ADMIN', 'FIRMA_SAHIBI'), getAllMessages);
router.patch('/messages/:id/read', authenticate, authorize('ADMIN', 'FIRMA_SAHIBI'), markAsRead);

export default router;
