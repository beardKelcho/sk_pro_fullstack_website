// Yetki tanımlamaları
export enum Permission {
  // Kullanıcı yönetimi
  USER_VIEW = 'user:view',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ROLES = 'user:manage_roles',
  
  // Proje yönetimi
  PROJECT_VIEW = 'project:view',
  PROJECT_CREATE = 'project:create',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  
  // Görev yönetimi
  TASK_VIEW = 'task:view',
  TASK_CREATE = 'task:create',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',
  
  // Müşteri yönetimi
  CLIENT_VIEW = 'client:view',
  CLIENT_CREATE = 'client:create',
  CLIENT_UPDATE = 'client:update',
  CLIENT_DELETE = 'client:delete',
  
  // Ekipman yönetimi
  EQUIPMENT_VIEW = 'equipment:view',
  EQUIPMENT_CREATE = 'equipment:create',
  EQUIPMENT_UPDATE = 'equipment:update',
  EQUIPMENT_DELETE = 'equipment:delete',
  
  // Bakım yönetimi
  MAINTENANCE_VIEW = 'maintenance:view',
  MAINTENANCE_CREATE = 'maintenance:create',
  MAINTENANCE_UPDATE = 'maintenance:update',
  MAINTENANCE_DELETE = 'maintenance:delete',
  
  // Export
  EXPORT_DATA = 'export:data',
  
  // Upload/File
  FILE_UPLOAD = 'file:upload',
  FILE_DELETE = 'file:delete',
}

// Rol tanımlamaları
export enum Role {
  ADMIN = 'ADMIN',
  FIRMA_SAHIBI = 'FIRMA_SAHIBI',
  PROJE_YONETICISI = 'PROJE_YONETICISI',
  DEPO_SORUMLUSU = 'DEPO_SORUMLUSU',
  TEKNISYEN = 'TEKNISYEN',
}

// Rol bazlı yetki matrisi
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Admin her şeye erişebilir
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_MANAGE_ROLES,
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.CLIENT_VIEW,
    Permission.CLIENT_CREATE,
    Permission.CLIENT_UPDATE,
    Permission.CLIENT_DELETE,
    Permission.EQUIPMENT_VIEW,
    Permission.EQUIPMENT_CREATE,
    Permission.EQUIPMENT_UPDATE,
    Permission.EQUIPMENT_DELETE,
    Permission.MAINTENANCE_VIEW,
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_UPDATE,
    Permission.MAINTENANCE_DELETE,
    Permission.EXPORT_DATA,
    Permission.FILE_UPLOAD,
    Permission.FILE_DELETE,
  ],
  
  [Role.FIRMA_SAHIBI]: [
    // Firma sahibi admin ile aynı yetkilere sahip
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_MANAGE_ROLES,
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.CLIENT_VIEW,
    Permission.CLIENT_CREATE,
    Permission.CLIENT_UPDATE,
    Permission.CLIENT_DELETE,
    Permission.EQUIPMENT_VIEW,
    Permission.EQUIPMENT_CREATE,
    Permission.EQUIPMENT_UPDATE,
    Permission.EQUIPMENT_DELETE,
    Permission.MAINTENANCE_VIEW,
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_UPDATE,
    Permission.MAINTENANCE_DELETE,
    Permission.EXPORT_DATA,
    Permission.FILE_UPLOAD,
    Permission.FILE_DELETE,
  ],
  
  [Role.PROJE_YONETICISI]: [
    // Proje yöneticisi: Projeler, görevler, müşteriler (malzeme ekleyip çıkaramaz)
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.CLIENT_VIEW,
    Permission.CLIENT_CREATE,
    Permission.CLIENT_UPDATE,
    Permission.CLIENT_DELETE,
    Permission.EQUIPMENT_VIEW, // Sadece görüntüleme
    Permission.MAINTENANCE_VIEW, // Sadece görüntüleme
    Permission.USER_VIEW, // Sadece görüntüleme
    Permission.EXPORT_DATA,
  ],
  
  [Role.DEPO_SORUMLUSU]: [
    // Depo sorumlusu: Ekipman, bakım (görev giremez)
    Permission.EQUIPMENT_VIEW,
    Permission.EQUIPMENT_CREATE,
    Permission.EQUIPMENT_UPDATE,
    Permission.EQUIPMENT_DELETE,
    Permission.MAINTENANCE_VIEW,
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_UPDATE,
    Permission.MAINTENANCE_DELETE,
    Permission.PROJECT_VIEW, // Sadece görüntüleme
    Permission.CLIENT_VIEW, // Sadece görüntüleme
    Permission.EXPORT_DATA,
  ],
  
  [Role.TEKNISYEN]: [
    // Teknisyen: Sadece görüntüleme (okuma yetkisi)
    Permission.PROJECT_VIEW,
    Permission.TASK_VIEW,
    Permission.CLIENT_VIEW,
    Permission.EQUIPMENT_VIEW,
    Permission.MAINTENANCE_VIEW,
    Permission.USER_VIEW,
  ],
};

// Kullanıcının belirli bir yetkiye sahip olup olmadığını kontrol et
export const hasPermission = (userRole: string, permission: Permission, userPermissions?: string[]): boolean => {
  // Önce kullanıcının özel yetkilerine bak
  if (userPermissions && userPermissions.includes(permission)) {
    return true;
  }
  
  // Özel yetkiler yoksa rol yetkilerine bak
  const role = userRole as Role;
  if (!rolePermissions[role]) {
    return false;
  }
  return rolePermissions[role].includes(permission);
};

// Kullanıcının belirli bir role sahip olup olmadığını kontrol et
export const hasRole = (userRole: string, ...roles: Role[]): boolean => {
  return roles.includes(userRole as Role);
};

