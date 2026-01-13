import { Request, Response } from 'express';
import Widget from '../models/Widget';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { logAction, extractChanges } from '../utils/auditLogger';

/**
 * Kullanıcının tüm widget'larını getir
 */
export const getUserWidgets = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }

    const widgets = await Widget.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      widgets,
    });
  } catch (error) {
    logger.error('Widget listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Widget\'lar listelenirken bir hata oluştu',
    });
  }
};

/**
 * Tek bir widget getir
 */
export const getWidgetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id || (req.user as any)?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz widget ID',
      });
    }

    const widget = await Widget.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Widget bulunamadı',
      });
    }

    res.status(200).json({
      success: true,
      widget,
    });
  } catch (error) {
    logger.error('Widget detayları hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Widget detayları alınırken bir hata oluştu',
    });
  }
};

/**
 * Yeni widget oluştur
 */
export const createWidget = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }

    const { type, title, position, settings, isVisible, order } = req.body;

    if (!type || !title) {
      return res.status(400).json({
        success: false,
        message: 'Widget tipi ve başlığı gereklidir',
      });
    }

    // Varsayılan position ayarları
    const defaultPosition = {
      x: 0,
      y: 0,
      w: 4,
      h: 4,
      ...position,
    };

    // Order belirlenmemişse, en son order + 1
    let widgetOrder = order;
    if (widgetOrder === undefined) {
      const lastWidget = await Widget.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      }).sort({ order: -1 });
      widgetOrder = lastWidget ? lastWidget.order + 1 : 0;
    }

    const widget = await Widget.create({
      userId: new mongoose.Types.ObjectId(userId),
      type,
      title,
      position: defaultPosition,
      settings: settings || {},
      isVisible: isVisible !== undefined ? isVisible : true,
      order: widgetOrder,
    });

    await logAction(req, 'CREATE', 'Widget', widget._id.toString());

    res.status(201).json({
      success: true,
      widget,
    });
  } catch (error) {
    logger.error('Widget oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Widget oluşturulurken bir hata oluştu',
    });
  }
};

/**
 * Widget güncelle
 */
export const updateWidget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id || (req.user as any)?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz widget ID',
      });
    }

    const oldWidget = await Widget.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!oldWidget) {
      return res.status(404).json({
        success: false,
        message: 'Widget bulunamadı',
      });
    }

    const { title, position, settings, isVisible, order } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (position !== undefined) updateData.position = position;
    if (settings !== undefined) updateData.settings = settings;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (order !== undefined) updateData.order = order;

    const updatedWidget = await Widget.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    const changes = extractChanges(oldWidget.toObject(), updatedWidget?.toObject());
    await logAction(req, 'UPDATE', 'Widget', id, changes);

    res.status(200).json({
      success: true,
      widget: updatedWidget,
    });
  } catch (error) {
    logger.error('Widget güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Widget güncellenirken bir hata oluştu',
    });
  }
};

/**
 * Widget sil
 */
export const deleteWidget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id || (req.user as any)?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz widget ID',
      });
    }

    const widget = await Widget.findOneAndDelete({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!widget) {
      return res.status(404).json({
        success: false,
        message: 'Widget bulunamadı',
      });
    }

    await logAction(req, 'DELETE', 'Widget', id);

    res.status(200).json({
      success: true,
      message: 'Widget başarıyla silindi',
    });
  } catch (error) {
    logger.error('Widget silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Widget silinirken bir hata oluştu',
    });
  }
};

/**
 * Widget'ları toplu güncelle (sıralama ve pozisyon)
 */
export const updateWidgetsBulk = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }

    const { widgets } = req.body; // Array of { id, position, order, isVisible }

    if (!Array.isArray(widgets)) {
      return res.status(400).json({
        success: false,
        message: 'Widget\'lar array formatında olmalıdır',
      });
    }

    const updatePromises = widgets.map((widgetData: any) => {
      const { id, position, order, isVisible } = widgetData;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const updateData: any = {};
      if (position !== undefined) updateData.position = position;
      if (order !== undefined) updateData.order = order;
      if (isVisible !== undefined) updateData.isVisible = isVisible;

      return Widget.findOneAndUpdate(
        { _id: id, userId: new mongoose.Types.ObjectId(userId) },
        updateData,
        { new: true }
      );
    });

    await Promise.all(updatePromises.filter(p => p !== null));

    await logAction(req, 'UPDATE', 'Widget', 'bulk', [
      { field: 'bulk_update', oldValue: null, newValue: `${widgets.length} widgets updated` }
    ]);

    res.status(200).json({
      success: true,
      message: 'Widget\'lar başarıyla güncellendi',
    });
  } catch (error) {
    logger.error('Toplu widget güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Widget\'lar güncellenirken bir hata oluştu',
    });
  }
};

/**
 * Varsayılan widget'ları oluştur (kullanıcı için)
 */
export const createDefaultWidgets = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı kimlik doğrulaması gerekli',
      });
    }

    // Kullanıcının zaten widget'ları var mı kontrol et
    const existingWidgets = await Widget.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (existingWidgets > 0) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcının zaten widget\'ları mevcut',
      });
    }

    const defaultWidgets = [
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'STAT_CARD',
        title: 'Toplam Ekipman',
        position: { x: 0, y: 0, w: 3, h: 2 },
        settings: { statType: 'equipment_total' },
        isVisible: true,
        order: 0,
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'STAT_CARD',
        title: 'Toplam Projeler',
        position: { x: 3, y: 0, w: 3, h: 2 },
        settings: { statType: 'projects_total' },
        isVisible: true,
        order: 1,
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'STAT_CARD',
        title: 'Açık Görevler',
        position: { x: 6, y: 0, w: 3, h: 2 },
        settings: { statType: 'tasks_open' },
        isVisible: true,
        order: 2,
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'STAT_CARD',
        title: 'Müşteriler',
        position: { x: 9, y: 0, w: 3, h: 2 },
        settings: { statType: 'clients_total' },
        isVisible: true,
        order: 3,
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'PIE_CHART',
        title: 'Ekipman Durum Dağılımı',
        position: { x: 0, y: 2, w: 6, h: 4 },
        settings: { chartType: 'equipment_status' },
        isVisible: true,
        order: 4,
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'DONUT_CHART',
        title: 'Proje Durum Dağılımı',
        position: { x: 6, y: 2, w: 6, h: 4 },
        settings: { chartType: 'project_status' },
        isVisible: true,
        order: 5,
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'LINE_CHART',
        title: 'Görev Tamamlanma Trendi',
        position: { x: 0, y: 6, w: 6, h: 4 },
        settings: { chartType: 'task_completion' },
        isVisible: true,
        order: 6,
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'BAR_CHART',
        title: 'Aylık Aktivite',
        position: { x: 6, y: 6, w: 6, h: 4 },
        settings: { chartType: 'monthly_activity' },
        isVisible: true,
        order: 7,
      },
    ];

    const widgets = await Widget.insertMany(defaultWidgets);

    await logAction(req, 'CREATE', 'Widget', 'default', [
      { field: 'count', oldValue: null, newValue: widgets.length }
    ]);

    res.status(201).json({
      success: true,
      message: 'Varsayılan widget\'lar oluşturuldu',
      widgets,
    });
  } catch (error) {
    logger.error('Varsayılan widget oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Varsayılan widget\'lar oluşturulurken bir hata oluştu',
    });
  }
};

