import { VersionHistory, Equipment, Project } from '../models';
import mongoose from 'mongoose';
import logger from './logger';

/**
 * Versiyon geçmişi oluşturur
 * Resource'un değişikliklerini kaydeder ve versiyon numarası atar
 * @param resource - Kaynak tipi (Equipment, Project, vb.)
 * @param resourceId - Kaynak ID
 * @param oldData - Eski veri
 * @param newData - Yeni veri
 * @param changedBy - Değişikliği yapan kullanıcı ID
 * @param comment - Değişiklik yorumu (opsiyonel)
 * @example
 * await createVersionHistory('Equipment', equipmentId, oldData, newData, userId, 'Status güncellendi');
 */
export const createVersionHistory = async (
  resource: 'Equipment' | 'Project' | 'Task' | 'Client' | 'Maintenance',
  resourceId: mongoose.Types.ObjectId,
  oldData: any,
  newData: any,
  changedBy: mongoose.Types.ObjectId,
  comment?: string
): Promise<void> => {
  try {
    // Son versiyonu bul
    const lastVersion = await VersionHistory.findOne({
      resource,
      resourceId,
    })
      .sort({ version: -1 })
      .lean();

    const nextVersion = lastVersion ? lastVersion.version + 1 : 1;

    // Değişiklikleri çıkar
    const changes = extractChanges(oldData, newData);

    // Versiyon geçmişi oluştur
    await VersionHistory.create({
      resource,
      resourceId,
      version: nextVersion,
      data: newData, // Tam snapshot
      changes,
      changedBy,
      changedAt: new Date(),
      comment,
    });

    logger.info(`Versiyon geçmişi oluşturuldu: ${resource} ${resourceId} v${nextVersion}`);
  } catch (error) {
    logger.error('Versiyon geçmişi oluşturma hatası:', error);
    // Hata olsa bile devam et - versiyon geçmişi kritik değil
  }
};

/**
 * İki objeyi karşılaştır ve değişiklikleri çıkar
 */
const extractChanges = (oldData: any, newData: any): Array<{ field: string; oldValue: any; newValue: any }> => {
  const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

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

    // Deep comparison
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
 * Belirli bir versiyona rollback yapar
 * Resource'u seçilen versiyonun verisine geri döndürür
 * @param resource - Kaynak tipi
 * @param resourceId - Kaynak ID
 * @param version - Rollback yapılacak versiyon numarası
 * @param rolledBackBy - Rollback yapan kullanıcı ID
 * @returns Rollback başarılı mı?
 * @throws Versiyon bulunamadı veya resource bulunamadı hatası
 * @example
 * await rollbackToVersion('Equipment', equipmentId, 3, userId);
 */
export const rollbackToVersion = async (
  resource: 'Equipment' | 'Project' | 'Task' | 'Client' | 'Maintenance',
  resourceId: mongoose.Types.ObjectId,
  version: number,
  rolledBackBy: mongoose.Types.ObjectId
): Promise<boolean> => {
  try {
    // Versiyonu bul
    const versionHistory = await VersionHistory.findOne({
      resource,
      resourceId,
      version,
    });

    if (!versionHistory) {
      throw new Error('Versiyon bulunamadı');
    }

    // Resource model'ini bul
    let Model: any;
    switch (resource) {
      case 'Equipment':
        Model = Equipment;
        break;
      case 'Project':
        Model = Project;
        break;
      default:
        throw new Error('Desteklenmeyen resource tipi');
    }

    // Mevcut veriyi al
    const currentData = await Model.findById(resourceId);
    if (!currentData) {
      throw new Error('Resource bulunamadı');
    }

    // Versiyon verisini uygula (sadece değişen alanlar)
    const versionData = versionHistory.data;
    Object.keys(versionData).forEach((key) => {
      if (!['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) {
        (currentData as any)[key] = versionData[key];
      }
    });

    await currentData.save();

    // Rollback'i versiyon geçmişine kaydet
    await createVersionHistory(
      resource,
      resourceId,
      currentData.toObject(),
      versionData,
      rolledBackBy,
      `Rollback to version ${version}`
    );

    // Rollback flag'i set et
    await VersionHistory.updateOne(
      { _id: versionHistory._id },
      { isRolledBack: true }
    );

    logger.info(`Rollback yapıldı: ${resource} ${resourceId} -> v${version}`);
    return true;
  } catch (error) {
    logger.error('Rollback hatası:', error);
    throw error;
  }
};

/**
 * Resource'un versiyon geçmişini getirir
 * @param resource - Kaynak tipi
 * @param resourceId - Kaynak ID
 * @param page - Sayfa numarası (default: 1)
 * @param limit - Sayfa başına kayıt (default: 50)
 * @returns Versiyon geçmişi ve pagination bilgisi
 * @example
 * const { versions, total, page, totalPages } = await getVersionHistory('Equipment', equipmentId);
 */
export const getVersionHistory = async (
  resource: 'Equipment' | 'Project' | 'Task' | 'Client' | 'Maintenance',
  resourceId: mongoose.Types.ObjectId,
  page: number = 1,
  limit: number = 50
) => {
  const skip = (page - 1) * limit;

  const [versions, total] = await Promise.all([
    VersionHistory.find({
      resource,
      resourceId,
    })
      .populate('changedBy', 'name email')
      .sort({ version: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    VersionHistory.countDocuments({
      resource,
      resourceId,
    }),
  ]);

  return {
    versions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

