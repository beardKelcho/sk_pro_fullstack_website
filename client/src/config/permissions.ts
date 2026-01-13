// Frontend için yetki tanımlamaları
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
    Permission.MAINTENANCE_VIEW,
    Permission.USER_VIEW,
    Permission.EXPORT_DATA,
  ],
  
  [Role.DEPO_SORUMLUSU]: [
    Permission.EQUIPMENT_VIEW,
    Permission.EQUIPMENT_CREATE,
    Permission.EQUIPMENT_UPDATE,
    Permission.EQUIPMENT_DELETE,
    Permission.MAINTENANCE_VIEW,
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_UPDATE,
    Permission.MAINTENANCE_DELETE,
    Permission.PROJECT_VIEW,
    Permission.CLIENT_VIEW,
    Permission.EXPORT_DATA,
  ],
  
  [Role.TEKNISYEN]: [
    Permission.PROJECT_VIEW,
    Permission.TASK_VIEW,
    Permission.CLIENT_VIEW,
    Permission.EQUIPMENT_VIEW,
    Permission.MAINTENANCE_VIEW,
    Permission.USER_VIEW,
  ],
};

// Yetki detayları
export interface PermissionDetail {
  id: Permission;
  name: string;
  description: string;
  category: string;
  examples: string[];
}

export const permissionDetails: PermissionDetail[] = [
  // Kullanıcı Yönetimi
  {
    id: Permission.USER_VIEW,
    name: 'Kullanıcı Görüntüleme',
    description: 'Kullanıcı listesini ve detaylarını görüntüleme yetkisi',
    category: 'Kullanıcı Yönetimi',
    examples: ['Kullanıcı listesini görüntüleme', 'Kullanıcı profil detaylarını görme']
  },
  {
    id: Permission.USER_CREATE,
    name: 'Kullanıcı Oluşturma',
    description: 'Yeni kullanıcı oluşturma yetkisi',
    category: 'Kullanıcı Yönetimi',
    examples: ['Yeni kullanıcı ekleme', 'Kullanıcı kaydı oluşturma']
  },
  {
    id: Permission.USER_UPDATE,
    name: 'Kullanıcı Güncelleme',
    description: 'Mevcut kullanıcıları düzenleme yetkisi',
    category: 'Kullanıcı Yönetimi',
    examples: ['Kullanıcı bilgilerini güncelleme', 'Kullanıcı profilini düzenleme']
  },
  {
    id: Permission.USER_DELETE,
    name: 'Kullanıcı Silme',
    description: 'Kullanıcıları silme yetkisi',
    category: 'Kullanıcı Yönetimi',
    examples: ['Kullanıcı hesabını silme', 'Kullanıcıyı sistemden çıkarma']
  },
  {
    id: Permission.USER_MANAGE_ROLES,
    name: 'Rol Yönetimi',
    description: 'Kullanıcılara rol atama ve yetki yönetimi yapma yetkisi',
    category: 'Kullanıcı Yönetimi',
    examples: ['Kullanıcıya rol atama', 'Yetki yönetimi sayfasını kullanma']
  },
  
  // Proje Yönetimi
  {
    id: Permission.PROJECT_VIEW,
    name: 'Proje Görüntüleme',
    description: 'Proje listesini ve detaylarını görüntüleme yetkisi',
    category: 'Proje Yönetimi',
    examples: ['Proje listesini görüntüleme', 'Proje detaylarını görme']
  },
  {
    id: Permission.PROJECT_CREATE,
    name: 'Proje Oluşturma',
    description: 'Yeni proje oluşturma yetkisi',
    category: 'Proje Yönetimi',
    examples: ['Yeni proje ekleme', 'Proje kaydı oluşturma']
  },
  {
    id: Permission.PROJECT_UPDATE,
    name: 'Proje Güncelleme',
    description: 'Mevcut projeleri düzenleme yetkisi',
    category: 'Proje Yönetimi',
    examples: ['Proje bilgilerini güncelleme', 'Proje durumunu değiştirme']
  },
  {
    id: Permission.PROJECT_DELETE,
    name: 'Proje Silme',
    description: 'Projeleri silme yetkisi',
    category: 'Proje Yönetimi',
    examples: ['Projeyi silme', 'Projeyi sistemden çıkarma']
  },
  
  // Görev Yönetimi
  {
    id: Permission.TASK_VIEW,
    name: 'Görev Görüntüleme',
    description: 'Görev listesini ve detaylarını görüntüleme yetkisi',
    category: 'Görev Yönetimi',
    examples: ['Görev listesini görüntüleme', 'Görev detaylarını görme']
  },
  {
    id: Permission.TASK_CREATE,
    name: 'Görev Oluşturma',
    description: 'Yeni görev oluşturma yetkisi',
    category: 'Görev Yönetimi',
    examples: ['Yeni görev ekleme', 'Görev kaydı oluşturma']
  },
  {
    id: Permission.TASK_UPDATE,
    name: 'Görev Güncelleme',
    description: 'Mevcut görevleri düzenleme yetkisi',
    category: 'Görev Yönetimi',
    examples: ['Görev bilgilerini güncelleme', 'Görev durumunu değiştirme']
  },
  {
    id: Permission.TASK_DELETE,
    name: 'Görev Silme',
    description: 'Görevleri silme yetkisi',
    category: 'Görev Yönetimi',
    examples: ['Görevi silme', 'Görevi sistemden çıkarma']
  },
  
  // Müşteri Yönetimi
  {
    id: Permission.CLIENT_VIEW,
    name: 'Müşteri Görüntüleme',
    description: 'Müşteri listesini ve detaylarını görüntüleme yetkisi',
    category: 'Müşteri Yönetimi',
    examples: ['Müşteri listesini görüntüleme', 'Müşteri detaylarını görme']
  },
  {
    id: Permission.CLIENT_CREATE,
    name: 'Müşteri Oluşturma',
    description: 'Yeni müşteri oluşturma yetkisi',
    category: 'Müşteri Yönetimi',
    examples: ['Yeni müşteri ekleme', 'Müşteri kaydı oluşturma']
  },
  {
    id: Permission.CLIENT_UPDATE,
    name: 'Müşteri Güncelleme',
    description: 'Mevcut müşterileri düzenleme yetkisi',
    category: 'Müşteri Yönetimi',
    examples: ['Müşteri bilgilerini güncelleme', 'Müşteri profilini düzenleme']
  },
  {
    id: Permission.CLIENT_DELETE,
    name: 'Müşteri Silme',
    description: 'Müşterileri silme yetkisi',
    category: 'Müşteri Yönetimi',
    examples: ['Müşteriyi silme', 'Müşteriyi sistemden çıkarma']
  },
  
  // Ekipman Yönetimi
  {
    id: Permission.EQUIPMENT_VIEW,
    name: 'Ekipman Görüntüleme',
    description: 'Ekipman listesini ve detaylarını görüntüleme yetkisi',
    category: 'Ekipman Yönetimi',
    examples: ['Ekipman listesini görüntüleme', 'Ekipman detaylarını görme']
  },
  {
    id: Permission.EQUIPMENT_CREATE,
    name: 'Ekipman Oluşturma',
    description: 'Yeni ekipman ekleme yetkisi',
    category: 'Ekipman Yönetimi',
    examples: ['Yeni ekipman ekleme', 'Ekipman kaydı oluşturma']
  },
  {
    id: Permission.EQUIPMENT_UPDATE,
    name: 'Ekipman Güncelleme',
    description: 'Mevcut ekipmanları düzenleme yetkisi (bakıma gönderme dahil)',
    category: 'Ekipman Yönetimi',
    examples: ['Ekipman bilgilerini güncelleme', 'Ekipman durumunu değiştirme', 'Ekipmanı bakıma gönderme']
  },
  {
    id: Permission.EQUIPMENT_DELETE,
    name: 'Ekipman Silme',
    description: 'Ekipmanları silme yetkisi',
    category: 'Ekipman Yönetimi',
    examples: ['Ekipmanı silme', 'Ekipmanı sistemden çıkarma']
  },
  
  // Bakım Yönetimi
  {
    id: Permission.MAINTENANCE_VIEW,
    name: 'Bakım Görüntüleme',
    description: 'Bakım listesini ve detaylarını görüntüleme yetkisi',
    category: 'Bakım Yönetimi',
    examples: ['Bakım listesini görüntüleme', 'Bakım detaylarını görme']
  },
  {
    id: Permission.MAINTENANCE_CREATE,
    name: 'Bakım Oluşturma',
    description: 'Yeni bakım kaydı oluşturma yetkisi',
    category: 'Bakım Yönetimi',
    examples: ['Yeni bakım kaydı ekleme', 'Bakım planı oluşturma']
  },
  {
    id: Permission.MAINTENANCE_UPDATE,
    name: 'Bakım Güncelleme',
    description: 'Mevcut bakım kayıtlarını düzenleme yetkisi',
    category: 'Bakım Yönetimi',
    examples: ['Bakım bilgilerini güncelleme', 'Bakım durumunu değiştirme']
  },
  {
    id: Permission.MAINTENANCE_DELETE,
    name: 'Bakım Silme',
    description: 'Bakım kayıtlarını silme yetkisi',
    category: 'Bakım Yönetimi',
    examples: ['Bakım kaydını silme', 'Bakımı sistemden çıkarma']
  },
  
  // Diğer
  {
    id: Permission.EXPORT_DATA,
    name: 'Veri Export',
    description: 'Verileri dışa aktarma (Excel, PDF vb.) yetkisi',
    category: 'Diğer',
    examples: ['Excel olarak export', 'PDF rapor oluşturma']
  },
  {
    id: Permission.FILE_UPLOAD,
    name: 'Dosya Yükleme',
    description: 'Dosya yükleme yetkisi',
    category: 'Dosya Yönetimi',
    examples: ['Resim yükleme', 'Doküman yükleme', 'Proje dosyası ekleme']
  },
  {
    id: Permission.FILE_DELETE,
    name: 'Dosya Silme',
    description: 'Yüklenen dosyaları silme yetkisi',
    category: 'Dosya Yönetimi',
    examples: ['Yüklenen dosyayı silme', 'Dosya arşivinden çıkarma']
  },
];

// Kategorilere göre grupla
export const permissionsByCategory = permissionDetails.reduce((acc, perm) => {
  if (!acc[perm.category]) {
    acc[perm.category] = [];
  }
  acc[perm.category].push(perm);
  return acc;
}, {} as Record<string, PermissionDetail[]>);

/**
 * Kullanıcının belirli bir yetkiye sahip olup olmadığını kontrol eder
 * @param userRole - Kullanıcının rolü
 * @param permission - Kontrol edilecek yetki
 * @param userPermissions - Kullanıcının özel yetkileri (opsiyonel)
 * @returns Yetkiye sahipse true, değilse false
 */
export const hasPermission = (
  userRole: string,
  permission: Permission,
  userPermissions?: string[]
): boolean => {
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

/**
 * Kullanıcının belirli bir role sahip olup olmadığını kontrol eder
 * @param userRole - Kullanıcının rolü
 * @param roles - Kontrol edilecek roller
 * @returns Rol varsa true, değilse false
 */
export const hasRole = (userRole: string, ...roles: Role[]): boolean => {
  return roles.includes(userRole as Role);
};
