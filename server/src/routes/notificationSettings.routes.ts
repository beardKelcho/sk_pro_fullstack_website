import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getSettings,
  updateSettings,
} from '../controllers/notificationSettings.controller';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authenticate);

// Bildirim ayarlarını getir
router.get('/', getSettings);

// Bildirim ayarlarını güncelle
router.put('/', updateSettings);

export default router;

