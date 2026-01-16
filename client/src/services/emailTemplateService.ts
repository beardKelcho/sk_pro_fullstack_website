import apiClient from './api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import logger from '@/utils/logger';

export type EmailTemplateLocale = 'tr' | 'en' | string;

export interface EmailTemplateLocalizedContent {
  subject: string;
  html: string;
}

export interface EmailTemplateVariant {
  name: string;
  weight: number;
  locales: Record<EmailTemplateLocale, EmailTemplateLocalizedContent>;
}

export interface EmailTemplate {
  _id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  variants: EmailTemplateVariant[];
  createdAt: string;
  updatedAt: string;
}

export type EmailTemplatePreviewResponse = {
  subject: string;
  html: string;
  used: { templateKey: string; variantName: string; locale: string };
};

export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  const res = await apiClient.get('/email-templates');
  return (res.data?.data || []) as EmailTemplate[];
};

export const createEmailTemplate = async (data: Partial<EmailTemplate>) => {
  const res = await apiClient.post('/email-templates', data);
  return res.data?.data as EmailTemplate;
};

export const updateEmailTemplate = async (id: string, data: Partial<EmailTemplate>) => {
  const res = await apiClient.put(`/email-templates/${id}`, data);
  return res.data?.data as EmailTemplate;
};

export const deleteEmailTemplate = async (id: string) => {
  await apiClient.delete(`/email-templates/${id}`);
};

export const previewEmailTemplate = async (payload: {
  id?: string;
  key?: string;
  locale?: string;
  variantName?: string;
  data?: Record<string, any>;
  template?: Partial<EmailTemplate>;
}): Promise<EmailTemplatePreviewResponse> => {
  const res = await apiClient.post('/email-templates/preview', payload);
  return res.data?.data as EmailTemplatePreviewResponse;
};

// Hooks
export const useEmailTemplates = () =>
  useQuery({
    queryKey: ['email-templates'],
    queryFn: getEmailTemplates,
    staleTime: 30_000,
  });

export const useCreateEmailTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEmailTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['email-templates'] }),
    onError: (e: any) => logger.error('EmailTemplate create error:', e),
  });
};

export const useUpdateEmailTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmailTemplate> }) => updateEmailTemplate(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['email-templates'] }),
    onError: (e: any) => logger.error('EmailTemplate update error:', e),
  });
};

export const useDeleteEmailTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEmailTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['email-templates'] }),
    onError: (e: any) => logger.error('EmailTemplate delete error:', e),
  });
};

export const usePreviewEmailTemplate = () =>
  useMutation({
    mutationFn: previewEmailTemplate,
    onError: (e: any) => logger.error('EmailTemplate preview error:', e),
  });

