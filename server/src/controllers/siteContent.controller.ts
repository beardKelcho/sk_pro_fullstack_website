import { Request, Response } from 'express';
import SiteContent from '../models/SiteContent';
import mongoose from 'mongoose';
import logger from '../utils/logger';

// Tüm içerikleri listele
export const getAllContents = async (req: Request, res: Response) => {
  try {
    const { section, isActive } = req.query;
    
    const filters: any = {};
    if (section) {
      filters.section = section;
    }
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }
    
    const contents = await SiteContent.find(filters)
      .sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contents.length,
      contents,
    });
  } catch (error) {
    logger.error('İçerik listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçerikler listelenirken bir hata oluştu',
    });
  }
};

// Tek bir içeriği getir
export const getContentBySection = async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    
    // Section'ı lowercase yap ve normalize et
    const normalizedSection = section?.toLowerCase().trim();
    
    const content = await SiteContent.findOne({ 
      section: normalizedSection, 
      isActive: true 
    });
    
    // Eğer içerik yoksa, boş bir response döndür (404 yerine 200 ile boş data)
    if (!content) {
      return res.status(200).json({
        success: true,
        message: 'İçerik bulunamadı, varsayılan içerik kullanılabilir',
        content: null,
      });
    }
    
    res.status(200).json({
      success: true,
      content,
    });
  } catch (error) {
    logger.error('İçerik detayları hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçerik detayları alınırken bir hata oluştu',
    });
  }
};

// Yeni içerik oluştur
export const createContent = async (req: Request, res: Response) => {
  try {
    const { section, content, order, isActive } = req.body;
    
    if (!section || !content) {
      return res.status(400).json({
        success: false,
        message: 'Bölüm ve içerik gereklidir',
      });
    }
    
    // Aynı section'da zaten içerik varsa güncelle
    const existingContent = await SiteContent.findOne({ section });
    if (existingContent) {
      existingContent.content = content;
      if (order !== undefined) existingContent.order = order;
      if (isActive !== undefined) existingContent.isActive = isActive;
      await existingContent.save();
      
      return res.status(200).json({
        success: true,
        content: existingContent,
        message: 'İçerik güncellendi',
      });
    }
    
    const newContent = await SiteContent.create({
      section,
      content,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });
    
    res.status(201).json({
      success: true,
      content: newContent,
    });
  } catch (error) {
    logger.error('İçerik oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçerik oluşturulurken bir hata oluştu',
    });
  }
};

// İçerik güncelle
export const updateContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, order, isActive } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz içerik ID',
      });
    }
    
    const siteContent = await SiteContent.findById(id);
    if (!siteContent) {
      return res.status(404).json({
        success: false,
        message: 'İçerik bulunamadı',
      });
    }
    
    if (content) siteContent.content = content;
    if (order !== undefined) siteContent.order = order;
    if (isActive !== undefined) siteContent.isActive = isActive;
    
    await siteContent.save();
    
    res.status(200).json({
      success: true,
      content: siteContent,
    });
  } catch (error) {
    logger.error('İçerik güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçerik güncellenirken bir hata oluştu',
    });
  }
};

// Section'a göre içerik güncelle
export const updateContentBySection = async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const { content, order, isActive } = req.body;
    
    let siteContent = await SiteContent.findOne({ section });
    
    if (!siteContent) {
      // Eğer içerik yoksa oluştur
      siteContent = await SiteContent.create({
        section,
        content: content || {},
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      });
    } else {
      // Varsa güncelle
      if (content) siteContent.content = content;
      if (order !== undefined) siteContent.order = order;
      if (isActive !== undefined) siteContent.isActive = isActive;
      await siteContent.save();
    }
    
    res.status(200).json({
      success: true,
      content: siteContent,
    });
  } catch (error) {
    logger.error('İçerik güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçerik güncellenirken bir hata oluştu',
    });
  }
};

// İçerik sil
export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz içerik ID',
      });
    }
    
    const content = await SiteContent.findById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'İçerik bulunamadı',
      });
    }
    
    await content.deleteOne();
    
    logger.info(`İçerik silindi: ${content.section} by user ${req.user?.id}`);
    
    res.status(200).json({
      success: true,
      message: 'İçerik başarıyla silindi',
    });
  } catch (error) {
    logger.error('İçerik silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçerik silinirken bir hata oluştu',
    });
  }
};

