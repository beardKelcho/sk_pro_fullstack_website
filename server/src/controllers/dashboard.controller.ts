import { Request, Response } from 'express';
import { Equipment, Project, Task, Client, Maintenance, User } from '../models';
import logger from '../utils/logger';

// Dashboard istatistiklerini getir
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalEquipment,
      availableEquipment,
      inUseEquipment,
      maintenanceEquipment,
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      openTasks,
      completedTasks,
      totalClients,
      activeClients,
      upcomingMaintenances,
      upcomingProjects
    ] = await Promise.all([
      // Ekipman istatistikleri
      Equipment.countDocuments(),
      Equipment.countDocuments({ status: 'AVAILABLE' }),
      Equipment.countDocuments({ status: 'IN_USE' }),
      Equipment.countDocuments({ status: 'MAINTENANCE' }),
      
      // Proje istatistikleri
      Project.countDocuments(),
      Project.countDocuments({ status: 'ACTIVE' }),
      Project.countDocuments({ status: 'COMPLETED' }),
      
      // Görev istatistikleri
      Task.countDocuments(),
      Task.countDocuments({ status: { $in: ['TODO', 'IN_PROGRESS'] } }),
      Task.countDocuments({ status: 'COMPLETED' }),
      
      // Müşteri istatistikleri
      Client.countDocuments(),
      Client.countDocuments(),
      
      // Yaklaşan bakımlar (30 gün içinde)
      Maintenance.find({
        status: { $in: ['SCHEDULED', 'IN_PROGRESS'] },
        scheduledDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })
        .populate('equipment', 'name type model')
        .populate('assignedTo', 'name email')
        .sort({ scheduledDate: 1 })
        .limit(5),
      
      // Yaklaşan projeler (30 gün içinde)
      Project.find({
        status: { $in: ['PLANNING', 'ACTIVE'] },
        startDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })
        .populate('client', 'name email')
        .sort({ startDate: 1 })
        .limit(5)
    ]);

    res.status(200).json({
      success: true,
      stats: {
        equipment: {
          total: totalEquipment,
          available: availableEquipment,
          inUse: inUseEquipment,
          maintenance: maintenanceEquipment
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects
        },
        tasks: {
          total: totalTasks,
          open: openTasks,
          completed: completedTasks
        },
        clients: {
          total: totalClients,
          active: activeClients
        }
      },
      upcomingMaintenances,
      upcomingProjects
    });
  } catch (error) {
    logger.error('Dashboard istatistikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard istatistikleri alınırken bir hata oluştu',
    });
  }
};

