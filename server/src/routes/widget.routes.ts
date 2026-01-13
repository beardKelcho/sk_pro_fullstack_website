import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getUserWidgets,
  getWidgetById,
  createWidget,
  updateWidget,
  deleteWidget,
  updateWidgetsBulk,
  createDefaultWidgets,
} from '../controllers/widget.controller';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authenticate);

// Kullanıcının widget'larını getir
router.get('/', getUserWidgets);

// Varsayılan widget'ları oluştur
router.post('/defaults', createDefaultWidgets);

// Toplu widget güncelleme
router.put('/bulk', updateWidgetsBulk);

// Tek bir widget getir
router.get('/:id', getWidgetById);

// Yeni widget oluştur
router.post('/', createWidget);

// Widget güncelle
router.put('/:id', updateWidget);

// Widget sil
router.delete('/:id', deleteWidget);

export default router;

