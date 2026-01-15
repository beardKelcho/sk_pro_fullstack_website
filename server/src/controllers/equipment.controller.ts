import { Request, Response } from 'express';
import { Equipment, QRCode } from '../models';
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
        .populate('responsibleUser', 'name email'),
        
      Equipment.countDocuments(filters)
    ]);
    
    res.status(200).json({
      success: true,
      count: equipment.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      equipment,
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
    
    const equipment = await Equipment.findById(id)
      .populate('responsibleUser', 'name email')
      .populate({
        path: 'maintenances',
        options: { sort: { startDate: -1 } }
      });
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Ekipman bulunamadı',
      });
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
      } catch (err: any) {
        // Duplicate key: retry
        if (err?.code === 11000 && attempt < maxAttempts) {
          continue;
        }
        // Diğer hatalarda geri al
        logger.error('Ekipman QR oluşturma hatası:', err);
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
      ).catch((err: any) => logger.error('Versiyon geçmişi oluşturma hatası:', err));
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