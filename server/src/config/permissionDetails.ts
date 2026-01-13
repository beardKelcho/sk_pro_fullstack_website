import { Permission } from './permissions';

// Her yetki için detaylı açıklama
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
    description: 'Mevcut ekipmanları düzenleme yetkisi',
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

