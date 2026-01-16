import apiClient from './api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import logger from '@/utils/logger';

export type WebhookEventType = 'PROJECT_STATUS_CHANGED' | 'TASK_ASSIGNED' | 'TASK_UPDATED';

export interface Webhook {
  _id: string;
  name: string;
  url: string;
  enabled: boolean;
  events: WebhookEventType[];
  secret?: string;
  maxAttempts: number;
  timeoutMs: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  _id: string;
  webhook: string;
  event: WebhookEventType;
  payload: any;
  status: 'PENDING' | 'RETRYING' | 'SUCCESS' | 'FAILED';
  attempts: number;
  nextAttemptAt: string;
  lastAttemptAt?: string;
  lastStatusCode?: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export const getWebhooks = async (): Promise<Webhook[]> => {
  const res = await apiClient.get('/webhooks');
  return res.data.webhooks as Webhook[];
};

export const createWebhook = async (data: Partial<Webhook>) => {
  const res = await apiClient.post('/webhooks', data);
  return res.data.webhook as Webhook;
};

export const updateWebhook = async (id: string, data: Partial<Webhook>) => {
  const res = await apiClient.put(`/webhooks/${id}`, data);
  return res.data.webhook as Webhook;
};

export const deleteWebhook = async (id: string) => {
  await apiClient.delete(`/webhooks/${id}`);
};

export const testWebhook = async (id: string) => {
  const res = await apiClient.post(`/webhooks/${id}/test`, {});
  return res.data.result;
};

export const getWebhookDeliveries = async (id: string, params?: { status?: string; limit?: number }) => {
  const res = await apiClient.get(`/webhooks/${id}/deliveries`, { params });
  return res.data.deliveries as WebhookDelivery[];
};

// Hooks
export const useWebhooks = () =>
  useQuery({
    queryKey: ['webhooks'],
    queryFn: getWebhooks,
    staleTime: 30_000,
  });

export const useCreateWebhook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWebhook,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
    onError: (e: any) => logger.error('Webhook create error:', e),
  });
};

export const useUpdateWebhook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Webhook> }) => updateWebhook(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
    onError: (e: any) => logger.error('Webhook update error:', e),
  });
};

export const useDeleteWebhook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteWebhook,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
    onError: (e: any) => logger.error('Webhook delete error:', e),
  });
};

export const useTestWebhook = () =>
  useMutation({
    mutationFn: testWebhook,
    onError: (e: any) => logger.error('Webhook test error:', e),
  });

export const useWebhookDeliveries = (id: string | null, params?: { status?: string; limit?: number }) =>
  useQuery({
    queryKey: ['webhooks', id, 'deliveries', params],
    queryFn: () => {
      if (!id) return Promise.resolve([] as WebhookDelivery[]);
      return getWebhookDeliveries(id, params);
    },
    enabled: Boolean(id),
    staleTime: 10_000,
  });

