import express from 'express';
import { getAbout, updateAbout, getContact, updateContact } from '../controllers/cms.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// About routes
router.get('/about', getAbout);           // Public
router.put('/about', authenticate, authorize('ADMIN', 'FIRMA_SAHIBI'), updateAbout);  // Admin only

// Contact routes
router.get('/contact', getContact);       // Public
router.put('/contact', authenticate, authorize('ADMIN', 'FIRMA_SAHIBI'), updateContact); // Admin only

export default router;
