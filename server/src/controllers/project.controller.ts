import { Request, Response } from 'express';
import projectService, { PaginatedProjects } from '../services/project.service';
import logger from '../utils/logger';
import { AppError } from '../types/common';
import mongoose from 'mongoose';

export class ProjectController {

  // Tüm projeleri listele
  async getAllProjects(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sort, search, status, client } = req.query;

      const result: PaginatedProjects = await projectService.listProjects(
        parseInt(page as string, 10) || 1,
        parseInt(limit as string, 10) || 20,
        (sort as string) || '-startDate',
        search as string,
        status as string,
        client as string
      );

      res.status(200).json({
        success: true,
        count: result.projects.length,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        projects: result.projects
      });
    } catch (error: unknown) {
      logger.error('Proje listeleme hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }

  // Tek bir proje getir
  async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);
      res.status(200).json({ success: true, project });
    } catch (error: unknown) {
      logger.error('Proje detay hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }

  // Yeni proje oluştur
  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const { equipment, ...projectData } = req.body;
        const project = await projectService.createProject({ ...projectData, equipment }, session);

        if (equipment && equipment.length > 0) {
          const EquipmentModel = mongoose.model('Equipment');
          const InventoryLogModel = mongoose.model('InventoryLog');

          // Update equipment status
          await EquipmentModel.updateMany(
            { _id: { $in: equipment } },
            { $set: { status: 'IN_USE', currentProject: project._id } },
            { session }
          );

          // Create logs
          const logs = equipment.map((eqId: string) => ({
            equipment: eqId,
            user: (req as any).user._id, // Assuming authenticated request
            action: 'CHECK_OUT',
            project: project._id,
            quantityChanged: 0, // Serialized assumption for now
            notes: `Project Created: ${project.name}`,
            date: new Date()
          }));

          await InventoryLogModel.insertMany(logs, { session });
        }

        await session.commitTransaction();
        res.status(201).json({ success: true, project });
      } catch (error: any) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error: unknown) {
      logger.error('Proje oluşturma hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }

  // Proje güncelle
  async updateProject(req: Request, res: Response): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;

      // Get old project to compare equipment and status
      const oldProject = await projectService.getProjectById(id);

      const project = await projectService.updateProject(id, req.body, session);

      const EquipmentModel = mongoose.model('Equipment');
      const InventoryLogModel = mongoose.model('InventoryLog');

      // 1. Check if Status Changed to COMPLETED or CANCELLED
      if ((project.status === 'COMPLETED' || project.status === 'CANCELLED') && oldProject.status !== project.status) {
        if (project.equipment && project.equipment.length > 0) {
          const eqIds = project.equipment.map((e: any) => e._id);

          // Free all equipment
          await EquipmentModel.updateMany(
            { _id: { $in: eqIds } },
            { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } },
            { session }
          );

          // Log returns
          const logs = eqIds.map((eqId: any) => ({
            equipment: eqId,
            user: (req as any).user._id,
            action: 'CHECK_IN',
            project: project._id,
            quantityChanged: 0,
            notes: `Project ${project.status}: ${project.name}`,
            date: new Date()
          }));
          await InventoryLogModel.insertMany(logs, { session });
        }
      }
      // 2. If Project is Active/Pending, handle equipment changes
      else if (req.body.equipment) {
        const oldEqIds = (oldProject.equipment as any[]).map(e => e._id.toString());
        const newEqIds = (project.equipment as any[]).map(e => e._id.toString());

        const added = newEqIds.filter(id => !oldEqIds.includes(id));
        const removed = oldEqIds.filter(id => !newEqIds.includes(id));

        // Handle Added
        if (added.length > 0) {
          await EquipmentModel.updateMany(
            { _id: { $in: added } },
            { $set: { status: 'IN_USE', currentProject: project._id } },
            { session }
          );

          const addLogs = added.map((id: string) => ({
            equipment: id,
            user: (req as any).user._id,
            action: 'CHECK_OUT',
            project: project._id,
            quantityChanged: 0,
            notes: `Added to Project: ${project.name}`,
            date: new Date()
          }));
          await InventoryLogModel.insertMany(addLogs, { session });
        }

        // Handle Removed
        if (removed.length > 0) {
          await EquipmentModel.updateMany(
            { _id: { $in: removed } },
            { $set: { status: 'AVAILABLE' }, $unset: { currentProject: 1 } },
            { session }
          );

          const removeLogs = removed.map((id: string) => ({
            equipment: id,
            user: (req as any).user._id,
            action: 'CHECK_IN',
            project: project._id,
            quantityChanged: 0,
            notes: `Removed from Project: ${project.name}`,
            date: new Date()
          }));
          await InventoryLogModel.insertMany(removeLogs, { session });
        }
      }

      await session.commitTransaction();
      res.status(200).json({ success: true, project });
    } catch (error: unknown) {
      await session.abortTransaction();
      logger.error('Proje güncelleme hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    } finally {
      session.endSession();
    }
  }

  // Proje sil
  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await projectService.deleteProject(id);
      res.status(200).json({ success: true, message: 'Proje başarıyla silindi' });
    } catch (error: unknown) {
      logger.error('Proje silme hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }

  // İstatistiki verileri getir
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await projectService.getStats();
      res.status(200).json({ success: true, stats });
    } catch (error: unknown) {
      logger.error('İstatistik hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }
}

export default new ProjectController();
