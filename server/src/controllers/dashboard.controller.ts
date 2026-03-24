import { Request, Response } from 'express';
import { Equipment, Project, Task, Client, Maintenance } from '../models';
import logger from '../utils/logger';
import { optimizeAggregation } from '../utils/aggregationOptimizer';

// Dashboard istatistiklerini getir
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Aggregate Equipment Stats (Sum of quantities)
    const equipmentStatsResult = await Equipment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
          available: {
            $sum: { $cond: [{ $eq: ["$status", "AVAILABLE"] }, "$quantity", 0] }
          },
          inUse: {
            $sum: { $cond: [{ $eq: ["$status", "IN_USE"] }, "$quantity", 0] }
          },
          maintenance: {
            $sum: { $cond: [{ $eq: ["$status", "MAINTENANCE"] }, "$quantity", 0] }
          }
        }
      }
    ]);
    const eqStats = equipmentStatsResult[0] || { total: 0, available: 0, inUse: 0, maintenance: 0 };

    // 8 sorgu yerine 5 paralel sorgu: Proje ve Görev sayımları tek aggregation'a indirildi
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const [
      projectStatsResult,
      taskStatsResult,
      totalClients,
      upcomingMaintenances,
      upcomingProjects
    ] = await Promise.all([

      // Proje istatistikleri: 3 countDocuments → tek aggregation
      Project.aggregate([{
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } }
        }
      }]),

      // Görev istatistikleri: 3 countDocuments → tek aggregation
      Task.aggregate([{
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: {
            $sum: {
              $cond: [{ $in: ['$status', ['TODO', 'IN_PROGRESS']] }, 1, 0]
            }
          },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } }
        }
      }]),

      // Müşteri sayısı: tek sorgu (activeClients = totalClients, filtre farkı yoktu)
      Client.countDocuments(),

      // Yaklaşan bakımlar (30 gün içinde)
      Maintenance.find({
        status: { $in: ['SCHEDULED', 'IN_PROGRESS'] },
        scheduledDate: { $gte: now, $lte: thirtyDaysFromNow }
      })
        .populate('equipment', 'name type model')
        .populate('assignedTo', 'name email')
        .sort({ scheduledDate: 1 })
        .limit(5),

      // Yaklaşan projeler (30 gün içinde)
      Project.find({
        status: { $in: ['PLANNING', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE'] },
        startDate: { $gte: now, $lte: thirtyDaysFromNow }
      })
        .populate('client', 'name email')
        .sort({ startDate: 1 })
        .limit(5)
    ]);

    const pStats = projectStatsResult[0] ?? { total: 0, active: 0, completed: 0 };
    const tStats = taskStatsResult[0] ?? { total: 0, open: 0, completed: 0 };

    const totalProjects = pStats.total;
    const activeProjects = pStats.active;
    const completedProjects = pStats.completed;
    const totalTasks = tStats.total;
    const openTasks = tStats.open;
    const completedTasks = tStats.completed;

    res.status(200).json({
      success: true,
      stats: {
        equipment: {
          total: eqStats.total,
          available: eqStats.available,
          inUse: eqStats.inUse,
          maintenance: eqStats.maintenance
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
          active: totalClients
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

    // Zaman aralığını belirle
    const rangeStart = new Date();
    rangeStart.setDate(rangeStart.getDate() - days + 1);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date();
    rangeEnd.setHours(23, 59, 59, 999);

    const matchStage = { $match: { createdAt: { $gte: rangeStart, $lte: rangeEnd } } };
    const groupStage = {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Europe/Istanbul" } },
        count: { $sum: 1 }
      }
    };

    const taskCompletionMatchStage = { 
      $match: { 
        status: 'COMPLETED',
        completedDate: { $gte: rangeStart, $lte: rangeEnd } 
      } 
    };
    const taskCompletionGroupStage = {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedDate", timezone: "Europe/Istanbul" } },
        count: { $sum: 1 }
      }
    };

    // Tüm datayı tek seferde aggregation ile çek (Günde 120+ sorgudan 4 sorguya indirildi)
    const [projectsDaily, tasksDaily, equipmentDaily, taskCompletionDaily] = await Promise.all([
      Project.aggregate([matchStage, groupStage]),
      Task.aggregate([matchStage, groupStage]),
      Equipment.aggregate([matchStage, groupStage]),
      Task.aggregate([taskCompletionMatchStage, taskCompletionGroupStage])
    ]);

    const projectsMap = new Map(projectsDaily.map(item => [item._id, item.count]));
    const tasksMap = new Map(tasksDaily.map(item => [item._id, item.count]));
    const equipmentMap = new Map(equipmentDaily.map(item => [item._id, item.count]));
    const taskCompMap = new Map(taskCompletionDaily.map(item => [item._id, item.count]));

    const activityData: Array<{ date: string; projects: number; tasks: number; equipment: number }> = [];
    const taskCompletionTrend: Array<{ date: string; completed: number }> = [];

    // Verileri frontend formatına hazırla (Boş günleri 0 ile doldur)
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      
      const pOffset = dayStart.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(dayStart.getTime() - pOffset)).toISOString().split('T')[0];
      const dateKey = localISOTime;

      const dateLabel = dayStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

      activityData.push({
        date: dateLabel,
        projects: projectsMap.get(dateKey) || 0,
        tasks: tasksMap.get(dateKey) || 0,
        equipment: equipmentMap.get(dateKey) || 0
      });

      taskCompletionTrend.push({
        date: dateLabel,
        completed: taskCompMap.get(dateKey) || 0
      });
    }

    // Ekipman durum dağılımı (optimize edilmiş)
    const equipmentStatusPipeline = optimizeAggregation([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    const equipmentStatus = await Equipment.aggregate(equipmentStatusPipeline);

    // Proje durum dağılımı (optimize edilmiş)
    const projectStatusPipeline = optimizeAggregation([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    const projectStatus = await Project.aggregate(projectStatusPipeline);

    // Görev durum dağılımı (optimize edilmiş)
    const taskStatusPipeline = optimizeAggregation([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    const taskStatus = await Task.aggregate(taskStatusPipeline);

    // Ekipman kullanım oranları (Miktar bazlı aggregate)
    const usageStatsResult = await Equipment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
          available: { $sum: { $cond: [{ $eq: ["$status", "AVAILABLE"] }, "$quantity", 0] } },
          inUse: { $sum: { $cond: [{ $eq: ["$status", "IN_USE"] }, "$quantity", 0] } },
          maintenance: { $sum: { $cond: [{ $eq: ["$status", "MAINTENANCE"] }, "$quantity", 0] } },
          damaged: { $sum: { $cond: [{ $eq: ["$status", "DAMAGED"] }, "$quantity", 0] } }
        }
      }
    ]);
    const us = usageStatsResult[0] || { total: 0, available: 0, inUse: 0, maintenance: 0, damaged: 0 };
    const totalEq = us.total || 1; // avoid division by zero

    const equipmentUsage = {
      available: ((us.available / totalEq) * 100).toFixed(1),
      inUse: ((us.inUse / totalEq) * 100).toFixed(1),
      maintenance: ((us.maintenance / totalEq) * 100).toFixed(1),
      damaged: ((us.damaged / totalEq) * 100).toFixed(1)
    };

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
          name: (item as Record<string, unknown>)._id,
          value: item.count
        })),
        // Legacy normalize: PLANNING -> PENDING_APPROVAL (chart'ta Planlama görünmesin)
        projectStatus: projectStatus.map(item => ({
          name: (item as Record<string, unknown>)._id === 'PLANNING' ? 'PENDING_APPROVAL' : (item as Record<string, unknown>)._id,
          value: item.count
        })),
        taskStatus: taskStatus.map(item => ({
          name: (item as Record<string, unknown>)._id,
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

