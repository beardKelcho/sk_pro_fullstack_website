import { Request, Response } from 'express';
import { Equipment, Project, Task, Client, Maintenance, User } from '../models';
import logger from '../utils/logger';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { logAction } from '../utils/auditLogger';
import { AppError } from '../types/common';

// Helper: Get data based on type
const getDataByType = async (type: string) => {
  switch (type) {
    case 'inventory':
    case 'equipment':
      return {
        data: await Equipment.find().populate('responsibleUser', 'name email').lean(),
        headers: ['Ad', 'Tip', 'Model', 'Seri No', 'Durum', 'Konum', 'Notlar'],
        fields: ['name', 'type', 'model', 'serialNumber', 'status', 'location', 'notes'],
        filename: 'equipment'
      };
    case 'projects':
      return {
        data: await Project.find().populate('client', 'name email').populate('team', 'name email').lean(),
        headers: ['Ad', 'Açıklama', 'Müşteri', 'Başlangıç', 'Bitiş', 'Durum', 'Konum', 'Bütçe'],
        fields: ['name', 'description', 'client.name', 'startDate', 'endDate', 'status', 'location', 'budget'],
        filename: 'projects'
      };
    case 'tasks':
      return {
        data: await Task.find().populate('project', 'name').populate('assignedTo', 'name email').lean(),
        headers: ['Başlık', 'Açıklama', 'Proje', 'Atanan', 'Durum', 'Öncelik', 'Son Tarih'],
        fields: ['title', 'description', 'project.name', 'assignedTo.name', 'status', 'priority', 'dueDate'],
        filename: 'tasks'
      };
    case 'clients':
      return {
        data: await Client.find().lean(),
        headers: ['Ad', 'Email', 'Telefon', 'Adres', 'Notlar'],
        fields: ['name', 'email', 'phone', 'address', 'notes'],
        filename: 'clients'
      };
    case 'maintenance':
      return {
        data: await Maintenance.find().populate('equipment', 'name type').populate('assignedTo', 'name email').lean(),
        headers: ['Ekipman', 'Tip', 'Açıklama', 'Planlanan Tarih', 'Durum', 'Atanan', 'Maliyet'],
        fields: ['equipment.name', 'type', 'description', 'scheduledDate', 'status', 'assignedTo.name', 'cost'],
        filename: 'maintenance'
      };
    case 'users':
      return {
        data: await User.find().select('-password').lean(),
        headers: ['Ad', 'Email', 'Rol', 'Departman', 'Telefon', 'Durum'],
        fields: ['name', 'email', 'role', 'department', 'phone', 'status'],
        filename: 'users'
      };
    default:
      throw new AppError('Geçersiz veri tipi', 400);
  }
};

// Helper: Generate CSV
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

// Helper: Generate Excel
const generateExcel = async (data: any[], headers: string[], fields: string[], res: Response) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Export');

  worksheet.addRow(headers);
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0066CC' } };

  data.forEach((item) => {
    const row = fields.map(field => {
      return field.split('.').reduce((obj, key) => obj?.[key], item) || '';
    });
    worksheet.addRow(row);
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  await workbook.xlsx.write(res);
  res.end();
};

// Helper: Generate PDF
const generatePDF = (data: any[], headers: string[], fields: string[], title: string, res: Response) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);

  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown();

  const startX = 30;
  const rowHeight = 20;
  const colWidth = (doc.page.width - 60) / headers.length;

  // Headers
  let currentY = doc.y;
  doc.font('Helvetica-Bold').fontSize(10);
  headers.forEach((header, i) => {
    doc.text(header, startX + (i * colWidth), currentY, { width: colWidth, align: 'left' });
  });
  currentY += rowHeight;
  doc.moveTo(startX, currentY - 5).lineTo(doc.page.width - 30, currentY - 5).stroke();

  // Rows
  doc.font('Helvetica').fontSize(9);
  data.forEach((item) => {
    if (currentY > doc.page.height - 50) {
      doc.addPage({ layout: 'landscape' });
      currentY = 50;
    }

    fields.forEach((field, i) => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      doc.text(String(value || '').substring(0, 50), startX + (i * colWidth), currentY, { width: colWidth - 5, align: 'left', ellipsis: true });
    });
    currentY += rowHeight;
  });

  doc.end();
};

// Main Export Controller
export const exportData = async (req: Request, res: Response) => {
  try {
    const { type, format } = req.query; // format: csv, excel, pdf, json

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ success: false, message: 'Veri tipi (type) gereklidir' });
    }

    const { data, headers, fields, filename } = await getDataByType(type);
    const exportFormat = (format as string)?.toLowerCase() || 'csv';

    // Map type to Entity Name for Audit Log
    const entityMap: Record<string, any> = {
      'inventory': 'Equipment',
      'equipment': 'Equipment',
      'projects': 'Project',
      'tasks': 'Task',
      'clients': 'Client',
      'maintenance': 'Maintenance',
      'users': 'User'
    };
    const entityName = entityMap[type] || 'System';

    // Audit Log
    await logAction(req, 'EXPORT', entityName, 'all', [{ field: 'format', oldValue: null, newValue: exportFormat }]);

    switch (exportFormat) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}-export.json`);
        res.json(data);
        break;

      case 'excel':
      case 'xlsx':
        res.setHeader('Content-Disposition', `attachment; filename=${filename}-export.xlsx`);
        await generateExcel(data, headers, fields, res);
        break;

      case 'pdf':
        res.setHeader('Content-Disposition', `attachment; filename=${filename}-export.pdf`);
        generatePDF(data, headers, fields, `${filename.toUpperCase()} Raporu`, res);
        break;

      case 'csv':
      default:
        const csv = generateCSV(data, headers, fields);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}-export.csv`);
        res.write('\ufeff'); // BOM for Excel
        res.end(csv);
        break;
    }

    logger.info(`Data exported (${type} - ${exportFormat}) by user ${req.user?.id}`);

  } catch (error: any) {
    logger.error('Export Error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Export işlemi sırasında hata oluştu'
    });
  }
};

