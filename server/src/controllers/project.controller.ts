import { Request, Response } from 'express';
import projectService, { PaginatedProjects } from '../services/project.service';
import logger from '../utils/logger';
import { AppError } from '../types/common';

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
      const project = await projectService.createProject(req.body);
      res.status(201).json({ success: true, project });
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
    try {
      const { id } = req.params;
      const project = await projectService.updateProject(id, req.body);
      res.status(200).json({ success: true, project });
    } catch (error: unknown) {
      logger.error('Proje güncelleme hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
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
