import { Request, Response } from 'express';
import { AppError } from '../types/common';

import { Equipment, QRCode, Project } from '../models';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { logAction } from '../utils/auditLogger';
import { invalidateEquipmentCache } from '../middleware/cache.middleware';
import { createVersionHistory } from '../utils/versionHistory';
import { generateQRCodeContent, generateQRCodeImage } from '../utils/qrGenerator';

// Tüm ekipmanları listele
export const getAllEquipment = async (req: Request, res: Response) => {
  try {
    // Query parametreleri
    const { type, status, search, sort = 'name', page = 1, limit = 10 } = req.query;

    // Filtreleme koşulları
    const filters: any = {};

    if (type) {
      filters.type = type;
    }

    if (status) {
      filters.status = status;
    }

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Sayfalama
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Sıralama
    const sortField = (sort as string).startsWith('-')
      ? (sort as string).substring(1)
      : (sort as string);
    const sortOrder = (sort as string).startsWith('-') ? -1 : 1;

    const sortOptions: any = {};
    sortOptions[sortField] = sortOrder;

    // Ekipmanları sorgula
    const [equipment, total] = await Promise.all([
      Equipment.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .populate('responsibleUser', 'name email')
        .populate('currentProject', 'name status')
        .lean(),

      Equipment.countDocuments(filters)
    ]);

    // --- Reconciliation (legacy/bozuk veri) ---
    // A) currentProject dolu ama proje yoksa populate sonucu null gelir -> AVAILABLE'a çek
    const danglingProjectEquipIds = equipment
      .filter((e: any) => e?.status === 'IN_USE' && e?.currentProject === null)
      .map((e: any) => e._id);

    if (danglingProjectEquipIds.length > 0) {
      await Equipment.updateMany(
        { _id: { $in: danglingProjectEquipIds } },
        { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } }
      ).catch((err: unknown) => {
        const error = err as AppError;
        logger.error('Dangling currentProject release hatası:', error);
      });
    }

    // B) IN_USE ama currentProject yoksa: aktif projelerde kullanılıyor mu kontrol et; kullanılmıyorsa release et
    const inUseNoProjectIds = equipment
      .filter((e: any) => e?.status === 'IN_USE' && (e.currentProject === undefined || e.currentProject === null))
      .map((e: any) => e._id);

    let toRelease: any[] = [];
    if (inUseNoProjectIds.length > 0) {
      const activeProjects = await Project.find({
        status: { $nin: ['COMPLETED', 'CANCELLED'] },
        equipment: { $in: inUseNoProjectIds },
      })
        .select('equipment')
        .lean()
        .catch(() => []);

      const used = new Set<string>();
      (activeProjects as any[]).forEach((p: any) => {
        (p.equipment || []).forEach((eid: any) => used.add(eid.toString()));
      });

      toRelease = inUseNoProjectIds.filter((eid: any) => !used.has(eid.toString()));
      if (toRelease.length > 0) {
        await Equipment.updateMany(
          { _id: { $in: toRelease } },
          { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } }
        ).catch((err: unknown) => {
          const error = err as AppError;
          logger.error('Legacy IN_USE release hatası:', error);
        });
      }
    }

    // Eğer release olduysa, response içindeki objeleri de düzelt (UI aynı response'da doğru görsün)
    const releasedSet = new Set<string>([
      ...danglingProjectEquipIds.map((x: any) => x.toString()),
      ...toRelease.map((x: any) => x.toString()),
    ]);
    const patchedEquipment = equipment.map((e: any) => {
      if (releasedSet.has(e._id?.toString?.() || '')) {
        return { ...e, status: 'AVAILABLE', currentProject: null };
      }
      return e;
    });

    res.status(200).json({
      success: true,
      count: patchedEquipment.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      equipment: patchedEquipment,
    });
  } catch (error) {
    logger.error('Ekipmanları listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ekipmanlar listelenirken bir hata oluştu',
    });
  }
};

// Tek bir ekipmanın detaylarını getir
export const getEquipmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz ekipman ID',
      });
    }

    let equipment: any = await Equipment.findById(id)
      .populate('responsibleUser', 'name email')
      .populate('currentProject', 'name status')
      .populate({
        path: 'maintenances',
        options: { sort: { scheduledDate: -1 } }
      });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Ekipman bulunamadı',
      });
    }

    // Detail sayfasında da legacy/dangling IN_USE düzeltmesi
    // - currentProject set ama proje yoksa populate null gelir -> release
    if (equipment.status === 'IN_USE' && equipment.currentProject === null) {
      await Equipment.updateOne(
        { _id: equipment._id },
        { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } }
      ).catch((err: unknown) => {
        const error = err as AppError;
        logger.error('Equipment detail dangling release hatası:', error);
      });
      equipment = await Equipment.findById(id)
        .populate('responsibleUser', 'name email')
        .populate('currentProject', 'name status')
        .populate({ path: 'maintenances', options: { sort: { scheduledDate: -1 } } });
    } else if (equipment && equipment.status === 'IN_USE' && (equipment.currentProject === undefined || equipment.currentProject === null)) {
      // - IN_USE ama currentProject yoksa ve aktif proje yoksa release
      const usedByActive = await Project.countDocuments({
        status: { $nin: ['COMPLETED', 'CANCELLED'] },
        equipment: equipment._id,
      }).catch(() => 0);
      if (!usedByActive) {
        await Equipment.updateOne(
          { _id: equipment._id },
          { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } }
        ).catch((err: unknown) => {
          const error = err as AppError;
          logger.error('Equipment detail legacy release hatası:', error);
        });
        equipment = await Equipment.findById(id)
          .populate('responsibleUser', 'name email')
          .populate('currentProject', 'name status')
          .populate({ path: 'maintenances', options: { sort: { scheduledDate: -1 } } });
      }
    }

    res.status(200).json({
      success: true,
      equipment,
    });
  } catch (error) {
    logger.error('Ekipman detayları hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ekipman detayları alınırken bir hata oluştu',
    });
  }
};

// Yeni ekipman oluştur
export const createEquipment = async (req: Request, res: Response) => {
  try {
    const { name, type, model, serialNumber, purchaseDate, status, location, notes, responsibleUser } = req.body;

    // Zorunlu alanları kontrol et
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Ekipman adı ve tipi gereklidir',
      });
    }

    // Ekipmanı oluştur
    const equipment = await Equipment.create({
      name,
      type,
      model,
      serialNumber,
      purchaseDate,
      status: status || 'AVAILABLE',
      location,
      notes,
      responsibleUser,
    });

    // Ekipman için otomatik QR oluştur ve equipment'e bağla
    // QR oluşturma hatasında ekipmanı geri al (QR zorunlu akış)
    const userId = (req.user as any)?._id;
    if (!userId) {
      await Equipment.findByIdAndDelete(equipment._id).catch(() => null);
      return res.status(401).json({
        success: false,
        message: 'QR oluşturmak için yetkili kullanıcı bulunamadı',
      });
    }

    let qrCodeDoc: any = null;
    let qrImage: string | null = null;
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const code = generateQRCodeContent('EQUIPMENT', equipment._id.toString());

        qrCodeDoc = await QRCode.create({
          code,
          type: 'EQUIPMENT',
          relatedId: equipment._id,
          relatedType: 'Equipment',
          title: `${name}${serialNumber ? ` - ${serialNumber}` : ''}`,
          description: model ? `Model: ${model}` : undefined,
          createdBy: userId,
          isActive: true,
        });

        qrImage = await generateQRCodeImage(code, { width: 420, margin: 2 });

        await Equipment.findByIdAndUpdate(
          equipment._id,
          { qrCodeId: qrCodeDoc._id, qrCodeValue: qrCodeDoc.code },
          { new: false }
        );
        break;
      } catch (err: unknown) {
        const error = err as AppError;
        const mongooseError = err as { code?: number | string };
        // Duplicate key: retry
        if (mongooseError?.code === 11000 && attempt < maxAttempts) {
          continue;
        }
        // Diğer hatalarda geri al
        logger.error('Ekipman QR oluşturma hatası:', error);
        await Equipment.findByIdAndDelete(equipment._id).catch(() => null);
        return res.status(500).json({
          success: false,
          message: 'Ekipman için QR kod oluşturulamadı. Lütfen tekrar deneyin.',
        });
      }
    }

    // Güncel ekipmanı dön (qr alanları ile)
    const equipmentWithQr = await Equipment.findById(equipment._id).populate('responsibleUser', 'name email');

    // Cache'i invalidate et
    await invalidateEquipmentCache();

    res.status(201).json({
      success: true,
      equipment: equipmentWithQr || equipment,
      qrCode: qrCodeDoc,
      qrImage,
    });
  } catch (error) {
    logger.error('Ekipman oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ekipman oluşturulurken bir hata oluştu',
    });
  }
};

// Ekipman güncelle
export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, model, serialNumber, purchaseDate, status, location, notes, responsibleUser } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz ekipman ID',
      });
    }

    // Mevcut ekipmanı al (versiyon geçmişi için)
    const oldEquipment = await Equipment.findById(id).lean();

    if (!oldEquipment) {
      return res.status(404).json({
        success: false,
        message: 'Ekipman bulunamadı',
      });
    }

    // Ekipmanı güncelle
    const updatedEquipment = await Equipment.findByIdAndUpdate(
      id,
      {
        name,
        type,
        model,
        serialNumber,
        purchaseDate,
        status,
        location,
        notes,
        responsibleUser,
      },
      { new: true, runValidators: true }
    ).populate('responsibleUser', 'name email');

    if (!updatedEquipment) {
      return res.status(404).json({
        success: false,
        message: 'Ekipman bulunamadı',
      });
    }

    // Versiyon geçmişi oluştur
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (userId && oldEquipment) {
      await createVersionHistory(
        'Equipment',
        updatedEquipment._id,
        oldEquipment,
        updatedEquipment.toObject(),
        new mongoose.Types.ObjectId(userId)
      ).catch((err: unknown) => {
        const error = err as AppError;
        logger.error('Versiyon geçmişi oluşturma hatası:', error);
      });
    }

    // Cache'i invalidate et
    await invalidateEquipmentCache();

    res.status(200).json({
      success: true,
      equipment: updatedEquipment,
    });
  } catch (error) {
    logger.error('Ekipman güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ekipman güncellenirken bir hata oluştu',
    });
  }
};

// Ekipman sil
export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz ekipman ID',
      });
    }

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Ekipman bulunamadı',
      });
    }

    // Ekipman kullanımda mı kontrol et
    if (equipment.status === 'IN_USE') {
      return res.status(400).json({
        success: false,
        message: 'Kullanımda olan ekipman silinemez',
      });
    }

    await equipment.deleteOne();

    // Cache'i invalidate et
    await invalidateEquipmentCache();

    // Audit log
    await logAction(req, 'DELETE', 'Equipment', id);

    res.status(200).json({
      success: true,
      message: 'Ekipman başarıyla silindi',
    });
  } catch (error) {
    logger.error('Ekipman silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ekipman silinirken bir hata oluştu',
    });
  }
}; 