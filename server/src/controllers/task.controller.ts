import { Request, Response } from 'express';
import { Task, User } from '../models';
import mongoose from 'mongoose';
import { sendTaskAssignedEmail, sendTaskUpdatedEmail } from '../utils/emailService';
import { notifyUser } from '../utils/notificationService';
import logger from '../utils/logger';

// Tüm görevleri listele
export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const { status, priority, project, assignedTo, sort = '-createdAt', page = 1, limit = 10 } = req.query;
    
    const filters: any = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (priority) {
      filters.priority = priority;
    }
    
    if (project) {
      filters.project = project;
    }
    
    if (assignedTo) {
      filters.assignedTo = assignedTo;
    }
    
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;
    
    const sortField = (sort as string).startsWith('-') 
      ? (sort as string).substring(1) 
      : (sort as string);
    const sortOrder = (sort as string).startsWith('-') ? -1 : 1;
    
    const sortOptions: any = {};
    sortOptions[sortField] = sortOrder;
    
    const [tasks, total] = await Promise.all([
      Task.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .populate('project', 'name status')
        .populate('assignedTo', 'name email role'),
      Task.countDocuments(filters)
    ]);
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      tasks,
    });
  } catch (error) {
    logger.error('Görevleri listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Görevler listelenirken bir hata oluştu',
    });
  }
};

// Tek bir görevin detaylarını getir
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz görev ID',
      });
    }
    
    const task = await Task.findById(id)
      .populate('project', 'name status startDate endDate')
      .populate('assignedTo', 'name email role');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Görev bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    logger.error('Görev detayları hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Görev detayları alınırken bir hata oluştu',
    });
  }
};

// Yeni görev oluştur
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, project, assignedTo, status, priority, dueDate } = req.body;
    
    if (!title || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Görev başlığı ve atanan kişi gereklidir',
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz kullanıcı ID',
      });
    }
    
    if (project && !mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz proje ID',
      });
    }
    
    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate,
    });
    
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email');
    
    // Email ve bildirim gönder (async, hata olsa bile devam et)
    if (populatedTask?.assignedTo && typeof populatedTask.assignedTo === 'object') {
      const assignedUser = populatedTask.assignedTo as any;
      
      // Email gönder
      sendTaskAssignedEmail(
        assignedUser.email,
        assignedUser.name,
        populatedTask.title,
        populatedTask.description || '',
        populatedTask.dueDate
      ).catch(err => logger.error('Email gönderme hatası:', err));
      
      // Bildirim gönder
      notifyUser(
        assignedUser._id,
        'TASK_ASSIGNED',
        'Yeni Görev Atandı',
        `Size "${populatedTask.title}" görevi atandı.`,
        { taskId: populatedTask._id.toString() },
        false // Email zaten gönderildi
      ).catch(err => logger.error('Bildirim gönderme hatası:', err));
    }
    
    res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    logger.error('Görev oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Görev oluşturulurken bir hata oluştu',
    });
  }
};

// Görev güncelle
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, project, assignedTo, status, priority, dueDate, completedDate } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz görev ID',
      });
    }
    
    // Eski görevi al (değişiklik takibi için)
    const oldTask = await Task.findById(id);
    
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (project) updateData.project = project;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (dueDate) updateData.dueDate = dueDate;
    if (completedDate) updateData.completedDate = completedDate;
    
    // Eğer status COMPLETED ise ve completedDate yoksa, şimdiki zamanı ayarla
    if (status === 'COMPLETED' && !completedDate) {
      updateData.completedDate = new Date();
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('project', 'name status')
      .populate('assignedTo', 'name email');
    
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Görev bulunamadı',
      });
    }
    
    // Değişiklikleri tespit et ve bildirim gönder
    if (oldTask && updatedTask.assignedTo && typeof updatedTask.assignedTo === 'object') {
      const assignedUser = updatedTask.assignedTo as any;
      const changes: { field: string; oldValue: string; newValue: string }[] = [];
      
      if (oldTask.status !== updatedTask.status) {
        changes.push({
          field: 'Durum',
          oldValue: oldTask.status,
          newValue: updatedTask.status
        });
      }
      
      if (oldTask.priority !== updatedTask.priority) {
        changes.push({
          field: 'Öncelik',
          oldValue: oldTask.priority || 'Belirtilmemiş',
          newValue: updatedTask.priority || 'Belirtilmemiş'
        });
      }
      
      if (oldTask.dueDate?.toString() !== updatedTask.dueDate?.toString()) {
        changes.push({
          field: 'Son Tarih',
          oldValue: oldTask.dueDate ? new Date(oldTask.dueDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş',
          newValue: updatedTask.dueDate ? new Date(updatedTask.dueDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'
        });
      }
      
      // Değişiklik varsa email ve bildirim gönder
      if (changes.length > 0 && assignedUser.email) {
        sendTaskUpdatedEmail(
          assignedUser.email,
          assignedUser.name,
          updatedTask.title,
          changes
        ).catch(err => logger.error('Görev güncelleme email gönderme hatası:', err));
        
        notifyUser(
          assignedUser._id,
          'TASK_UPDATED',
          'Görev Güncellendi',
          `"${updatedTask.title}" görevi güncellendi.`,
          { taskId: updatedTask._id.toString(), changes },
          false // Email zaten gönderildi
        ).catch(err => logger.error('Görev güncelleme bildirim gönderme hatası:', err));
      }
    }
    
    res.status(200).json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    logger.error('Görev güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Görev güncellenirken bir hata oluştu',
    });
  }
};

// Görev sil
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz görev ID',
      });
    }
    
    const task = await Task.findById(id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Görev bulunamadı',
      });
    }
    
    await task.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Görev başarıyla silindi',
    });
  } catch (error) {
    logger.error('Görev silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Görev silinirken bir hata oluştu',
    });
  }
};

