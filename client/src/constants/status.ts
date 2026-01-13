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
  [`project_${PROJECT_STATUS.PLANNING}`]: 'bg-blue-100 text-blue-800',
  [`project_${PROJECT_STATUS.IN_PROGRESS}`]: 'bg-yellow-100 text-yellow-800',
  [`project_${PROJECT_STATUS.ON_HOLD}`]: 'bg-gray-100 text-gray-800',
  [`project_${PROJECT_STATUS.COMPLETED}`]: 'bg-green-100 text-green-800',
  [`project_${PROJECT_STATUS.CANCELLED}`]: 'bg-red-100 text-red-800',
  [`task_${TASK_STATUS.TODO}`]: 'bg-gray-100 text-gray-800',
  [`task_${TASK_STATUS.IN_PROGRESS}`]: 'bg-yellow-100 text-yellow-800',
  [`task_${TASK_STATUS.REVIEW}`]: 'bg-blue-100 text-blue-800',
  [`task_${TASK_STATUS.COMPLETED}`]: 'bg-green-100 text-green-800',
  [`equipment_${EQUIPMENT_STATUS.AVAILABLE}`]: 'bg-green-100 text-green-800',
  [`equipment_${EQUIPMENT_STATUS.IN_USE}`]: 'bg-yellow-100 text-yellow-800',
  [`equipment_${EQUIPMENT_STATUS.MAINTENANCE}`]: 'bg-blue-100 text-blue-800',
  [`equipment_${EQUIPMENT_STATUS.DAMAGED}`]: 'bg-red-100 text-red-800',
} as const;

export const STATUS_NAMES = {
  [`project_${PROJECT_STATUS.PLANNING}`]: 'Planlama',
  [`project_${PROJECT_STATUS.IN_PROGRESS}`]: 'Devam Ediyor',
  [`project_${PROJECT_STATUS.ON_HOLD}`]: 'Beklemede',
  [`project_${PROJECT_STATUS.COMPLETED}`]: 'Tamamlandı',
  [`project_${PROJECT_STATUS.CANCELLED}`]: 'İptal Edildi',
  [`task_${TASK_STATUS.TODO}`]: 'Yapılacak',
  [`task_${TASK_STATUS.IN_PROGRESS}`]: 'Devam Ediyor',
  [`task_${TASK_STATUS.REVIEW}`]: 'İncelemede',
  [`task_${TASK_STATUS.COMPLETED}`]: 'Tamamlandı',
  [`equipment_${EQUIPMENT_STATUS.AVAILABLE}`]: 'Müsait',
  [`equipment_${EQUIPMENT_STATUS.IN_USE}`]: 'Kullanımda',
  [`equipment_${EQUIPMENT_STATUS.MAINTENANCE}`]: 'Bakımda',
  [`equipment_${EQUIPMENT_STATUS.DAMAGED}`]: 'Arızalı',
} as const; 