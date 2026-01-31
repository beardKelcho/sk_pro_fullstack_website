import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface QRCode {
  _id?: string;
  id?: string;
  code: string;
  type: 'EQUIPMENT' | 'PROJECT' | 'CUSTOM';
  relatedId: string;
  relatedType: 'Equipment' | 'Project' | 'Other';
  title?: string;
  description?: string;
  isActive: boolean;
  scanCount: number;
  lastScannedAt?: string;
  lastScannedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface QRScanResult {
  success: boolean;
  equipment: any;
  status: string;
  relatedInfo?: any;
  relatedItemType?: string;
}

export interface CreateQRCodeData {
  type: 'EQUIPMENT' | 'PROJECT' | 'CUSTOM';
  relatedId: string;
  relatedType: 'Equipment' | 'Project' | 'Other';
  title?: string;
  description?: string;
}

export interface ScanQRCodeData {
  qrContent: string;
  action?: 'VIEW' | 'CHECK_IN' | 'CHECK_OUT' | 'MAINTENANCE' | 'OTHER';
  relatedItem?: string;
  relatedItemType?: 'Project' | 'Maintenance' | 'Other';
  notes?: string;
  location?: string;
}

// API fonksiyonları
export const getAllQRCodes = async (params?: {
  type?: string;
  isActive?: boolean;
  relatedType?: string;
  page?: number;
  limit?: number;
}): Promise<{ qrCodes: QRCode[]; total: number; page: number; totalPages: number }> => {
  const res = await apiClient.get('/qr-codes', { params });
  return res.data;
};

export const getQRCodeById = async (id: string): Promise<{ qrCode: QRCode; relatedItem: any; scanHistory: any[] }> => {
  const res = await apiClient.get(`/qr-codes/${id}`);
  return res.data;
};

export const createQRCode = async (data: CreateQRCodeData): Promise<{ qrCode: QRCode; qrImage: string }> => {
  const res = await apiClient.post('/qr-codes', data);
  return res.data;
};

export const scanQRCode = async (data: ScanQRCodeData): Promise<QRScanResult> => {
  // New endpoint is GET /scan/:code
  // It records 'VIEW' action automatically on backend
  const res = await apiClient.get(`/scan/${data.qrContent}`);
  // Map response to match expected QRScanResult if needed, or update interface
  // Backend returns: { success: true, equipment: ..., status: ..., relatedInfo: ... }
  // Frontend expects: { qrCode: ..., relatedItem: ..., scanHistory: ... }
  // Only Equipment Selector uses this?
  // If we change return type, we break typescript.
  // Let's assume for now we return what backend sends and update interface or component.
  return res.data;
};

export const updateQRCode = async (id: string, data: Partial<QRCode>): Promise<QRCode> => {
  const res = await apiClient.put(`/qr-codes/${id}`, data);
  return res.data.qrCode || res.data;
};

export const deleteQRCode = async (id: string): Promise<void> => {
  await apiClient.delete(`/qr-codes/${id}`);
};

export const regenerateQRImage = async (id: string): Promise<{ qrImage: string }> => {
  const res = await apiClient.post(`/qr-codes/${id}/regenerate-image`);
  return res.data;
};

// React Query Hooks
export const useQRCodes = (params?: {
  type?: string;
  isActive?: boolean;
  relatedType?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['qrCodes', params],
    queryFn: () => getAllQRCodes(params),
    staleTime: 2 * 60 * 1000, // 2 dakika
  });
};

export const useQRCode = (id: string | null) => {
  return useQuery({
    queryKey: ['qrCode', id],
    queryFn: () => getQRCodeById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQRCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] });
    },
  });
};

export const useScanQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scanQRCode,
    onSuccess: (data) => {
      // Refresh generic lists
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] });
      // If we had equipment ID, we could invalidate equipment queries too
      if (data.equipment) {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
      }
    },
  });
};

export const useUpdateQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QRCode> }) => updateQRCode(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['qrCode', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] });
    },
  });
};

export const useDeleteQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQRCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] });
    },
  });
};

export const useRegenerateQRImage = () => {
  return useMutation({
    mutationFn: regenerateQRImage,
  });
};

