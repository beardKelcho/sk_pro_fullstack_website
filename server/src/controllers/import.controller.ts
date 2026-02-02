import { Request, Response } from 'express';
import { AppError } from '../types/common';
import ExcelJS from 'exceljs';
import { Equipment, Project, Client, Task, Maintenance, User } from '../models';
import logger from '../utils/logger';
import { logAction } from '../utils/auditLogger';
import mongoose from 'mongoose';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; field: string; message: string }>;
  warnings: Array<{ row: number; field: string; message: string }>;
}

const parseFile = async (file: Express.Multer.File): Promise<any[]> => {
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  if (ext === 'xlsx' || ext === 'xls') {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);
    const worksheet = workbook.worksheets[0];
    const rows: any[] = [];
    const headers: string[] = [];
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.value?.toString() || '';
    });
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) rowData[header] = cell.value?.toString() || '';
      });
      if (Object.keys(rowData).length > 0) rows.push(rowData);
    });
    return rows;
  } else if (ext === 'csv') {
    const content = file.buffer.toString('utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });
      if (Object.keys(rowData).length > 0) rows.push(rowData);
    }
    return rows;
  } else if (ext === 'json') {
    const content = JSON.parse(file.buffer.toString('utf-8'));
    return Array.isArray(content) ? content : [content];
  }
  throw new Error('Desteklenmeyen dosya formatı (XLSX, CSV, JSON).');
};

const processImport = async (type: string, rows: any[], result: ImportResult, session: mongoose.ClientSession) => {
  // Mappings
  const statusMapping: Record<string, string> = {
    'Müsait': 'AVAILABLE', 'Kullanımda': 'IN_USE', 'Bakımda': 'MAINTENANCE', 'Hasarlı': 'DAMAGED',
    'Planlama': 'PENDING_APPROVAL', 'Onay Bekleyen': 'PENDING_APPROVAL', 'Onaylanan': 'APPROVED',
    'Aktif': 'ACTIVE', 'Ertelendi': 'ON_HOLD', 'Tamamlandı': 'COMPLETED', 'İptal': 'CANCELLED'
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;
    try {
      switch (type) {
        case 'inventory':
        case 'equipment':
          await Equipment.create([{
            name: row['Ad'] || row['Name'] || row['name'],
            type: row['Tip'] || row['Type'] || row['type'] || 'OTHER',
            model: row['Model'] || row['model'],
            serialNumber: row['Seri No'] || row['Serial Number'] || row['serialNumber'],
            status: statusMapping[row['Durum'] || row['Status'] || row['status']] || 'AVAILABLE',
            location: row['Konum'] || row['Location'] || row['location'], // This needs ObjectId lookup in real app, simplistic for now
            notes: row['Notlar'] || row['Notes'] || row['notes']
          }], { session });
          break;

        case 'projects':
          let clientId = row['client']; // if ID provided
          const clientName = row['Müşteri'] || row['Client'] || row['clientName'];
          if (!clientId && clientName) {
            let client = await Client.findOne({ name: clientName }).session(session);
            if (!client) {
              [client] = await Client.create([{ name: clientName }], { session });
            }
            clientId = client._id;
          }

          await Project.create([{
            name: row['Ad'] || row['Name'] || row['name'],
            description: row['Açıklama'] || row['Description'] || row['description'],
            startDate: row['Başlangıç'] || row['Start Date'] || row['startDate'] || new Date(),
            endDate: row['Bitiş'] || row['End Date'] || row['endDate'],
            status: statusMapping[row['Durum'] || row['Status'] || row['status']] || 'PLANNING',
            client: clientId,
            location: row['Konum'] || row['Location'] || row['location'],
            budget: row['Bütçe'] || row['Budget'] || row['budget']
          }], { session });
          break;

        default:
          throw new Error('Geçersiz import tipi');
      }
      result.success++;
    } catch (error: any) {
      result.failed++;
      result.errors.push({ row: rowNumber, field: 'general', message: error.message });
    }
  }
};

export const importData = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Dosya yüklenmedi' });

    // type body'den veya query'den gelebilir
    const type = req.body.type || req.query.type;
    if (!type) return res.status(400).json({ success: false, message: 'Import tipi (type) belirtilmedi' });

    const rows = await parseFile(req.file);
    const result: ImportResult = { success: 0, failed: 0, errors: [], warnings: [] };

    await processImport(type, rows, result, session);

    await session.commitTransaction();

    // Audit Log
    const entityMap: Record<string, any> = { 'inventory': 'Equipment', 'projects': 'Project' };
    await logAction(req, 'IMPORT', entityMap[type] || 'System', 'bulk', [{ field: 'result', oldValue: null, newValue: result }]);

    res.json({ success: true, message: `${result.success} kayıt başarıyla import edildi`, result });

  } catch (error: any) {
    await session.abortTransaction();
    logger.error('Import Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Import sırasında hata oluştu' });
  } finally {
    session.endSession();
  }
};

export const downloadTemplate = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template');

    let headers: any[] = [];
    if (type === 'inventory' || type === 'equipment') {
      headers = [
        { header: 'Ad', key: 'name', width: 20 },
        { header: 'Tip', key: 'type', width: 15 },
        { header: 'Model', key: 'model', width: 15 },
        { header: 'Seri No', key: 'serialNumber', width: 15 },
        { header: 'Durum', key: 'status', width: 15 },
        { header: 'Konum', key: 'location', width: 15 },
        { header: 'Notlar', key: 'notes', width: 20 }
      ];
    } else if (type === 'projects') {
      headers = [
        { header: 'Ad', key: 'name', width: 20 },
        { header: 'Açıklama', key: 'description', width: 20 },
        { header: 'Müşteri', key: 'client', width: 15 },
        { header: 'Başlangıç', key: 'startDate', width: 15 },
        { header: 'Bitiş', key: 'endDate', width: 15 },
        { header: 'Durum', key: 'status', width: 15 },
        { header: 'Konum', key: 'location', width: 15 },
        { header: 'Bütçe', key: 'budget', width: 15 }
      ];
    }

    worksheet.columns = headers;
    worksheet.addRow({}); // Empty row sample

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-template.xlsx`);
    await workbook.xlsx.write(res);
    res.end();

  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Template indirme hatası' });
  }
};

