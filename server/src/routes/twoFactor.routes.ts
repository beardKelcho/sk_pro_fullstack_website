import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  setup2FA,
  verify2FA,
  disable2FA,
  get2FAStatus,
  verify2FALogin,
} from '../controllers/twoFactor.controller';

const router = express.Router();

// Login sırasında 2FA doğrulama (authentication gerektirmez)
router.post('/verify-login', verify2FALogin);

// Tüm diğer route'lar authentication gerektirir
router.use(authenticate);

// 2FA durumunu kontrol et
router.get('/status', get2FAStatus);

// 2FA kurulumunu başlat
router.post('/setup', setup2FA);

// 2FA'yı doğrula ve aktif et
router.post('/verify', verify2FA);

// 2FA'yı devre dışı bırak
router.post('/disable', disable2FA);

export default router;

