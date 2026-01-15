import { Request, Response } from 'express';
import { Client } from '../models';
import mongoose from 'mongoose';
import logger from '../utils/logger';

// Tüm müşterileri listele
export const getAllClients = async (req: Request, res: Response) => {
  try {
    const { search, sort = '-createdAt', page = 1, limit = 10 } = req.query;
    
    const filters: any = {};
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;
    
    const sortField = (sort as string).startsWith('-') 
      ? (sort as string).substring(1) 
      : (sort as string);
    const sortOrder = (sort as string).startsWith('-') ? -1 : 1;
    
    const sortOptions: any = {};
    sortOptions[sortField] = sortOrder;
    
    const [clients, total] = await Promise.all([
      Client.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber),
      Client.countDocuments(filters)
    ]);
    
    res.status(200).json({
      success: true,
      count: clients.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      clients,
    });
  } catch (error) {
    logger.error('Müşterileri listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Müşteriler listelenirken bir hata oluştu',
    });
  }
};

// Tek bir müşterinin detaylarını getir
export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz müşteri ID',
      });
    }
    
    const client = await Client.findById(id)
      .populate({
        path: 'activeProjects',
        select: 'name status startDate endDate',
      });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Müşteri bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      client,
    });
  } catch (error) {
    logger.error('Müşteri detayları hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Müşteri detayları alınırken bir hata oluştu',
    });
  }
};

// Yeni müşteri oluştur
export const createClient = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Müşteri adı gereklidir',
      });
    }
    
    const client = await Client.create({
      name,
      email,
      phone,
      address,
      notes,
    });
    
    res.status(201).json({
      success: true,
      client,
    });
  } catch (error) {
    logger.error('Müşteri oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Müşteri oluşturulurken bir hata oluştu',
    });
  }
};

// Müşteri güncelle
export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, notes } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz müşteri ID',
      });
    }
    
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        address,
        notes,
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        message: 'Müşteri bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      client: updatedClient,
    });
  } catch (error) {
    logger.error('Müşteri güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Müşteri güncellenirken bir hata oluştu',
    });
  }
};

// Müşteri sil
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz müşteri ID',
      });
    }
    
    const client = await Client.findById(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Müşteri bulunamadı',
      });
    }
    
    // Müşterinin aktif projeleri var mı kontrol et
    const { Project } = require('../models');
    const activeProjects = await Project.countDocuments({ 
      client: id, 
      status: { $in: ['PLANNING', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE'] } 
    });
    
    if (activeProjects > 0) {
      return res.status(400).json({
        success: false,
        message: 'Aktif projeleri olan müşteri silinemez',
      });
    }
    
    await client.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Müşteri başarıyla silindi',
    });
  } catch (error) {
    logger.error('Müşteri silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Müşteri silinirken bir hata oluştu',
    });
  }
};

