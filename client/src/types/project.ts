// Proje durumu için tip tanımı
export type ProjectStatus = 'active' | 'planned' | 'completed' | 'cancelled' | 'pending';

// Ekip üyesi tipi
export interface TeamMember {
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
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  category: string;
  status: string;
}

// Proje tipi
export interface Project {
  id: string;
  name: string;
  description: string;
  customer: {
    id: string;
    name: string;
    companyName: string;
    email: string;
    phone: string;
  };
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  budget: number;
  location: string;
  team: TeamMember[];
  equipment: Equipment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
} 