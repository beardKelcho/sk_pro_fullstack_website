export interface ClientForm {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  status?: 'Active' | 'Inactive';
  notes?: string;
}

export interface Client {
  _id?: string;
  id: string;
  name: string;
  contactPerson?: string;
  companyName?: string;
  email: string;
  phone: string;
  address?: string;
  industry?: string;
  city?: string;
  status?: 'Active' | 'Inactive';
  projectCount?: number;
  createdAt?: string;
  notes?: string;
}


