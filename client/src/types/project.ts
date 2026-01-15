// Proje durumu için tip tanımı (Backend enum'ları ile uyumlu)
// PLANNING legacy (geriye uyumluluk)
export type ProjectStatus =
  | 'PLANNING'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ON_HOLD'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

// Türkçe görüntüleme için yardımcı tip
export type ProjectStatusDisplay =
  | 'Onay Bekleyen'
  | 'Onaylanan'
  | 'Devam Ediyor'
  | 'Tamamlandı'
  | 'Ertelendi'
  | 'İptal Edildi';

// Ekip üyesi tipi
export interface TeamMember {
  _id?: string;
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: string;
  avatar?: string;
}

// Ekipman tipi
export interface Equipment {
  _id?: string;
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  category: string;
  status: string;
  specs?: Record<string, string>;
}

// Müşteri tipi
export interface Client {
  _id?: string;
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address?: string;
  industry?: string;
  city?: string;
  status?: string;
}

// Proje tipi
export interface Project {
  _id?: string;
  id: string;
  name: string;
  description: string;
  client: string | Client; // Backend'de 'client' field'ı var, 'customer' değil
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  budget?: number;
  location: string;
  team: string[] | TeamMember[]; // Backend'de ObjectId[] veya populated array
  equipment: string[] | Equipment[]; // Backend'de ObjectId[] veya populated array
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Proje form tipi
export interface ProjectForm {
  name: string;
  description: string;
  client: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  budget?: number;
  location: string;
  team: string[];
  equipment: string[];
  notes?: string;
} 