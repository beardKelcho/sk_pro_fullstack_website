import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Project, Equipment, User } from '../models';
import logger from '../utils/logger';

export class ReportService {

    // ============================================
    // EXCEL RAPORLARI
    // ============================================

    public async generateInventoryExcel(): Promise<Buffer> {
        const items = await Equipment.find().lean();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Envanter Durumu');

        worksheet.columns = [
            { header: 'Ekipman Adı', key: 'name', width: 25 },
            { header: 'Marka & Model', key: 'brandModel', width: 25 },
            { header: 'Kategori', key: 'category', width: 20 },
            { header: 'Takip Tipi', key: 'trackingType', width: 15 },
            { header: 'Durum', key: 'status', width: 15 },
            { header: 'Stok Miktarı', key: 'quantity', width: 15 },
            { header: 'Seri No', key: 'serialNumber', width: 20 },
        ];

        // Başlık stili
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

        items.forEach(item => {
            let categoryName = '-';
            if (item.category) {
                if (typeof item.category === 'object' && (item.category as any).name) {
                    categoryName = (item.category as any).name;
                } else {
                    categoryName = String(item.category);
                }
            }

            worksheet.addRow({
                name: item.name,
                brandModel: `${item.brand || ''} ${item.model || ''}`.trim(),
                category: categoryName,
                trackingType: item.trackingType,
                status: item.status,
                quantity: item.quantity,
                serialNumber: item.serialNumber || '-',
            });
        });

        return await workbook.xlsx.writeBuffer() as unknown as Buffer;
    }

    public async generateProjectsExcel(): Promise<Buffer> {
        const projects = await Project.find().populate('customer').lean() as any[];

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Projeler & Maliyetler');

        worksheet.columns = [
            { header: 'Proje Adı', key: 'name', width: 30 },
            { header: 'Müşteri', key: 'customer', width: 25 },
            { header: 'Başlangıç Tarihi', key: 'startDate', width: 15 },
            { header: 'Bitiş Tarihi', key: 'endDate', width: 15 },
            { header: 'Durum', key: 'status', width: 15 },
            { header: 'Bütçe/Maliyet', key: 'budget', width: 20 },
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };

        projects.forEach(project => {
            let customerName = '-';
            if (project.customer) {
                customerName = (project.customer as any).name || (project.customer as any).companyName || '-';
            }

            worksheet.addRow({
                name: project.name,
                customer: customerName,
                startDate: project.startDate ? new Date(project.startDate).toLocaleDateString('tr-TR') : '-',
                endDate: project.endDate ? new Date(project.endDate).toLocaleDateString('tr-TR') : '-',
                status: project.status,
                budget: project.budget ? `${project.budget} ${project.budgetCurrency || '₺'}` : '-',
            });
        });

        return await workbook.xlsx.writeBuffer() as unknown as Buffer;
    }

    // ============================================
    // PDF RAPORLARI
    // ============================================

    public async generateInventoryPDF(): Promise<Buffer> {
        const items = await Equipment.find().lean();

        const doc = new jsPDF();
        doc.text('Envanter Durumu Raporu', 14, 15);
        doc.setFontSize(10);
        doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 22);

        const tableData = items.map(item => {
            let categoryName = '-';
            if (item.category) {
                if (typeof item.category === 'object' && (item.category as any).name) {
                    categoryName = (item.category as any).name;
                } else {
                    categoryName = String(item.category);
                }
            }

            return [
                item.name,
                `${item.brand || ''} ${item.model || ''}`.trim(),
                categoryName,
                item.status,
                item.trackingType === 'SERIALIZED' ? item.serialNumber || '-' : `${item.quantity} Adet`
            ];
        });

        (doc as any).autoTable({
            startY: 30,
            head: [['Ekipman Adı', 'Marka/Model', 'Kategori', 'Durum', 'Stok/Seri No']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] }
        });

        return Buffer.from(doc.output('arraybuffer')) as unknown as Buffer;
    }

    public async generateProjectsPDF(): Promise<Buffer> {
        const projects = await Project.find().populate('customer').lean() as any[];

        const doc = new jsPDF();
        doc.text('Projeler & Maliyetler Raporu', 14, 15);
        doc.setFontSize(10);
        doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 22);

        const tableData = projects.map(project => {
            let customerName = '-';
            if (project.customer) {
                customerName = (project.customer as any).name || (project.customer as any).companyName || '-';
            }

            return [
                project.name,
                customerName,
                project.startDate ? new Date(project.startDate).toLocaleDateString('tr-TR') : '-',
                project.status,
                project.budget ? `${project.budget} ${project.budgetCurrency || '₺'}` : '-'
            ];
        });

        (doc as any).autoTable({
            startY: 30,
            head: [['Proje Adı', 'Müşteri', 'Başlangıç', 'Durum', 'Bütçe']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [39, 174, 96] }
        });

        return Buffer.from(doc.output('arraybuffer'));
    }
}

export const reportService = new ReportService();
