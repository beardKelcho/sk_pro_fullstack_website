import { Request, Response } from 'express';
import { SavedSearch, SearchHistory } from '../models';
import logger from '../utils/logger';
import { logAction } from '../utils/auditLogger';

/**
 * Kullanıcının kaydedilmiş aramalarını getir
 */
export const getSavedSearches = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const { resource } = req.query;

    const query: any = { userId };
    if (resource) {
      query.resource = resource;
    }

    const savedSearches = await SavedSearch.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      savedSearches,
    });
  } catch (error) {
    logger.error('Kaydedilmiş aramalar getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kaydedilmiş aramalar getirilemedi',
    });
  }
};

/**
 * Yeni kaydedilmiş arama oluştur
 */
export const createSavedSearch = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const { name, resource, filters } = req.body;

    if (!name || !resource || !filters) {
      return res.status(400).json({
        success: false,
        message: 'İsim, resource ve filtreler gereklidir',
      });
    }

    const savedSearch = await SavedSearch.create({
      name,
      userId,
      resource,
      filters,
    });

    await logAction(req, 'CREATE', 'SavedSearch', savedSearch._id.toString());

    res.status(201).json({
      success: true,
      savedSearch,
    });
  } catch (error: any) {
    logger.error('Kaydedilmiş arama oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Kaydedilmiş arama oluşturulamadı',
    });
  }
};

/**
 * Kaydedilmiş aramayı sil
 */
export const deleteSavedSearch = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const { id } = req.params;

    const savedSearch = await SavedSearch.findOne({
      _id: id,
      userId,
    });

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        message: 'Kaydedilmiş arama bulunamadı',
      });
    }

    await SavedSearch.deleteOne({ _id: id });

    await logAction(req, 'DELETE', 'SavedSearch', id);

    res.status(200).json({
      success: true,
      message: 'Kaydedilmiş arama silindi',
    });
  } catch (error) {
    logger.error('Kaydedilmiş arama silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kaydedilmiş arama silinemedi',
    });
  }
};

/**
 * Arama geçmişini getir
 */
export const getSearchHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const limit = parseInt(req.query.limit as string) || 20;

    const history = await SearchHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    logger.error('Arama geçmişi getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Arama geçmişi getirilemedi',
    });
  }
};

/**
 * Arama geçmişine ekle (utility function)
 */
export const addToSearchHistory = async (
  userId: string,
  query: string,
  resource?: string,
  resultCount: number = 0
): Promise<void> => {
  try {
    await SearchHistory.create({
      userId,
      query,
      resource: resource as any,
      resultCount,
    });
  } catch (error) {
    logger.error('Arama geçmişi ekleme hatası:', error);
    // Hata olsa bile devam et
  }
};

/**
 * Arama geçmişini temizle
 */
export const clearSearchHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;

    await SearchHistory.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: 'Arama geçmişi temizlendi',
    });
  } catch (error) {
    logger.error('Arama geçmişi temizleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Arama geçmişi temizlenemedi',
    });
  }
};

