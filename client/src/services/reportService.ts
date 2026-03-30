import apiClient from './api/axios';
import logger from '@/utils/logger';

class ReportService {
    async downloadInventoryReport(format: 'excel' | 'pdf'): Promise<void> {
        try {
            const response = await apiClient.get(`/reports/inventory/export?format=${format}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `envanter-raporu.${format === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            logger.error('Envanter raporu indirme hatası:', error);
            throw error;
        }
    }

    async downloadProjectsReport(format: 'excel' | 'pdf'): Promise<void> {
        try {
            const response = await apiClient.get(`/reports/projects/export?format=${format}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `projeler-raporu.${format === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            logger.error('Proje raporu indirme hatası:', error);
            throw error;
        }
    }
}

const reportService = new ReportService();
export default reportService;
