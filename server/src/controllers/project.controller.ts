import { Request, Response } from 'express';
import { Project } from '../models';
import mongoose from 'mongoose';
import { sendProjectStartEmail, sendProjectStatusChangeEmail } from '../utils/emailService';
import { notifyProjectTeam } from '../utils/notificationService';
import logger from '../utils/logger';
import { logAction, extractChanges } from '../utils/auditLogger';

// Tüm projeleri listele
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { status, search, startDate, endDate, sort = '-createdAt', page = 1, limit = 10 } = req.query;
    
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
    
    // Tarih filtresi - projelerin seçili tarih aralığı ile kesişmesi
    // Proje, filtrenin tarih aralığı ile kesişiyorsa gösterilir
    if (startDate || endDate) {
      const dateFilter: any[] = [];
      const filterStartDate = startDate ? new Date(startDate as string) : null;
      const filterEndDate = endDate ? new Date(endDate as string) : null;
      
      if (filterStartDate && filterEndDate) {
        // Her iki tarih de varsa: Projenin tarih aralığı ile filtrenin tarih aralığının kesişmesi
        // Kesişme koşulu: proje.startDate <= filterEndDate && (proje.endDate >= filterStartDate || proje.endDate yok)
        dateFilter.push({
          startDate: { $lte: filterEndDate },
          $or: [
            { endDate: { $gte: filterStartDate } },
            { endDate: { $exists: false } },
            { endDate: null }
          ]
        });
      } else if (filterStartDate) {
        // Sadece başlangıç tarihi varsa: Projenin bitiş tarihi >= filterStartDate veya endDate yok
        dateFilter.push({
          $or: [
            { endDate: { $gte: filterStartDate } },
            { endDate: { $exists: false } },
            { endDate: null },
            { startDate: { $lte: filterStartDate } }
          ]
        });
      } else if (filterEndDate) {
        // Sadece bitiş tarihi varsa: Projenin başlangıç tarihi <= filterEndDate
        dateFilter.push({
          startDate: { $lte: filterEndDate }
        });
      }
      
      if (dateFilter.length > 0) {
        if (filters.$or) {
          // Eğer zaten $or varsa (search için), yeni bir $and ekle
          filters.$and = [
            { $or: filters.$or },
            ...dateFilter
          ];
          delete filters.$or;
        } else {
          Object.assign(filters, ...dateFilter);
        }
      }
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
    
    // Cache'i invalidate et
    const { invalidateProjectCache, invalidateDashboardCache } = await import('../middleware/cache.middleware');
    await invalidateProjectCache().catch((err: any) => logger.error('Project cache invalidation hatası:', err));
    await invalidateDashboardCache().catch((err: any) => logger.error('Dashboard cache invalidation hatası:', err));
    
    // Audit log
    await logAction(req, 'CREATE', 'Project', project._id.toString());
    
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
    
    // Eski projeyi al (durum değişikliği kontrolü için)
    const oldProject = await Project.findById(id);
    
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
    
    // Durum değişikliği kontrolü ve bildirim gönderimi
    if (oldProject && oldProject.status !== updatedProject.status) {
      const teamEmails: string[] = [];
      const teamIds: mongoose.Types.ObjectId[] = [];
      
      if (Array.isArray(updatedProject.team)) {
        updatedProject.team.forEach((member: any) => {
          if (member.email) teamEmails.push(member.email);
          if (member._id) teamIds.push(member._id);
        });
      }
      
      // Email gönder (async, hata olsa bile devam et)
      if (teamEmails.length > 0) {
        sendProjectStatusChangeEmail(
          teamEmails,
          updatedProject.name,
          oldProject.status,
          updatedProject.status,
          updatedProject._id.toString()
        ).catch(err => logger.error('Proje durum email gönderme hatası:', err));
      }
      
      // Bildirim gönder (async, hata olsa bile devam et)
      if (teamIds.length > 0) {
        const notificationType = updatedProject.status === 'COMPLETED' 
          ? 'PROJECT_COMPLETED' 
          : updatedProject.status === 'ACTIVE' && oldProject.status !== 'ACTIVE'
          ? 'PROJECT_STARTED'
          : 'PROJECT_UPDATED';
        
        notifyProjectTeam(
          teamIds,
          notificationType,
          'Proje Durumu Güncellendi',
          `${updatedProject.name} projesinin durumu "${oldProject.status}" → "${updatedProject.status}" olarak güncellendi.`,
          updatedProject._id.toString(),
          false // Email zaten gönderildi
        ).catch(err => logger.error('Proje bildirim gönderme hatası:', err));
      }
      
      // Proje tamamlandıysa müşteriye de bildirim gönder
      if (updatedProject.status === 'COMPLETED' && updatedProject.client && typeof updatedProject.client === 'object') {
        const client = updatedProject.client as any;
        if (client.email) {
          sendProjectStatusChangeEmail(
            [client.email],
            updatedProject.name,
            oldProject.status,
            updatedProject.status,
            updatedProject._id.toString()
          ).catch(err => logger.error('Müşteri email gönderme hatası:', err));
        }
      }
    }
    
    // Cache'i invalidate et
    const { invalidateProjectCache, invalidateDashboardCache } = await import('../middleware/cache.middleware');
    await invalidateProjectCache().catch((err: any) => logger.error('Project cache invalidation hatası:', err));
    await invalidateDashboardCache().catch((err: any) => logger.error('Dashboard cache invalidation hatası:', err));
    
    // Audit log - değişiklikleri kaydet
    if (oldProject) {
      const changes = extractChanges(oldProject.toObject(), updatedProject.toObject());
      await logAction(req, 'UPDATE', 'Project', id, changes);
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
    
    // Cache'i invalidate et
    const { invalidateProjectCache, invalidateDashboardCache } = await import('../middleware/cache.middleware');
    await invalidateProjectCache().catch((err: any) => logger.error('Project cache invalidation hatası:', err));
    await invalidateDashboardCache().catch((err: any) => logger.error('Dashboard cache invalidation hatası:', err));
    
    // Audit log
    await logAction(req, 'DELETE', 'Project', id);
    
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

