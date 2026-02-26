import { Request, Response } from 'express';
import userService, { PaginatedUsers } from '../services/user.service';
import logger from '../utils/logger';
import { AppError, AuthenticatedRequest } from '../types/common';

export class UserController {

  // Tüm kullanıcıları listele
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role, search, sort, page, limit } = req.query;
      const requestUser = (req as AuthenticatedRequest).user;
      const excludeRole = requestUser?.role !== 'ADMIN' ? 'ADMIN' : undefined;

      const result: PaginatedUsers = await userService.listUsers(
        parseInt(page as string, 10) || 1,
        parseInt(limit as string, 10) || 10,
        (sort as string) || '-createdAt',
        search as string,
        role as string,
        excludeRole
      );

      res.status(200).json({
        success: true,
        count: result.users.length,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        users: result.users
      });
    } catch (error: unknown) {
      logger.error('Kullanıcıları listeleme hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message || 'Kullanıcılar listelenirken bir hata oluştu'
      });
    }
  }

  // Tek bir kullanıcının detaylarını getir
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.status(200).json({ success: true, user });
    } catch (error: unknown) {
      logger.error('Kullanıcı detayları hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }

  // Yeni kullanıcı oluştur
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const inviterName = (req as AuthenticatedRequest).user?.name;
      const user = await userService.createUser({
        ...req.body,
        inviterName
      });

      const userObject = user.toObject() as Record<string, unknown>;
      delete userObject.password;

      res.status(201).json({ success: true, user: userObject });
    } catch (error: unknown) {
      logger.error('Kullanıcı oluşturma hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }

  // Kullanıcı güncelle
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(id, req.body);

      const userObject = user.toObject() as Record<string, unknown>;
      delete userObject.password;

      res.status(200).json({ success: true, user: userObject });
    } catch (error: unknown) {
      logger.error('Kullanıcı güncelleme hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }

  // Kullanıcı sil
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const requestUserId = (req as AuthenticatedRequest).user?.id;

      // System Lock: ADMIN hesabı silinemez
      const targetUser = await userService.getUserById(id);
      if (targetUser && targetUser.role === 'ADMIN') {
        throw new AppError('Bu hesap sistem tarafından korunmaktadır', 403);
      }

      await userService.deleteUser(id, requestUserId);

      res.status(200).json({
        success: true,
        message: 'Kullanıcı başarıyla silindi'
      });
    } catch (error: unknown) {
      logger.error('Kullanıcı silme hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      res.status(appError.statusCode || 500).json({
        success: false,
        message: appError.message
      });
    }
  }
}

export default new UserController();
