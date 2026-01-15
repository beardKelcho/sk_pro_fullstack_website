import { Request, Response } from 'express';
import { Project, Equipment } from '../models';
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
    
    // Status normalization (backward compat)
    // Eski PLANNING -> PENDING_APPROVAL
    const normalizedStatus =
      status === 'PLANNING' ? 'PENDING_APPROVAL' : (status || 'PENDING_APPROVAL');

    // Equipment assignment validation: IN_USE ekipman başka projeye atanamasın
    const equipmentIds: string[] = Array.isArray(equipment) ? equipment : [];
    const validEquipmentIds = equipmentIds.filter((x) => mongoose.Types.ObjectId.isValid(x));
    if (equipmentIds.length !== validEquipmentIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz ekipman ID',
      });
    }

    if (validEquipmentIds.length > 0) {
      const notAvailable = await Equipment.find({
        _id: { $in: validEquipmentIds },
        status: { $ne: 'AVAILABLE' },
      })
        .select('_id name status')
        .lean();

      if (notAvailable.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Bazı ekipmanlar zaten kullanımda/bakımda. Başka projeye atanamaz.',
          code: 'EQUIPMENT_NOT_AVAILABLE',
          details: notAvailable,
        });
      }
    }

    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      status: normalizedStatus,
      location,
      client,
      team: team || [],
      equipment: validEquipmentIds,
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

    // Ekipmanlar projeye atanıyorsa depoda değil -> IN_USE (rezerv)
    if (validEquipmentIds.length > 0) {
      await Equipment.updateMany(
        { _id: { $in: validEquipmentIds } },
        { $set: { status: 'IN_USE' } }
      ).catch((err: any) => logger.error('Ekipman status IN_USE update hatası:', err));
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
    
    // Eski projeyi al (durum değişikliği ve ekipman diff için)
    const oldProject = await Project.findById(id);
    if (!oldProject) {
      return res.status(404).json({
        success: false,
        message: 'Proje bulunamadı',
      });
    }

    // Partial update: sadece gelen alanları güncelle (undefined alanlar DB'yi bozmasın)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (location !== undefined) updateData.location = location;
    if (client !== undefined) updateData.client = client;
    if (team !== undefined) updateData.team = team;
    // Equipment diff + availability validation
    let addedEquipmentIds: string[] = [];
    let removedEquipmentIds: string[] = [];
    if (equipment !== undefined) {
      const newEquipmentIds: string[] = Array.isArray(equipment) ? equipment : [];
      const validNewEquipmentIds = newEquipmentIds.filter((x) => mongoose.Types.ObjectId.isValid(x));
      if (newEquipmentIds.length !== validNewEquipmentIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz ekipman ID',
        });
      }

      const oldIds = (oldProject.equipment || []).map((x: any) => x.toString());
      const newIds = validNewEquipmentIds.map((x) => x.toString());

      addedEquipmentIds = newIds.filter((x) => !oldIds.includes(x));
      removedEquipmentIds = oldIds.filter((x) => !newIds.includes(x));

      // Yeni eklenenler AVAILABLE olmalı
      if (addedEquipmentIds.length > 0) {
        const notAvailable = await Equipment.find({
          _id: { $in: addedEquipmentIds },
          status: { $ne: 'AVAILABLE' },
        })
          .select('_id name status')
          .lean();

        if (notAvailable.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Bazı ekipmanlar zaten kullanımda/bakımda. Başka projeye atanamaz.',
            code: 'EQUIPMENT_NOT_AVAILABLE',
            details: notAvailable,
          });
        }
      }

      updateData.equipment = validNewEquipmentIds;
    }
    if (status !== undefined) {
      updateData.status = status === 'PLANNING' ? 'PENDING_APPROVAL' : status;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Güncellenecek alan bulunamadı',
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('client', 'name email phone')
      .populate('team', 'name email role')
      .populate('equipment', 'name type model status');
    
    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        message: 'Proje bulunamadı',
      });
    }

    // Equipment status senkronizasyonu
    // - yeni eklenenler -> IN_USE
    // - çıkarılanlar -> AVAILABLE (başka aktif projede kullanılmıyorsa)
    if (addedEquipmentIds.length > 0) {
      await Equipment.updateMany(
        { _id: { $in: addedEquipmentIds } },
        { $set: { status: 'IN_USE' } }
      ).catch((err: any) => logger.error('Ekipman status IN_USE update hatası:', err));
    }

    if (removedEquipmentIds.length > 0) {
      const otherProjects = await Project.find({
        _id: { $ne: updatedProject._id },
        status: { $nin: ['COMPLETED', 'CANCELLED'] },
        equipment: { $in: removedEquipmentIds },
      })
        .select('equipment')
        .lean();

      const stillUsed = new Set<string>();
      otherProjects.forEach((p: any) => {
        (p.equipment || []).forEach((eid: any) => stillUsed.add(eid.toString()));
      });

      const toAvailable = removedEquipmentIds.filter((eid) => !stillUsed.has(eid));
      if (toAvailable.length > 0) {
        await Equipment.updateMany(
          { _id: { $in: toAvailable } },
          { $set: { status: 'AVAILABLE' } }
        ).catch((err: any) => logger.error('Ekipman status AVAILABLE update hatası:', err));
      }
    }

    // Proje COMPLETED/CANCELLED olduysa tüm ekipmanları AVAILABLE yap (başka projede kullanılmıyorsa)
    if (updatedProject.status === 'COMPLETED' || updatedProject.status === 'CANCELLED') {
      const updatedEquipIds = (updatedProject.equipment || []).map((x: any) => (typeof x === 'string' ? x : x._id?.toString?.() || x.toString?.()));
      const otherProjects = await Project.find({
        _id: { $ne: updatedProject._id },
        status: { $nin: ['COMPLETED', 'CANCELLED'] },
        equipment: { $in: updatedEquipIds },
      })
        .select('equipment')
        .lean();
      const stillUsed = new Set<string>();
      otherProjects.forEach((p: any) => {
        (p.equipment || []).forEach((eid: any) => stillUsed.add(eid.toString()));
      });
      const toAvailable = updatedEquipIds.filter((eid: string) => eid && !stillUsed.has(eid));
      if (toAvailable.length > 0) {
        await Equipment.updateMany(
          { _id: { $in: toAvailable } },
          { $set: { status: 'AVAILABLE' } }
        ).catch((err: any) => logger.error('Ekipman status AVAILABLE update hatası:', err));
      }
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

