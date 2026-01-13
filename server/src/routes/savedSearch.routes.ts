import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
  getSearchHistory,
  clearSearchHistory,
} from '../controllers/savedSearch.controller';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authenticate);

// Kaydedilmiş aramaları getir
router.get('/saved', getSavedSearches);

// Yeni kaydedilmiş arama oluştur
router.post('/saved', createSavedSearch);

// Kaydedilmiş aramayı sil
router.delete('/saved/:id', deleteSavedSearch);

// Arama geçmişini getir
router.get('/history', getSearchHistory);

// Arama geçmişini temizle
router.delete('/history', clearSearchHistory);

export default router;

