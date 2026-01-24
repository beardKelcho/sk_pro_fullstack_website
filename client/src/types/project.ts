import type { Client } from './client';
import type { Equipment } from './equipment';

export type { Client, Equipment };

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

// Ekip üyesi tipi - Should probably be in user.ts but keeping here for now or extracting if user.ts exists
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

// Görüntüleme için genişletilmiş Project tipi
export interface ProjectDisplay extends Omit<Project, 'status' | 'client'> {
  status: ProjectStatusDisplay;
  customer: Client;
}
