import logger from './logger';

/**
 * Query performance optimizasyon yardımcı fonksiyonları
 */

/**
 * Select sadece gerekli alanları getirir (lean query için)
 * @param fields - Getirilecek alan isimleri
 * @returns MongoDB select string
 * @example
 * selectFields(['name', 'email', 'role']) // "name email role"
 */
export const selectFields = (fields: string[]): string => {
  return fields.join(' ');
};

/**
 * Pagination için skip ve limit hesaplar
 * @param page - Sayfa numarası (1'den başlar)
 * @param limit - Sayfa başına kayıt sayısı (max: 100)
 * @returns Hesaplanmış skip, limit ve page değerleri
 * @example
 * calculatePagination(2, 20) // { skip: 20, limit: 20, page: 2 }
 */
export const calculatePagination = (page: number, limit: number) => {
  const pageNumber = Math.max(1, page);
  const limitNumber = Math.min(Math.max(1, limit), 100); // Max 100 items per page
  const skip = (pageNumber - 1) * limitNumber;

  return { skip, limit: limitNumber, page: pageNumber };
};

/**
 * MongoDB sort options oluşturur
 * @param sort - Sort string (örn: "name" veya "-createdAt")
 * @returns MongoDB sort objesi
 * @example
 * createSortOptions("name") // { name: 1 }
 * createSortOptions("-createdAt") // { createdAt: -1 }
 */
export const createSortOptions = (sort: string): Record<string, 1 | -1> => {
  const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
  const sortOrder = sort.startsWith('-') ? -1 : 1;

  const sortOptions: Record<string, 1 | -1> = {};
  sortOptions[sortField] = sortOrder;
  return sortOptions;
};

/**
 * Text search için güvenli regex oluşturur
 * Özel karakterleri escape eder
 * @param search - Aranacak metin
 * @param caseSensitive - Büyük/küçük harf duyarlı mı? (default: false)
 * @returns Güvenli regex pattern
 * @example
 * createSearchRegex("test") // /test/i
 * createSearchRegex("test", true) // /test/
 */
export const createSearchRegex = (search: string, caseSensitive: boolean = false): RegExp => {
  return new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? '' : 'i');
};

/**
 * Date range filter oluşturur
 * @param startDate - Başlangıç tarihi (opsiyonel)
 * @param endDate - Bitiş tarihi (opsiyonel)
 * @returns MongoDB date range filter veya null
 * @example
 * createDateRangeFilter('2024-01-01', '2024-12-31')
 * // { $gte: new Date('2024-01-01'), $lte: new Date('2024-12-31') }
 */
export const createDateRangeFilter = (
  startDate?: string | Date,
  endDate?: string | Date
): Record<string, any> | null => {
  if (!startDate && !endDate) {
    return null;
  }

  const filter: Record<string, any> = {};

  if (startDate) {
    filter.$gte = new Date(startDate);
  }

  if (endDate) {
    filter.$lte = new Date(endDate);
  }

  return Object.keys(filter).length > 0 ? filter : null;
};

/**
 * Query execution time ölçümü için wrapper
 * Yavaş query'leri (1 saniyeden fazla) uyarır
 * @param queryName - Query adı (loglama için)
 * @param queryFn - Ölçülecek query fonksiyonu
 * @returns Query sonucu
 * @template T - Query sonuç tipi
 * @example
 * const users = await measureQueryTime('getUsers', () => User.find({}));
 */
export const measureQueryTime = async <T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now();
  try {
    const result = await queryFn();
    const executionTime = Date.now() - startTime;

    if (executionTime > 1000) {
      logger.warn(`Slow query detected: ${queryName} took ${executionTime}ms`);
    } else {
      logger.debug(`Query ${queryName} executed in ${executionTime}ms`);
    }

    return result;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    logger.error(`Query ${queryName} failed after ${executionTime}ms:`, error);
    throw error;
  }
};

/**
 * Lean query için optimize edilmiş options
 */
export const leanQueryOptions = {
  lean: true,
  leanWithId: true,
  leanVirtuals: true,
};

/**
 * Populate options optimize eder
 * Sadece gerekli alanları getirir (name, email)
 * @param fields - Populate edilecek field isimleri
 * @returns Optimize edilmiş populate options
 * @example
 * optimizePopulate(['user', 'client'])
 * // [{ path: 'user', select: 'name email' }, { path: 'client', select: 'name email' }]
 */
export const optimizePopulate = (fields: string[]) => {
  return fields.map((field) => ({
    path: field,
    select: 'name email', // Sadece gerekli alanları getir
  }));
};

