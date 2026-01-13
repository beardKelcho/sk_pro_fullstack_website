import { Request, Response } from 'express';
import { Equipment, Project, Task, User, Maintenance } from '../models';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { logAction } from '../utils/auditLogger';

// Toplu silme
export const bulkDelete = async (req: Request, res: Response) => {
  try {
    const { resource, ids } = req.body;

    if (!resource || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Kaynak tipi ve ID listesi gereklidir',
      });
    }

    // Geçerli ID'leri filtrele
    const validIds = ids.filter((id: string) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli ID bulunamadı',
      });
    }

    let deletedCount = 0;
    let Model: any;

    // Model seçimi
    switch (resource.toLowerCase()) {
      case 'equipment':
        Model = Equipment;
        break;
      case 'project':
        Model = Project;
        break;
      case 'task':
        Model = Task;
        break;
      case 'user':
        Model = User;
        break;
      case 'maintenance':
        Model = Maintenance;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Geçersiz kaynak tipi',
        });
    }

    // Toplu silme
    const result = await Model.deleteMany({ _id: { $in: validIds } });
    deletedCount = result.deletedCount || 0;

    // Audit log
    for (const id of validIds) {
      await logAction(req, 'DELETE', resource as any, id);
    }

    res.status(200).json({
      success: true,
      deletedCount,
      message: `${deletedCount} öğe başarıyla silindi`,
    });
  } catch (error) {
    logger.error('Toplu silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Toplu silme işlemi sırasında bir hata oluştu',
    });
  }
};

// Toplu durum değiştirme
export const bulkUpdateStatus = async (req: Request, res: Response) => {
  try {
    const { resource, ids, status } = req.body;

    if (!resource || !Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({
        success: false,
        message: 'Kaynak tipi, ID listesi ve yeni durum gereklidir',
      });
    }

    // Geçerli ID'leri filtrele
    const validIds = ids.filter((id: string) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli ID bulunamadı',
      });
    }

    let Model: any;
    let statusField = 'status';

    // Model seçimi
    switch (resource.toLowerCase()) {
      case 'equipment':
        Model = Equipment;
        break;
      case 'project':
        Model = Project;
        break;
      case 'task':
        Model = Task;
        break;
      case 'user':
        Model = User;
        statusField = 'isActive';
        break;
      case 'maintenance':
        Model = Maintenance;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Geçersiz kaynak tipi',
        });
    }

    // User için özel durum (isActive boolean)
    const updateData: any = {};
    if (resource.toLowerCase() === 'user') {
      updateData.isActive = status === 'active' || status === true;
    } else {
      updateData[statusField] = status;
    }

    // Toplu güncelleme
    const result = await Model.updateMany(
      { _id: { $in: validIds } },
      { $set: updateData }
    );

    const updatedCount = result.modifiedCount || 0;

    // Audit log
    for (const id of validIds) {
      await logAction(req, 'UPDATE', resource as any, id, [
        {
          field: statusField,
          oldValue: 'unknown',
          newValue: status,
        },
      ]);
    }

    res.status(200).json({
      success: true,
      updatedCount,
      message: `${updatedCount} öğenin durumu güncellendi`,
    });
  } catch (error) {
    logger.error('Toplu durum güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Toplu durum güncelleme işlemi sırasında bir hata oluştu',
    });
  }
};

// Toplu atama (görevler için)
export const bulkAssign = async (req: Request, res: Response) => {
  try {
    const { resource, ids, assignedTo } = req.body;

    if (!resource || !Array.isArray(ids) || ids.length === 0 || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Kaynak tipi, ID listesi ve atanan kişi gereklidir',
      });
    }

    // Sadece task'lar için toplu atama
    if (resource.toLowerCase() !== 'task') {
      return res.status(400).json({
        success: false,
        message: 'Toplu atama sadece görevler için kullanılabilir',
      });
    }

    // Geçerli ID'leri filtrele
    const validIds = ids.filter((id: string) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli ID bulunamadı',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz kullanıcı ID',
      });
    }

    // Toplu atama
    const result = await Task.updateMany(
      { _id: { $in: validIds } },
      { $set: { assignedTo } }
    );

    const updatedCount = result.modifiedCount || 0;

    // Audit log
    for (const id of validIds) {
      await logAction(req, 'UPDATE', 'Task', id, [
        {
          field: 'assignedTo',
          oldValue: 'unknown',
          newValue: assignedTo,
        },
      ]);
    }

    res.status(200).json({
      success: true,
      updatedCount,
      message: `${updatedCount} görev atandı`,
    });
  } catch (error) {
    logger.error('Toplu atama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Toplu atama işlemi sırasında bir hata oluştu',
    });
  }
};

