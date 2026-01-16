import { Request, Response } from 'express';
import { Project, Equipment } from '../models';
import mongoose from 'mongoose';
import { sendProjectStartEmail, sendProjectStatusChangeEmail } from '../utils/emailService';
import { notifyProjectTeam } from '../utils/notificationService';
import logger from '../utils/logger';
import { logAction, extractChanges } from '../utils/auditLogger';
import { emitWebhookEvent } from '../services/webhook.service';

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
        $or: [
          { status: { $ne: 'AVAILABLE' } },
          { currentProject: { $exists: true, $ne: null } },
        ],
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

    // Ekipmanları projeye atomik olarak rezerve et (race condition ve çift atama engeli)
    if (validEquipmentIds.length > 0) {
      const reserveResult = await Equipment.updateMany(
        {
          _id: { $in: validEquipmentIds },
          status: 'AVAILABLE',
          $or: [{ currentProject: { $exists: false } }, { currentProject: null }],
        },
        { $set: { status: 'IN_USE', currentProject: project._id } }
      );

      if ((reserveResult as any).modifiedCount !== validEquipmentIds.length) {
        // Rollback: sadece bu proje için rezerve edilenleri geri al
        await Equipment.updateMany(
          { _id: { $in: validEquipmentIds }, currentProject: project._id },
          { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } }
        ).catch(() => null);
        await Project.findByIdAndDelete(project._id).catch(() => null);

        return res.status(409).json({
          success: false,
          message: 'Bazı ekipmanlar aynı anda başka bir projeye atanmış. Lütfen tekrar deneyin.',
          code: 'EQUIPMENT_RESERVATION_FAILED',
        });
      }
    }
    
    // Cache'i invalidate et
    const { invalidateProjectCache, invalidateDashboardCache, invalidateEquipmentCache } = await import('../middleware/cache.middleware');
    await invalidateProjectCache().catch((err: any) => logger.error('Project cache invalidation hatası:', err));
    await invalidateDashboardCache().catch((err: any) => logger.error('Dashboard cache invalidation hatası:', err));
    await invalidateEquipmentCache().catch((err: any) => logger.error('Equipment cache invalidation hatası:', err));
    
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
    // Equipment diff + availability validation (atomik rezerv)
    let addedEquipmentIds: string[] = [];
    let removedEquipmentIds: string[] = [];
    let reservedForThisUpdate = false;
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

      // Yeni eklenenleri atomik rezerve et (AVAILABLE + currentProject boş olmalı)
      if (addedEquipmentIds.length > 0) {
        const reserveResult = await Equipment.updateMany(
          {
            _id: { $in: addedEquipmentIds },
            status: 'AVAILABLE',
            $or: [{ currentProject: { $exists: false } }, { currentProject: null }],
          },
          { $set: { status: 'IN_USE', currentProject: oldProject._id } }
        );

        if ((reserveResult as any).modifiedCount !== addedEquipmentIds.length) {
          // Rollback: bu update sırasında rezerve edilenleri geri al
          await Equipment.updateMany(
            { _id: { $in: addedEquipmentIds }, currentProject: oldProject._id },
            { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } }
          ).catch(() => null);

          const notAvailable = await Equipment.find({
            _id: { $in: addedEquipmentIds },
            $or: [
              { status: { $ne: 'AVAILABLE' } },
              { currentProject: { $exists: true, $ne: null } },
            ],
          })
            .select('_id name status currentProject')
            .lean()
            .catch(() => []);

          return res.status(409).json({
            success: false,
            message: 'Bazı ekipmanlar zaten kullanımda/bakımda veya başka projeye atanmış. Başka projeye atanamaz.',
            code: 'EQUIPMENT_NOT_AVAILABLE',
            details: notAvailable,
          });
        }
        reservedForThisUpdate = true;
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
      // Update başarısızsa bu update sırasında rezerve edilenleri geri al
      if (reservedForThisUpdate && addedEquipmentIds.length > 0) {
        await Equipment.updateMany(
          { _id: { $in: addedEquipmentIds }, currentProject: oldProject._id },
          { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } }
        ).catch(() => null);
      }
      return res.status(404).json({
        success: false,
        message: 'Proje bulunamadı',
      });
    }

    // Equipment status senkronizasyonu
    // - çıkarılanlar -> AVAILABLE + currentProject temizle (sadece bu projeye aitse)
    if (removedEquipmentIds.length > 0) {
      await Equipment.updateMany(
        { _id: { $in: removedEquipmentIds }, currentProject: updatedProject._id },
        { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } }
      ).catch((err: any) => logger.error('Ekipman status AVAILABLE update hatası:', err));
    }

    let responseProject = updatedProject;

    // Proje COMPLETED/CANCELLED olduysa bu projeye ait tüm ekipmanları serbest bırak
    if (updatedProject.status === 'COMPLETED' || updatedProject.status === 'CANCELLED') {
      await Equipment.updateMany(
        { currentProject: updatedProject._id },
        { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } }
      ).catch((err: any) => logger.error('Ekipman status AVAILABLE (project close) update hatası:', err));

      // Re-fetch: populate edilen equipment statüleri güncel olsun
      const refreshedProject = await Project.findById(updatedProject._id)
        .populate('client', 'name email phone')
        .populate('team', 'name email role')
        .populate('equipment', 'name type model status');
      if (refreshedProject) {
        responseProject = refreshedProject;
      }
    }
    
    // Durum değişikliği kontrolü ve bildirim gönderimi
    if (oldProject && oldProject.status !== responseProject.status) {
      const teamEmails: string[] = [];
      const teamIds: mongoose.Types.ObjectId[] = [];
      
      if (Array.isArray(responseProject.team)) {
        responseProject.team.forEach((member: any) => {
          if (member.email) teamEmails.push(member.email);
          if (member._id) teamIds.push(member._id);
        });
      }
      
      // Email gönder (async, hata olsa bile devam et)
      if (teamEmails.length > 0) {
        sendProjectStatusChangeEmail(
          teamEmails,
          responseProject.name,
          oldProject.status,
          responseProject.status,
          responseProject._id.toString()
        ).catch(err => logger.error('Proje durum email gönderme hatası:', err));
      }
      
      // Bildirim gönder (async, hata olsa bile devam et)
      if (teamIds.length > 0) {
        const notificationType = responseProject.status === 'COMPLETED' 
          ? 'PROJECT_COMPLETED' 
          : responseProject.status === 'ACTIVE' && oldProject.status !== 'ACTIVE'
          ? 'PROJECT_STARTED'
          : 'PROJECT_UPDATED';
        
        notifyProjectTeam(
          teamIds,
          notificationType,
          'Proje Durumu Güncellendi',
          `${responseProject.name} projesinin durumu "${oldProject.status}" → "${responseProject.status}" olarak güncellendi.`,
          responseProject._id.toString(),
          false // Email zaten gönderildi
        ).catch(err => logger.error('Proje bildirim gönderme hatası:', err));
      }
      
      // Proje tamamlandıysa müşteriye de bildirim gönder
      if (responseProject.status === 'COMPLETED' && responseProject.client && typeof responseProject.client === 'object') {
        const client = responseProject.client as any;
        if (client.email) {
          sendProjectStatusChangeEmail(
            [client.email],
            responseProject.name,
            oldProject.status,
            responseProject.status,
            responseProject._id.toString()
          ).catch(err => logger.error('Müşteri email gönderme hatası:', err));
        }
      }

      // Webhook event (async)
      emitWebhookEvent(
        'PROJECT_STATUS_CHANGED',
        {
          projectId: responseProject._id?.toString(),
          name: responseProject.name,
          oldStatus: oldProject.status,
          newStatus: responseProject.status,
        },
        { source: 'api' }
      ).catch((err) => logger.error('Webhook emit hatası (PROJECT_STATUS_CHANGED):', err));
    }
    
    // Cache'i invalidate et
    const { invalidateProjectCache, invalidateDashboardCache, invalidateEquipmentCache } = await import('../middleware/cache.middleware');
    await invalidateProjectCache().catch((err: any) => logger.error('Project cache invalidation hatası:', err));
    await invalidateDashboardCache().catch((err: any) => logger.error('Dashboard cache invalidation hatası:', err));
    await invalidateEquipmentCache().catch((err: any) => logger.error('Equipment cache invalidation hatası:', err));
    
    // Audit log - değişiklikleri kaydet
    if (oldProject) {
      const changes = extractChanges(oldProject.toObject(), responseProject.toObject());
      await logAction(req, 'UPDATE', 'Project', id, changes);
    }
    
    res.status(200).json({
      success: true,
      project: responseProject,
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

    // Proje silinmeden önce: bu projeye bağlı/rezerve edilmiş ekipmanları boşa çıkar
    // Legacy data için: currentProject boş olsa bile proje.equipment üzerinden de release et
    await Equipment.updateMany(
      {
        _id: { $in: (project.equipment || []) as any[] },
        $or: [
          { currentProject: project._id },
          { currentProject: { $exists: false } },
          { currentProject: null },
        ],
      },
      { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } }
    ).catch((err: any) => logger.error('Proje silme sırasında ekipman release hatası:', err));

    await project.deleteOne();
    
    // Cache'i invalidate et
    const { invalidateProjectCache, invalidateDashboardCache, invalidateEquipmentCache } = await import('../middleware/cache.middleware');
    await invalidateProjectCache().catch((err: any) => logger.error('Project cache invalidation hatası:', err));
    await invalidateDashboardCache().catch((err: any) => logger.error('Dashboard cache invalidation hatası:', err));
    await invalidateEquipmentCache().catch((err: any) => logger.error('Equipment cache invalidation hatası:', err));
    
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

