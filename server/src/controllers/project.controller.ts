import { Request, Response } from 'express';
import { Project, Client } from '../models';
import mongoose from 'mongoose';
import { sendProjectStartEmail } from '../utils/emailService';
import logger from '../utils/logger';

// Tüm projeleri listele
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { status, search, sort = '-createdAt', page = 1, limit = 10 } = req.query;
    
    const filters: any = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
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
    
    const [projects, total] = await Promise.all([
      Project.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .populate('client', 'name email phone')
        .populate('team', 'name email role')
        .populate('equipment', 'name type model status'),
      Project.countDocuments(filters)
    ]);
    
    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      projects,
    });
  } catch (error) {
    logger.error('Projeleri listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Projeler listelenirken bir hata oluştu',
    });
  }
};

// Tek bir projenin detaylarını getir
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz proje ID',
      });
    }
    
    const project = await Project.findById(id)
      .populate('client', 'name email phone address')
      .populate('team', 'name email role')
      .populate('equipment', 'name type model status location');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proje bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    logger.error('Proje detayları hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Proje detayları alınırken bir hata oluştu',
    });
  }
};

// Yeni proje oluştur
export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, startDate, endDate, status, location, client, team, equipment } = req.body;
    
    if (!name || !startDate || !client) {
      return res.status(400).json({
        success: false,
        message: 'Proje adı, başlangıç tarihi ve müşteri gereklidir',
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(client)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz müşteri ID',
      });
    }
    
    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      status: status || 'PLANNING',
      location,
      client,
      team: team || [],
      equipment: equipment || [],
    });
    
    const populatedProject = await Project.findById(project._id)
      .populate('client', 'name email phone')
      .populate('team', 'name email role')
      .populate('equipment', 'name type model status');
    
    // Proje başladıysa email gönder
    if (populatedProject?.status === 'ACTIVE' && populatedProject?.client && typeof populatedProject.client === 'object') {
      const client = populatedProject.client as any;
      sendProjectStartEmail(
        client.email,
        client.name,
        populatedProject.name,
        new Date(populatedProject.startDate)
      ).catch(err => logger.error('Email gönderme hatası:', err));
    }
    
    res.status(201).json({
      success: true,
      project: populatedProject,
    });
  } catch (error) {
    logger.error('Proje oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Proje oluşturulurken bir hata oluştu',
    });
  }
};

// Proje güncelle
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, status, location, client, team, equipment } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz proje ID',
      });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        name,
        description,
        startDate,
        endDate,
        status,
        location,
        client,
        team,
        equipment,
      },
      { new: true, runValidators: true }
    )
      .populate('client', 'name email phone')
      .populate('team', 'name email role')
      .populate('equipment', 'name type model status');
    
    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        message: 'Proje bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      project: updatedProject,
    });
  } catch (error) {
    logger.error('Proje güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Proje güncellenirken bir hata oluştu',
    });
  }
};

// Proje sil
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz proje ID',
      });
    }
    
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proje bulunamadı',
      });
    }
    
    if (project.status === 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Aktif proje silinemez. Önce projeyi tamamlayın veya iptal edin.',
      });
    }
    
    await project.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Proje başarıyla silindi',
    });
  } catch (error) {
    logger.error('Proje silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Proje silinirken bir hata oluştu',
    });
  }
};

