import { Request, Response } from 'express';
import { Equipment, Project, Task, Client, Maintenance } from '../models';
import logger from '../utils/logger';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { logAction } from '../utils/auditLogger';

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
    
    // Audit log
    await logAction(req, 'EXPORT', 'Equipment', 'all');
    
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

// Excel export için yardımcı fonksiyon
const generateExcel = async (
  data: any[],
  headers: string[],
  fields: string[],
  filename: string,
  res: Response
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Export');

  // Başlık satırı
  worksheet.addRow(headers);
  
  // Başlık stilini ayarla
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0066CC' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Veri satırları
  data.forEach((item) => {
    const row = fields.map(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      return value || '';
    });
    worksheet.addRow(row);
  });

  // Kolon genişliklerini ayarla
  headers.forEach((_, index) => {
    worksheet.getColumn(index + 1).width = 20;
  });

  // Response ayarları
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
};

// PDF export için yardımcı fonksiyon
const generatePDF = (
  data: any[],
  headers: string[],
  fields: string[],
  title: string,
  res: Response
): void => {
  const doc = new PDFDocument({ margin: 50 });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${title.replace(/\s+/g, '-')}-export.pdf`);

  doc.pipe(res);

  // Başlık
  doc.fontSize(20).text(title, { align: 'center' });
  doc.moveDown();

  // Tarih
  doc.fontSize(10).text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, { align: 'right' });
  doc.moveDown(2);

  // Tablo başlıkları
  const startX = 50;
  let startY = doc.y;
  const rowHeight = 20;
  const colWidth = 100;

  headers.forEach((header, index) => {
    doc.rect(startX + index * colWidth, startY, colWidth, rowHeight).stroke();
    doc.fontSize(10).font('Helvetica-Bold')
      .text(header, startX + index * colWidth + 5, startY + 5, { width: colWidth - 10 });
  });

  // Veri satırları
  data.forEach((item) => {
    startY = doc.y;
    if (startY > 700) {
      doc.addPage();
      startY = 50;
    }

    fields.forEach((field, colIndex) => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      doc.rect(startX + colIndex * colWidth, startY, colWidth, rowHeight).stroke();
      doc.fontSize(9).font('Helvetica')
        .text(String(value || ''), startX + colIndex * colWidth + 5, startY + 5, { 
          width: colWidth - 10,
          ellipsis: true
        });
    });
  });

  doc.end();
};

// Ekipmanları Excel olarak export et
export const exportEquipmentExcel = async (req: Request, res: Response) => {
  try {
    const equipment = await Equipment.find()
      .populate('responsibleUser', 'name email')
      .lean();

    const headers = ['Ad', 'Tip', 'Model', 'Seri No', 'Durum', 'Konum', 'Sorumlu', 'Notlar'];
    const fields = ['name', 'type', 'model', 'serialNumber', 'status', 'location', 'responsibleUser.name', 'notes'];
    
    await generateExcel(equipment, headers, fields, 'equipment-export', res);
    
    logger.info(`Ekipman Excel export edildi by user ${req.user?.id}`);
  } catch (error) {
    logger.error('Ekipman Excel export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Export işlemi sırasında bir hata oluştu',
    });
  }
};

// Ekipmanları PDF olarak export et
export const exportEquipmentPDF = async (req: Request, res: Response) => {
  try {
    const equipment = await Equipment.find()
      .populate('responsibleUser', 'name email')
      .lean();

    const headers = ['Ad', 'Tip', 'Model', 'Seri No', 'Durum', 'Konum', 'Sorumlu'];
    const fields = ['name', 'type', 'model', 'serialNumber', 'status', 'location', 'responsibleUser.name'];
    
    generatePDF(equipment, headers, fields, 'Ekipman Listesi', res);
    
    logger.info(`Ekipman PDF export edildi by user ${req.user?.id}`);
  } catch (error) {
    logger.error('Ekipman PDF export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Export işlemi sırasında bir hata oluştu',
    });
  }
};

// Projeleri Excel olarak export et
export const exportProjectsExcel = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find()
      .populate('client', 'name email')
      .populate('team', 'name email')
      .lean();

    const headers = ['Ad', 'Açıklama', 'Müşteri', 'Başlangıç', 'Bitiş', 'Durum', 'Konum'];
    const fields = ['name', 'description', 'client.name', 'startDate', 'endDate', 'status', 'location'];
    
    await generateExcel(projects, headers, fields, 'projects-export', res);
    
    logger.info(`Proje Excel export edildi by user ${req.user?.id}`);
  } catch (error) {
    logger.error('Proje Excel export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Export işlemi sırasında bir hata oluştu',
    });
  }
};

// Projeleri PDF olarak export et
export const exportProjectsPDF = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find()
      .populate('client', 'name email')
      .populate('team', 'name email')
      .lean();

    const headers = ['Ad', 'Müşteri', 'Başlangıç', 'Bitiş', 'Durum', 'Konum'];
    const fields = ['name', 'client.name', 'startDate', 'endDate', 'status', 'location'];
    
    generatePDF(projects, headers, fields, 'Proje Listesi', res);
    
    logger.info(`Proje PDF export edildi by user ${req.user?.id}`);
  } catch (error) {
    logger.error('Proje PDF export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Export işlemi sırasında bir hata oluştu',
    });
  }
};

// Dashboard özet raporu PDF
export const exportDashboardPDF = async (req: Request, res: Response) => {
  try {
    const [
      totalEquipment,
      availableEquipment,
      inUseEquipment,
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      openTasks,
      completedTasks
    ] = await Promise.all([
      Equipment.countDocuments(),
      Equipment.countDocuments({ status: 'AVAILABLE' }),
      Equipment.countDocuments({ status: 'IN_USE' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'ACTIVE' }),
      Project.countDocuments({ status: 'COMPLETED' }),
      Task.countDocuments(),
      Task.countDocuments({ status: { $in: ['TODO', 'IN_PROGRESS'] } }),
      Task.countDocuments({ status: 'COMPLETED' })
    ]);

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=dashboard-report.pdf');

    doc.pipe(res);

    // Başlık
    doc.fontSize(24).text('SK Production Dashboard Raporu', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, { align: 'center' });
    doc.moveDown(2);

    // İstatistikler
    doc.fontSize(18).text('Genel İstatistikler', { underline: true });
    doc.moveDown();

    doc.fontSize(14).text('Ekipman', { underline: true });
    doc.fontSize(12).text(`Toplam: ${totalEquipment}`);
    doc.text(`Müsait: ${availableEquipment}`);
    doc.text(`Kullanımda: ${inUseEquipment}`);
    doc.moveDown();

    doc.fontSize(14).text('Projeler', { underline: true });
    doc.fontSize(12).text(`Toplam: ${totalProjects}`);
    doc.text(`Aktif: ${activeProjects}`);
    doc.text(`Tamamlanan: ${completedProjects}`);
    doc.moveDown();

    doc.fontSize(14).text('Görevler', { underline: true });
    doc.fontSize(12).text(`Toplam: ${totalTasks}`);
    doc.text(`Açık: ${openTasks}`);
    doc.text(`Tamamlanan: ${completedTasks}`);
    doc.moveDown(2);

    doc.fontSize(10).fillColor('#666666').text('Bu rapor SK Production yönetim sistemi tarafından otomatik olarak oluşturulmuştur.', 
      { align: 'center' });

    doc.end();
    
    logger.info(`Dashboard PDF export edildi by user ${req.user?.id}`);
  } catch (error) {
    logger.error('Dashboard PDF export hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Export işlemi sırasında bir hata oluştu',
    });
  }
};

