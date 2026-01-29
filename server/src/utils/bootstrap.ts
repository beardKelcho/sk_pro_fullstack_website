import { SystemSetting } from '../models/SystemSetting';
import logger from './logger';

export const bootstrapSystemSettings = async () => {
    try {
        const maintenance = await SystemSetting.findOne({ key: 'maintenance_mode' });
        if (!maintenance) {
            await SystemSetting.create({
                key: 'maintenance_mode',
                value: { isMaintenanceMode: false },
                description: 'Site genel bakım modu ayarı'
            });
            logger.info('✅ Bootstrap: Default maintenance_mode setting created.');
        } else {
            logger.info('ℹ️ Bootstrap: maintenance_mode setting already exists.');
        }
    } catch (error) {
        logger.error('❌ Bootstrap Error (SystemSettings):', error);
        // Don't throw, let the server start even if this fails (though it might cause issues later)
    }
};
