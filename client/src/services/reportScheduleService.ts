import apiClient from './api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ReportSchedule {
  _id: string;
  name: string;
  type: 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  reportType: 'DASHBOARD' | 'EQUIPMENT' | 'PROJECTS' | 'TASKS' | 'MAINTENANCE' | 'ALL';
  recipients: string[];
  schedule: {
    frequency: 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time?: string;
    cronExpression?: string;
  };
  filters?: {
    equipmentType?: string;
    projectStatus?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  format: 'PDF' | 'EXCEL' | 'CSV';
  isActive: boolean;
  lastSent?: string;
  nextRun?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSchedulesResponse {
  success: boolean;
  schedules: ReportSchedule[];
}

export interface ReportScheduleResponse {
  success: boolean;
  schedule: ReportSchedule;
}

/**
 * Tüm rapor zamanlamalarını getir
 */
export const getReportSchedules = async (): Promise<ReportSchedulesResponse> => {
  const res = await apiClient.get('/report-schedules');
  return res.data;
};

/**
 * Tek bir rapor zamanlamasını getir
 */
export const getReportScheduleById = async (id: string): Promise<ReportScheduleResponse> => {
  const res = await apiClient.get(`/report-schedules/${id}`);
  return res.data;
};

/**
 * Yeni rapor zamanlaması oluştur
 */
export const createReportSchedule = async (data: Partial<ReportSchedule>): Promise<ReportScheduleResponse> => {
  const res = await apiClient.post('/report-schedules', data);
  return res.data;
};

/**
 * Rapor zamanlamasını güncelle
 */
export const updateReportSchedule = async (id: string, data: Partial<ReportSchedule>): Promise<ReportScheduleResponse> => {
  const res = await apiClient.put(`/report-schedules/${id}`, data);
  return res.data;
};

/**
 * Rapor zamanlamasını sil
 */
export const deleteReportSchedule = async (id: string): Promise<{ success: boolean; message: string }> => {
  const res = await apiClient.delete(`/report-schedules/${id}`);
  return res.data;
};

// React Query Hooks
export const useReportSchedules = () => {
  return useQuery({
    queryKey: ['report-schedules'],
    queryFn: getReportSchedules,
    staleTime: 1 * 60 * 1000, // 1 dakika
  });
};

export const useReportScheduleById = (id: string | null) => {
  return useQuery({
    queryKey: ['report-schedule', id],
    queryFn: () => getReportScheduleById(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

export const useCreateReportSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createReportSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
    },
  });
};

export const useUpdateReportSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReportSchedule> }) =>
      updateReportSchedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['report-schedule', variables.id] });
    },
  });
};

export const useDeleteReportSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteReportSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
    },
  });
};

