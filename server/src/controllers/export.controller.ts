import { Request, Response } from 'express';
import { Equipment, Project, Task, Client, Maintenance } from '../models';
import logger from '../utils/logger';

// Excel export için (basit CSV formatı)
const generateCSV = (data: any[], headers: string[], fields: string[]): string => {
  const csvRows = [headers.join(',')];
  
  data.forEach((item) => {
    const row = fields.map(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      return `"${String(value || '').replace(/"/g, '""')}"`;
    });
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

// Ekipmanları export et
export const exportEquipment = async (req: Request, res: Response) => {
  try {
    const equipment = await Equipment.find()
      .populate('responsibleUser', 'name email')
      .lean();

    const headers = ['Ad', 'Tip', 'Model', 'Seri No', 'Durum', 'Konum', 'Sorumlu', 'Notlar'];
    const fields = ['name', 'type', 'model', 'serialNumber', 'status', 'location', 'responsibleUser.name', 'notes'];
    
    const csv = generateCSV(equipment, headers, fields);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=equipment-export.csv');
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
    
    // BOM ekle (Excel için Türkçe karakter desteği)
    res.write('\ufeff');
    res.end(csv, 'utf8');
    
    logger.info(`Ekipman export edildi by user ${req.user?.id}`);
  } catch (error) {
    logger.error('Ekipman export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Export işlemi sırasında bir hata oluştu',
    });
  }
};

// Projeleri export et
export const exportProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find()
      .populate('client', 'name email')
      .populate('team', 'name email')
      .lean();

    const headers = ['Ad', 'Açıklama', 'Müşteri', 'Başlangıç', 'Bitiş', 'Durum', 'Konum', 'Bütçe'];
    const fields = ['name', 'description', 'client.name', 'startDate', 'endDate', 'status', 'location', 'budget'];
    
    const csv = generateCSV(projects, headers, fields);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=projects-export.csv');
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
    
    res.write('\ufeff');
    res.end(csv, 'utf8');
    
    logger.info(`Proje export edildi by user ${req.user?.id}`);
  } catch (error) {
    logger.error('Proje export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Export işlemi sırasında bir hata oluştu',
    });
  }
};

// Görevleri export et
export const exportTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find()
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .lean();

    const headers = ['Başlık', 'Açıklama', 'Proje', 'Atanan', 'Durum', 'Öncelik', 'Son Tarih'];
    const fields = ['title', 'description', 'project.name', 'assignedTo.name', 'status', 'priority', 'dueDate'];
    
    const csv = generateCSV(tasks, headers, fields);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks-export.csv');
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
    
    res.write('\ufeff');
    res.end(csv, 'utf8');
    
    logger.info(`Görev export edildi by user ${req.user?.id}`);
  } catch (error) {
    logger.error('Görev export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Export işlemi sırasında bir hata oluştu',
    });
  }
};

// Müşterileri export et
export const exportClients = async (req: Request, res: Response) => {
  try {
    const clients = await Client.find().lean();

    const headers = ['Ad', 'Email', 'Telefon', 'Adres', 'Notlar'];
    const fields = ['name', 'email', 'phone', 'address', 'notes'];
    
    const csv = generateCSV(clients, headers, fields);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=clients-export.csv');
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
    
    res.write('\ufeff');
    res.end(csv, 'utf8');
    
    logger.info(`Müşteri export edildi by user ${req.user?.id}`);
  } catch (error) {
    logger.error('Müşteri export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Export işlemi sırasında bir hata oluştu',
    });
  }
};

// Bakımları export et
export const exportMaintenance = async (req: Request, res: Response) => {
  try {
    const maintenances = await Maintenance.find()
      .populate('equipment', 'name type')
      .populate('assignedTo', 'name email')
      .lean();

    const headers = ['Ekipman', 'Tip', 'Açıklama', 'Planlanan Tarih', 'Durum', 'Atanan', 'Maliyet'];
    const fields = ['equipment.name', 'type', 'description', 'scheduledDate', 'status', 'assignedTo.name', 'cost'];
    
    const csv = generateCSV(maintenances, headers, fields);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=maintenance-export.csv');
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
    
    res.write('\ufeff');
    res.end(csv, 'utf8');
    
    logger.info(`Bakım export edildi by user ${req.user?.id}`);
  } catch (error) {
    logger.error('Bakım export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Export işlemi sırasında bir hata oluştu',
    });
  }
};

