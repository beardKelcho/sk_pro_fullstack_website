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
  
  // QR Kod yönetimi
  QR_VIEW = 'qr:view',
  QR_CREATE = 'qr:create',
  QR_UPDATE = 'qr:update',
  QR_DELETE = 'qr:delete',
  QR_SCAN = 'qr:scan',
  
  // Audit Log
  VIEW_AUDIT_LOGS = 'audit:view',

  // Integrations
  WEBHOOK_MANAGE = 'webhook:manage',

  // Email Templates
  EMAIL_TEMPLATE_MANAGE = 'email_template:manage',

  // Analytics
  ANALYTICS_VIEW = 'analytics:view',
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
    Permission.QR_VIEW,
    Permission.QR_CREATE,
    Permission.QR_UPDATE,
    Permission.QR_DELETE,
    Permission.QR_SCAN,
    Permission.VIEW_AUDIT_LOGS,
    Permission.WEBHOOK_MANAGE,
    Permission.EMAIL_TEMPLATE_MANAGE,
    Permission.ANALYTICS_VIEW,
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
    Permission.QR_VIEW,
    Permission.QR_CREATE,
    Permission.QR_UPDATE,
    Permission.QR_DELETE,
    Permission.QR_SCAN,
    Permission.VIEW_AUDIT_LOGS,
    Permission.WEBHOOK_MANAGE,
    Permission.EMAIL_TEMPLATE_MANAGE,
    Permission.ANALYTICS_VIEW,
  ],
  
  [Role.PROJE_YONETICISI]: [
    // Proje: Tam yetki
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    // Görev: Tam yetki
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    // Müşteri: Tam yetki
    Permission.CLIENT_VIEW,
    Permission.CLIENT_CREATE,
    Permission.CLIENT_UPDATE,
    Permission.CLIENT_DELETE,
    // Ekipman: Sadece görüntüleme (ekleyemez, çıkaramaz)
    Permission.EQUIPMENT_VIEW,
    // Bakım: Sadece görüntüleme
    Permission.MAINTENANCE_VIEW,
    // Kullanıcı: Sadece görüntüleme
    Permission.USER_VIEW,
    // Export: Veri dışa aktarma
    Permission.EXPORT_DATA,
    // QR Kod: Görüntüleme ve tarama
    Permission.QR_VIEW,
    Permission.QR_SCAN,
    // Dosya: Yükleme
    Permission.FILE_UPLOAD,
  ],
  
  [Role.DEPO_SORUMLUSU]: [
    // Ekipman: Tam yetki
    Permission.EQUIPMENT_VIEW,
    Permission.EQUIPMENT_CREATE,
    Permission.EQUIPMENT_UPDATE,
    Permission.EQUIPMENT_DELETE,
    // Bakım: Tam yetki
    Permission.MAINTENANCE_VIEW,
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_UPDATE,
    Permission.MAINTENANCE_DELETE,
    // Proje: Sadece görüntüleme (görev giremez)
    Permission.PROJECT_VIEW,
    // Müşteri: Sadece görüntüleme
    Permission.CLIENT_VIEW,
    // Export: Veri dışa aktarma
    Permission.EXPORT_DATA,
    // QR Kod: Tam yetki
    Permission.QR_VIEW,
    Permission.QR_CREATE,
    Permission.QR_UPDATE,
    Permission.QR_SCAN,
    // Dosya: Yükleme ve silme
    Permission.FILE_UPLOAD,
    Permission.FILE_DELETE,
  ],
  
  [Role.TEKNISYEN]: [
    // Teknisyen: Sadece görüntüleme yetkisi (okuma yetkisi)
    // Hiçbir veri oluşturma/güncelleme/silme yetkisi yok
    Permission.PROJECT_VIEW,
    Permission.TASK_VIEW,
    Permission.CLIENT_VIEW,
    Permission.EQUIPMENT_VIEW,
    Permission.MAINTENANCE_VIEW,
    Permission.USER_VIEW,
    // QR Kod: Görüntüleme ve tarama (sadece okuma)
    Permission.QR_VIEW,
    Permission.QR_SCAN,
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

