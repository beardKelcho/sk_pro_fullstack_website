import { Request } from 'express';
import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog';
import logger from './logger';

export interface AuditLogData {
  user: string | null; // User ID (null for system actions)
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'IMPORT' | 'LOGIN' | 'LOGOUT' | 'PERMISSION_CHANGE';
  resource: 'Equipment' | 'Project' | 'Task' | 'User' | 'Client' | 'Maintenance' | 'SiteImage' | 'SiteContent' | 'QRCode' | 'Notification' | 'PushSubscription' | 'NotificationSettings' | 'Widget' | 'System' | 'ReportSchedule' | 'SavedSearch' | 'Session';
  resourceId: string;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    method?: string;
    endpoint?: string;
    [key: string]: any;
  };
}

/**
 * Create an audit log entry
 */
export const createAuditLog = async (data: AuditLogData): Promise<void> => {
  try {
    // resourceId'yi ObjectId'ye çevir (string ise)
    let resourceIdObjectId: mongoose.Types.ObjectId;
    if (typeof data.resourceId === 'string') {
      if (mongoose.Types.ObjectId.isValid(data.resourceId)) {
        resourceIdObjectId = new mongoose.Types.ObjectId(data.resourceId);
      } else {
        logger.warn('Geçersiz resourceId formatı:', data.resourceId);
        return; // Geçersiz ID ise audit log oluşturma
      }
    } else {
      resourceIdObjectId = data.resourceId as mongoose.Types.ObjectId;
    }

    await AuditLog.create({
      user: data.user,
      action: data.action,
      resource: data.resource,
      resourceId: resourceIdObjectId,
      changes: data.changes || [],
      metadata: data.metadata || {},
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main flow
    logger.error('Audit log oluşturma hatası:', error);
  }
};

/**
 * Express request'ten audit log oluşturur
 * @param req - Express request objesi
 * @param action - Yapılan işlem (CREATE, UPDATE, DELETE, vb.)
 * @param resource - Kaynak tipi (Equipment, Project, vb.)
 * @param resourceId - Kaynak ID
 * @param changes - Değişiklikler (opsiyonel)
 * @example
 * await logAction(req, 'CREATE', 'Equipment', equipmentId, changes);
 */
export const logAction = async (
  req: Request,
  action: AuditLogData['action'],
  resource: AuditLogData['resource'],
  resourceId: string,
  changes?: AuditLogData['changes']
): Promise<void> => {
  try {
    // User ID'yi al, yoksa null kullan (system actions için)
    const userId = (req.user as any)?.id || (req.user as any)?._id?.toString() || null;
    
    // userId'nin geçerli bir ObjectId olup olmadığını kontrol et
    let validUserId: string | null = null;
    if (userId && typeof userId === 'string' && /^[0-9a-f]{24}$/i.test(userId)) {
      validUserId = userId;
    }
    
    await createAuditLog({
      user: validUserId || null, // null olabilir (system actions için)
      action,
      resource,
      resourceId,
      changes,
      metadata: {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        method: req.method,
        endpoint: req.originalUrl || req.url,
      },
    });
  } catch (error) {
    // Audit log hatası ana işlemi engellemesin - sadece logla
    logger.error('Audit log oluşturma hatası:', error);
  }
};

/**
 * İki objeyi karşılaştırır ve değişiklikleri çıkarır
 * @param oldData - Eski veri
 * @param newData - Yeni veri
 * @returns Değişiklikler dizisi
 * @example
 * const changes = extractChanges(oldEquipment, newEquipment);
 * // [{ field: 'name', oldValue: 'Old Name', newValue: 'New Name' }]
 */
export const extractChanges = (oldData: any, newData: any): AuditLogData['changes'] => {
  const changes: AuditLogData['changes'] = [];
  
  if (!oldData || !newData) {
    return changes;
  }

  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  
  allKeys.forEach((key) => {
    // Skip internal fields
    if (['_id', '__v', 'createdAt', 'updatedAt', 'password'].includes(key)) {
      return;
    }

    const oldValue = oldData[key];
    const newValue = newData[key];

    // Deep comparison for objects
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue: oldValue !== undefined ? oldValue : null,
        newValue: newValue !== undefined ? newValue : null,
      });
    }
  });

  return changes;
};

/**
 * Filtrelenmiş audit log'ları getirir
 * @param filters - Filtre seçenekleri
 * @param filters.user - Kullanıcı ID (opsiyonel)
 * @param filters.resource - Kaynak tipi (opsiyonel)
 * @param filters.resourceId - Kaynak ID (opsiyonel)
 * @param filters.action - İşlem tipi (opsiyonel)
 * @param filters.startDate - Başlangıç tarihi (opsiyonel)
 * @param filters.endDate - Bitiş tarihi (opsiyonel)
 * @param filters.page - Sayfa numarası (default: 1)
 * @param filters.limit - Sayfa başına kayıt (default: 50)
 * @returns Filtrelenmiş audit log'ları ve pagination bilgisi
 * @example
 * const { logs, total, page, totalPages } = await getAuditLogs({ user: '123', page: 1, limit: 20 });
 */
export const getAuditLogs = async (filters: {
  user?: string;
  resource?: string;
  resourceId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) => {
  const query: any = {};

  if (filters.user) {
    query.user = filters.user;
  }

  if (filters.resource) {
    query.resource = filters.resource;
  }

  if (filters.resourceId) {
    query.resourceId = filters.resourceId;
  }

  if (filters.action) {
    query.action = filters.action;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = filters.startDate;
    }
    if (filters.endDate) {
      query.createdAt.$lte = filters.endDate;
    }
  }

  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

