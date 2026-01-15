import { Request, Response } from 'express';
import { Equipment, Project, Task, Client, Maintenance } from '../models';
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

// Grafik verileri için endpoint
export const getDashboardCharts = async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query; // Varsayılan 30 gün
    const days = parseInt(period as string, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aylık aktivite verileri (son N gün)
    const activityData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const [projectsCreated, tasksCreated, equipmentAdded] = await Promise.all([
        Project.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
        Task.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
        Equipment.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } })
      ]);

      activityData.push({
        date: dayStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        projects: projectsCreated,
        tasks: tasksCreated,
        equipment: equipmentAdded
      });
    }

    // Ekipman durum dağılımı
    const equipmentStatus = await Equipment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Proje durum dağılımı
    const projectStatus = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Görev durum dağılımı
    const taskStatus = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Görev tamamlanma trendi (son N gün)
    const taskCompletionTrend = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const completed = await Task.countDocuments({
        status: 'COMPLETED',
        completedDate: { $gte: dayStart, $lte: dayEnd }
      });

      taskCompletionTrend.push({
        date: dayStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        completed
      });
    }

    // Ekipman kullanım oranları
    const totalEquipment = await Equipment.countDocuments();
    const equipmentUsage = totalEquipment > 0 ? {
      available: ((await Equipment.countDocuments({ status: 'AVAILABLE' })) / totalEquipment * 100).toFixed(1),
      inUse: ((await Equipment.countDocuments({ status: 'IN_USE' })) / totalEquipment * 100).toFixed(1),
      maintenance: ((await Equipment.countDocuments({ status: 'MAINTENANCE' })) / totalEquipment * 100).toFixed(1),
      damaged: ((await Equipment.countDocuments({ status: 'DAMAGED' })) / totalEquipment * 100).toFixed(1)
    } : { available: '0', inUse: '0', maintenance: '0', damaged: '0' };

    // Görev tamamlanma verisini hem taskCompletionTrend hem de taskCompletion olarak döndür
    // Frontend uyumluluğu için
    const taskCompletion = taskCompletionTrend.map(item => ({
      ...item,
      total: item.completed, // Toplam görev sayısı için completed kullan (tahmini)
    }));

    res.status(200).json({
      success: true,
      charts: {
        activityData,
        equipmentStatus: equipmentStatus.map(item => ({
          name: item._id,
          value: item.count
        })),
        projectStatus: projectStatus.map(item => ({
          name: item._id,
          value: item.count
        })),
        taskStatus: taskStatus.map(item => ({
          name: item._id,
          value: item.count
        })),
        taskCompletionTrend,
        taskCompletion, // Frontend uyumluluğu için
        monthlyActivity: activityData.map(item => ({
          date: item.date,
          count: item.projects + item.tasks + item.equipment
        })),
        equipmentUsage
      }
    });
  } catch (error) {
    logger.error('Dashboard grafik verileri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard grafik verileri alınırken bir hata oluştu',
    });
  }
};

