import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { Equipment, Project, Client } from '../models';
import logger from '../utils/logger';
import { logAction } from '../utils/auditLogger';
import mongoose from 'mongoose';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; field: string; message: string }>;
  warnings: Array<{ row: number; field: string; message: string }>;
}

/**
 * Excel/CSV dosyasını parse et
 */
const parseFile = async (file: Express.Multer.File): Promise<any[]> => {
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  
  if (ext === 'xlsx' || ext === 'xls') {
    return await parseExcel(file);
  } else if (ext === 'csv') {
    return await parseCSV(file);
  } else {
    throw new Error('Desteklenmeyen dosya formatı. Sadece Excel (.xlsx, .xls) ve CSV (.csv) dosyaları desteklenir.');
  }
};

/**
 * Excel dosyasını parse et
 */
const parseExcel = async (file: Express.Multer.File): Promise<any[]> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(file.buffer);
  
  const worksheet = workbook.worksheets[0];
  const rows: any[] = [];
  
  // İlk satırı header olarak al
  const headers: string[] = [];
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber - 1] = cell.value?.toString() || '';
  });
  
  // Diğer satırları parse et
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Header'ı atla
    
    const rowData: any = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) {
        rowData[header] = cell.value?.toString() || '';
      }
    });
    
    if (Object.keys(rowData).length > 0) {
      rows.push(rowData);
    }
  });
  
  return rows;
};

/**
 * CSV dosyasını parse et (basit parser)
 */
const parseCSV = async (file: Express.Multer.File): Promise<any[]> => {
  const content = file.buffer.toString('utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) return [];
  
  // İlk satırı header olarak al
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  // Diğer satırları parse et
  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const rowData: any = {};
    
    headers.forEach((header, index) => {
      rowData[header] = values[index] || '';
    });
    
    if (Object.keys(rowData).length > 0) {
      rows.push(rowData);
    }
  }
  
  return rows;
};

/**
 * Ekipman import
 */
export const importEquipment = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya yüklenmedi',
      });
    }

    const rows = await parseFile(req.file);
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      warnings: [],
    };

    // Ekipman tipi mapping (Türkçe -> İngilizce)
    const typeMapping: Record<string, string> = {
      'Video Switcher': 'VIDEO_SWITCHER',
      'Media Server': 'MEDIA_SERVER',
      'Medya Sunucu': 'MEDIA_SERVER',
      'Monitor': 'MONITOR',
      'Monitör': 'MONITOR',
      'Kablo': 'CABLE',
      'Ses Ekipmanı': 'AUDIO_EQUIPMENT',
    };

    // Durum mapping
    const statusMapping: Record<string, string> = {
      'Müsait': 'AVAILABLE',
      'Kullanımda': 'IN_USE',
      'Bakımda': 'MAINTENANCE',
      'Hasarlı': 'DAMAGED',
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 çünkü header var ve 0-indexed

      try {
        // Gerekli alanları kontrol et
        if (!row['Ad'] && !row['Name'] && !row['name']) {
          result.errors.push({
            row: rowNumber,
            field: 'name',
            message: 'Ad alanı zorunludur',
          });
          result.failed++;
          continue;
        }

        const name = row['Ad'] || row['Name'] || row['name'];
        const type = typeMapping[row['Tip'] || row['Type'] || row['type']] || row['Tip'] || row['Type'] || row['type'] || 'OTHER';
        const status = statusMapping[row['Durum'] || row['Status'] || row['status']] || row['Durum'] || row['Status'] || row['status'] || 'AVAILABLE';

        // Ekipman oluştur
        await Equipment.create({
          name,
          type,
          model: row['Model'] || row['model'] || undefined,
          serialNumber: row['Seri No'] || row['Serial Number'] || row['serialNumber'] || undefined,
          status,
          location: row['Konum'] || row['Location'] || row['location'] || undefined,
          notes: row['Notlar'] || row['Notes'] || row['notes'] || undefined,
        });

        result.success++;
      } catch (error: any) {
        result.errors.push({
          row: rowNumber,
          field: 'general',
          message: error.message || 'Bilinmeyen hata',
        });
        result.failed++;
      }
    }

    // Audit log
    await logAction(req, 'IMPORT', 'Equipment', 'bulk', [
      {
        field: 'import_result',
        oldValue: null,
        newValue: { success: result.success, failed: result.failed },
      },
    ]);

    logger.info(`Ekipman import edildi: ${result.success} başarılı, ${result.failed} başarısız by user ${req.user?.id}`);

    res.status(200).json({
      success: true,
      message: `${result.success} ekipman başarıyla import edildi`,
      result,
    });
  } catch (error: any) {
    logger.error('Ekipman import hatası:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Ekipman import edilirken bir hata oluştu',
    });
  }
};

/**
 * Proje import
 */
export const importProjects = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya yüklenmedi',
      });
    }

    const rows = await parseFile(req.file);
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      warnings: [],
    };

    // Durum mapping
    const statusMapping: Record<string, string> = {
      'Planlama': 'PLANNING',
      'Aktif': 'ACTIVE',
      'Tamamlandı': 'COMPLETED',
      'İptal': 'CANCELLED',
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      try {
        if (!row['Ad'] && !row['Name'] && !row['name']) {
          result.errors.push({
            row: rowNumber,
            field: 'name',
            message: 'Ad alanı zorunludur',
          });
          result.failed++;
          continue;
        }

        const name = row['Ad'] || row['Name'] || row['name'];
        const status = statusMapping[row['Durum'] || row['Status'] || row['status']] || row['Durum'] || row['Status'] || row['status'] || 'PLANNING';

        // Client ID'yi bul veya oluştur
        let clientId: mongoose.Types.ObjectId | undefined;
        const clientName = row['Müşteri'] || row['Client'] || row['client'];
        if (clientName) {
          let client = await Client.findOne({ name: clientName });
          if (!client) {
            client = await Client.create({
              name: clientName,
              email: row['Müşteri Email'] || row['Client Email'] || row['clientEmail'] || undefined,
              phone: row['Müşteri Telefon'] || row['Client Phone'] || row['clientPhone'] || undefined,
            });
          }
          clientId = client._id;
        }

        // Proje oluştur
        await Project.create({
          name,
          description: row['Açıklama'] || row['Description'] || row['description'] || undefined,
          startDate: row['Başlangıç Tarihi'] || row['Start Date'] || row['startDate'] || new Date(),
          endDate: row['Bitiş Tarihi'] || row['End Date'] || row['endDate'] || undefined,
          status,
          location: row['Konum'] || row['Location'] || row['location'] || undefined,
          client: clientId || undefined,
        });

        result.success++;
      } catch (error: any) {
        result.errors.push({
          row: rowNumber,
          field: 'general',
          message: error.message || 'Bilinmeyen hata',
        });
        result.failed++;
      }
    }

    await logAction(req, 'IMPORT', 'Project', 'bulk', [
      {
        field: 'import_result',
        oldValue: null,
        newValue: { success: result.success, failed: result.failed },
      },
    ]);

    logger.info(`Proje import edildi: ${result.success} başarılı, ${result.failed} başarısız by user ${req.user?.id}`);

    res.status(200).json({
      success: true,
      message: `${result.success} proje başarıyla import edildi`,
      result,
    });
  } catch (error: any) {
    logger.error('Proje import hatası:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Proje import edilirken bir hata oluştu',
    });
  }
};

/**
 * Template dosyası indir (örnek format için)
 */
export const downloadTemplate = async (req: Request, res: Response) => {
  try {
    const { type } = req.params; // equipment, project, task, client

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template');

    if (type === 'equipment') {
      worksheet.columns = [
        { header: 'Ad', key: 'name', width: 20 },
        { header: 'Tip', key: 'type', width: 20 },
        { header: 'Model', key: 'model', width: 20 },
        { header: 'Seri No', key: 'serialNumber', width: 20 },
        { header: 'Durum', key: 'status', width: 15 },
        { header: 'Konum', key: 'location', width: 20 },
        { header: 'Notlar', key: 'notes', width: 30 },
      ];
    } else if (type === 'project') {
      worksheet.columns = [
        { header: 'Ad', key: 'name', width: 20 },
        { header: 'Açıklama', key: 'description', width: 30 },
        { header: 'Başlangıç Tarihi', key: 'startDate', width: 20 },
        { header: 'Bitiş Tarihi', key: 'endDate', width: 20 },
        { header: 'Durum', key: 'status', width: 15 },
        { header: 'Konum', key: 'location', width: 20 },
        { header: 'Müşteri', key: 'client', width: 20 },
      ];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz template tipi',
      });
    }

    // Örnek satır ekle
    worksheet.addRow({});

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-template.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    logger.error('Template indirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Template indirilirken bir hata oluştu',
    });
  }
};

