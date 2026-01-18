import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Client, Equipment, Maintenance, Project, Task, User } from '../models';
import logger from '../utils/logger';

const parseDate = (raw: unknown): Date | null => {
  if (typeof raw !== 'string' || !raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const clampRange = (start: Date, end: Date, maxDays = 365) => {
  const ms = end.getTime() - start.getTime();
  const maxMs = maxDays * 24 * 60 * 60 * 1000;
  if (ms <= 0) return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
  if (ms > maxMs) return { start, end: new Date(start.getTime() + maxMs) };
  return { start, end };
};

const toDayKey = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

const collectionName = (model: any, fallback: string) => {
  return model?.collection?.name || fallback;
};

export const getAnalyticsDashboard = async (req: Request, res: Response) => {
  try {
    const endRaw = parseDate(req.query.to);
    const startRaw = parseDate(req.query.from);

    const end = endRaw || new Date();
    const startDefault = new Date(end);
    startDefault.setUTCMonth(startDefault.getUTCMonth() - 6);
    const start = startRaw || startDefault;

    const { start: rangeStart, end: rangeEnd } = clampRange(start, end, 365);
    const rangeMs = rangeEnd.getTime() - rangeStart.getTime();
    const prevStart = new Date(rangeStart.getTime() - rangeMs);
    const prevEnd = new Date(rangeStart.getTime());

    // Ensure DB is connected (should already be guarded by requireDbConnection)
    const dbConnected = mongoose.connection.readyState === 1;
    if (!dbConnected) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }

    // --- Projects ---
    const projectMatch = { startDate: { $gte: rangeStart, $lte: rangeEnd } };
    
    // Optimize edilmiş aggregation pipeline'ları
    const projectByStatusPipeline = optimizeAggregation([
      { $match: projectMatch },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    
    const projectByStatus = await Project.aggregate(projectByStatusPipeline, { allowDiskUse: true });

    const projectTrendPipeline = optimizeAggregation([
      { $match: projectMatch },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$startDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    
    const projectTrend = await Project.aggregate(projectTrendPipeline, { allowDiskUse: true });

    const topClients = await Project.aggregate([
      { $match: projectMatch },
      { $group: { _id: '$client', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: collectionName(Client, 'clients'),
          localField: '_id',
          foreignField: '_id',
          as: 'client',
        },
      },
      { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
      { $project: { clientId: '$_id', count: 1, name: '$client.name' } },
    ]);

    // Avg project duration (days)
    const avgProjectDurationAgg = await Project.aggregate([
      { $match: projectMatch },
      {
        $project: {
          durationDays: {
            $divide: [
              { $subtract: [{ $ifNull: ['$endDate', '$startDate'] }, '$startDate'] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      { $group: { _id: null, avg: { $avg: '$durationDays' } } },
    ]);
    const avgProjectDurationDays = avgProjectDurationAgg?.[0]?.avg ? Number(avgProjectDurationAgg[0].avg) : 0;

    // --- Tasks ---
    const taskMatch = { createdAt: { $gte: rangeStart, $lte: rangeEnd } };
    const tasksByStatus = await Task.aggregate([
      { $match: taskMatch },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const tasksByPriority = await Task.aggregate([
      { $match: taskMatch },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const tasksByAssignee = await Task.aggregate([
      { $match: taskMatch },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: collectionName(User, 'users'),
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { userId: '$_id', count: 1, name: '$user.name', email: '$user.email' } },
    ]);

    // Tasks completed per day (trend)
    const tasksCompletedTrend = await Task.aggregate([
      {
        $match: {
          completedDate: { $gte: rangeStart, $lte: rangeEnd },
          status: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Basic forecasting: next 7 days based on last 14-day average of completed tasks
    const forecastWindowEnd = toDayKey(rangeEnd);
    const forecastWindowStart = new Date(forecastWindowEnd.getTime() - 14 * 24 * 60 * 60 * 1000);
    const last14 = await Task.countDocuments({
      completedDate: { $gte: forecastWindowStart, $lte: forecastWindowEnd },
      status: 'COMPLETED',
    });
    const avgPerDay = last14 / 14;
    const forecastNext7 = Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(forecastWindowEnd.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
      return { day: day.toISOString().slice(0, 10), expectedCompleted: Math.round(avgPerDay) };
    });

    // --- Equipment ---
    const equipmentByStatus = await Equipment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const equipmentByType = await Equipment.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const inUseByProject = await Equipment.aggregate([
      { $match: { status: 'IN_USE', currentProject: { $exists: true, $ne: null } } },
      { $group: { _id: '$currentProject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: collectionName(Project, 'projects'),
          localField: '_id',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      { $project: { projectId: '$_id', count: 1, name: '$project.name', status: '$project.status' } },
    ]);

    // --- Maintenance ---
    const maintenanceMatch = { scheduledDate: { $gte: rangeStart, $lte: rangeEnd } };
    const maintenanceByStatus = await Maintenance.aggregate([
      { $match: maintenanceMatch },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const maintenanceByType = await Maintenance.aggregate([
      { $match: maintenanceMatch },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const maintenanceCostAgg = await Maintenance.aggregate([
      { $match: maintenanceMatch },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$cost', 0] } }, avg: { $avg: '$cost' } } },
    ]);
    const maintenanceCostTotal = maintenanceCostAgg?.[0]?.total ? Number(maintenanceCostAgg[0].total) : 0;
    const maintenanceCostAvg = maintenanceCostAgg?.[0]?.avg ? Number(maintenanceCostAgg[0].avg) : 0;
    const upcomingMaintenanceCount = await Maintenance.countDocuments({
      scheduledDate: { $gte: new Date(), $lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      status: { $in: ['SCHEDULED', 'IN_PROGRESS'] },
    });

    // --- Comparison (previous range) ---
    const prevProjects = await Project.countDocuments({ startDate: { $gte: prevStart, $lte: prevEnd } });
    const prevTasksCreated = await Task.countDocuments({ createdAt: { $gte: prevStart, $lte: prevEnd } });
    const prevTasksCompleted = await Task.countDocuments({ completedDate: { $gte: prevStart, $lte: prevEnd }, status: 'COMPLETED' });
    const curProjects = await Project.countDocuments({ startDate: { $gte: rangeStart, $lte: rangeEnd } });
    const curTasksCreated = await Task.countDocuments({ createdAt: { $gte: rangeStart, $lte: rangeEnd } });
    const curTasksCompleted = await Task.countDocuments({ completedDate: { $gte: rangeStart, $lte: rangeEnd }, status: 'COMPLETED' });

    const pct = (cur: number, prev: number) => {
      if (!prev) return cur ? 100 : 0;
      return ((cur - prev) / prev) * 100;
    };

    return res.status(200).json({
      success: true,
      range: {
        from: rangeStart.toISOString(),
        to: rangeEnd.toISOString(),
        prevFrom: prevStart.toISOString(),
        prevTo: prevEnd.toISOString(),
      },
      comparison: {
        projects: { current: curProjects, previous: prevProjects, changePct: pct(curProjects, prevProjects) },
        tasksCreated: { current: curTasksCreated, previous: prevTasksCreated, changePct: pct(curTasksCreated, prevTasksCreated) },
        tasksCompleted: { current: curTasksCompleted, previous: prevTasksCompleted, changePct: pct(curTasksCompleted, prevTasksCompleted) },
      },
      projects: {
        byStatus: projectByStatus.map((x: any) => ({ status: x._id, count: x.count })),
        trendByMonth: projectTrend.map((x: any) => ({ month: x._id, count: x.count })),
        topClients,
        avgDurationDays: avgProjectDurationDays,
      },
      tasks: {
        byStatus: tasksByStatus.map((x: any) => ({ status: x._id, count: x.count })),
        byPriority: tasksByPriority.map((x: any) => ({ priority: x._id, count: x.count })),
        byAssignee: tasksByAssignee,
        completedTrendByDay: tasksCompletedTrend.map((x: any) => ({ day: x._id, count: x.count })),
        forecastNext7Days: forecastNext7,
      },
      equipment: {
        byStatus: equipmentByStatus.map((x: any) => ({ status: x._id, count: x.count })),
        byType: equipmentByType.map((x: any) => ({ type: x._id, count: x.count })),
        inUseByProject,
      },
      maintenance: {
        byStatus: maintenanceByStatus.map((x: any) => ({ status: x._id, count: x.count })),
        byType: maintenanceByType.map((x: any) => ({ type: x._id, count: x.count })),
        cost: { total: maintenanceCostTotal, avg: maintenanceCostAvg },
        upcoming14d: upcomingMaintenanceCount,
      },
    });
  } catch (error) {
    logger.error('Analytics dashboard hatası:', error);
    return res.status(500).json({ success: false, message: 'Analytics verileri alınamadı' });
  }
};

