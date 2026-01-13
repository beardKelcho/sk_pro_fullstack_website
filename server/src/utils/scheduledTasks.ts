import cron from 'node-cron';
import { Maintenance, Equipment } from '../models';
import { sendMaintenanceReminderEmail } from './emailService';
import { startAllScheduledReports } from '../controllers/reportSchedule.controller';
import logger from './logger';

// Bakım hatırlatma görevini çalıştır (her gün saat 09:00'da)
export const scheduleMaintenanceReminders = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      logger.info('Bakım hatırlatma görevi başlatıldı');
      
      // Sonraki 7 gün içinde planlanmış bakımları bul
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      
      const upcomingMaintenances = await Maintenance.find({
        status: 'SCHEDULED',
        scheduledDate: {
          $gte: today,
          $lte: sevenDaysLater,
        },
      })
        .populate('equipment', 'name type model')
        .populate('assignedTo', 'name email');
      
      // Her bakım için email gönder
      for (const maintenance of upcomingMaintenances) {
        if (maintenance.assignedTo && typeof maintenance.assignedTo === 'object') {
          const assignedUser = maintenance.assignedTo as any;
          const equipment = maintenance.equipment as any;
          
          if (assignedUser.email && equipment) {
            await sendMaintenanceReminderEmail(
              assignedUser.email,
              assignedUser.name,
              equipment.name || 'Ekipman',
              maintenance.scheduledDate
            );
          }
        }
      }
      
      logger.info(`${upcomingMaintenances.length} bakım hatırlatması gönderildi`);
    } catch (error) {
      logger.error('Bakım hatırlatma görevi hatası:', error);
    }
  });
  
  logger.info('Bakım hatırlatma görevi zamanlandı (Her gün 09:00)');
};

// Ekipman durum kontrolü (her gün saat 10:00'da)
export const scheduleEquipmentStatusCheck = () => {
  cron.schedule('0 10 * * *', async () => {
    try {
      logger.info('Ekipman durum kontrolü başlatıldı');
      
      // Bakımda olan ekipmanları kontrol et
      const maintenanceEquipment = await Equipment.find({ status: 'MAINTENANCE' });
      
      for (const equipment of maintenanceEquipment) {
        // Son bakım kaydını kontrol et
        const lastMaintenance = await Maintenance.findOne({
          equipment: equipment._id,
          status: 'COMPLETED',
        }).sort({ completedDate: -1 });
        
        // Eğer bakım tamamlandıysa ve 24 saatten fazla geçtiyse, durumu AVAILABLE yap
        if (lastMaintenance && lastMaintenance.completedDate) {
          const completedDate = new Date(lastMaintenance.completedDate);
          const now = new Date();
          const hoursSinceCompletion = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceCompletion > 24) {
            equipment.status = 'AVAILABLE';
            await equipment.save();
            logger.info(`Ekipman durumu güncellendi: ${equipment.name} -> AVAILABLE`);
          }
        }
      }
      
      logger.info('Ekipman durum kontrolü tamamlandı');
    } catch (error) {
      logger.error('Ekipman durum kontrolü hatası:', error);
    }
  });
  
  logger.info('Ekipman durum kontrolü zamanlandı (Her gün 10:00)');
};

// Tüm zamanlanmış görevleri başlat
export const startScheduledTasks = () => {
  if (process.env.NODE_ENV === 'production') {
    scheduleMaintenanceReminders();
    scheduleEquipmentStatusCheck();
    // Rapor zamanlamalarını başlat
    startAllScheduledReports().catch((error) => {
      logger.error('Rapor zamanlamaları başlatma hatası:', error);
    });
  }
};

