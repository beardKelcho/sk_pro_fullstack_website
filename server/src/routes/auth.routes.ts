import express from 'express';
import { authController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';
import { validateLogin, sanitizeInput } from '../middleware/inputValidation';

const router = express.Router();

// Giriş yap
router.post('/login', sanitizeInput, validateLogin, authController.login);

// Çıkış yap
router.post('/logout', authController.logout);

// Token yenile
router.post('/refresh-token', authController.refreshToken);

// Profil bilgilerini getir
router.get('/profile', authenticate, authController.getProfile);

// Profil güncelle
router.put('/profile', authenticate, sanitizeInput, authController.updateProfile);

// Şifre değiştir
router.put('/change-password', authenticate, sanitizeInput, authController.changePassword);

export default router; 