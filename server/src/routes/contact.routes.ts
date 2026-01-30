import express from 'express';
import { sendMessage, getAllMessages, markAsRead } from '../controllers/contact.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public route - Send contact message
router.post('/send', sendMessage);

// Admin routes - Manage messages
router.get('/messages', authenticate, getAllMessages);
router.patch('/messages/:id/read', authenticate, markAsRead);

export default router;
