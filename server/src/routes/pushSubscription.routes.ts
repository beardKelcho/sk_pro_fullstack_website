import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  subscribe,
  unsubscribe,
  getSubscriptions,
} from '../controllers/pushSubscription.controller';
import {
  getVapidPublicKey,
  sendTestPushNotification,
} from '../controllers/pushNotification.controller';

const router = express.Router();

// VAPID public key (herkese açık)
router.get('/vapid-key', getVapidPublicKey);

// Tüm route'lar authentication gerektirir
router.use(authenticate);

// Push subscription kaydet
router.post('/subscribe', subscribe);

// Push subscription sil
router.post('/unsubscribe', unsubscribe);

// Kullanıcının push subscription'larını getir
router.get('/subscriptions', getSubscriptions);

// Test push notification gönder
router.post('/test', sendTestPushNotification);

export default router;

