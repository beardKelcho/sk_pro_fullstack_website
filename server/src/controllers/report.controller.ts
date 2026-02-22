import { Request, Response } from 'express';
import { reportService } from '../services/report.service';
import logger from '../utils/logger';

export const exportInventoryReport = async (req: Request, res: Response) => {
    try {
        const format = req.query.format as string || 'excel'; // 'excel' or 'pdf'

        if (format === 'pdf') {
            const buffer = await reportService.generateInventoryPDF();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=envanter-raporu.pdf');
            return res.send(buffer);
        } else {
            const buffer = await reportService.generateInventoryExcel();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=envanter-raporu.xlsx');
            return res.send(buffer);
        }
    } catch (error) {
        logger.error('Inventory report export hatası:', error);
        res.status(500).json({ message: 'Rapor oluşturulurken bir hata oluştu.' });
    }
};

export const exportProjectsReport = async (req: Request, res: Response) => {
    try {
        const format = req.query.format as string || 'excel';

        if (format === 'pdf') {
            const buffer = await reportService.generateProjectsPDF();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=projeler-raporu.pdf');
            return res.send(buffer);
        } else {
            const buffer = await reportService.generateProjectsExcel();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=projeler-raporu.xlsx');
            return res.send(buffer);
        }
    } catch (error) {
        logger.error('Projects report export hatası:', error);
        res.status(500).json({ message: 'Rapor oluşturulurken bir hata oluştu.' });
    }
};
