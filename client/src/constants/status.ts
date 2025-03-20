export const PROJECT_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
} as const;

export const EQUIPMENT_STATUS = {
  AVAILABLE: 'available',
  IN_USE: 'in_use',
  MAINTENANCE: 'maintenance',
  DAMAGED: 'damaged',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TECHNICIAN: 'technician',
  WAREHOUSE: 'warehouse',
} as const;

export const STATUS_COLORS = {
  [PROJECT_STATUS.PLANNING]: 'bg-blue-100 text-blue-800',
  [PROJECT_STATUS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [PROJECT_STATUS.ON_HOLD]: 'bg-gray-100 text-gray-800',
  [PROJECT_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [PROJECT_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
  [TASK_STATUS.TODO]: 'bg-gray-100 text-gray-800',
  [TASK_STATUS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [TASK_STATUS.REVIEW]: 'bg-blue-100 text-blue-800',
  [TASK_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [EQUIPMENT_STATUS.AVAILABLE]: 'bg-green-100 text-green-800',
  [EQUIPMENT_STATUS.IN_USE]: 'bg-yellow-100 text-yellow-800',
  [EQUIPMENT_STATUS.MAINTENANCE]: 'bg-blue-100 text-blue-800',
  [EQUIPMENT_STATUS.DAMAGED]: 'bg-red-100 text-red-800',
} as const;

export const STATUS_NAMES = {
  [PROJECT_STATUS.PLANNING]: 'Planlama',
  [PROJECT_STATUS.IN_PROGRESS]: 'Devam Ediyor',
  [PROJECT_STATUS.ON_HOLD]: 'Beklemede',
  [PROJECT_STATUS.COMPLETED]: 'Tamamlandı',
  [PROJECT_STATUS.CANCELLED]: 'İptal Edildi',
  [TASK_STATUS.TODO]: 'Yapılacak',
  [TASK_STATUS.IN_PROGRESS]: 'Devam Ediyor',
  [TASK_STATUS.REVIEW]: 'İncelemede',
  [TASK_STATUS.COMPLETED]: 'Tamamlandı',
  [EQUIPMENT_STATUS.AVAILABLE]: 'Müsait',
  [EQUIPMENT_STATUS.IN_USE]: 'Kullanımda',
  [EQUIPMENT_STATUS.MAINTENANCE]: 'Bakımda',
  [EQUIPMENT_STATUS.DAMAGED]: 'Arızalı',
} as const; 