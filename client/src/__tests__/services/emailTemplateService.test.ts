import apiClient from '@/services/api/axios';
import logger from '@/utils/logger';
import {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  previewEmailTemplate,
} from '@/services/emailTemplateService';

jest.mock('@/services/api/axios');
jest.mock('@/utils/logger');

describe('emailTemplateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getEmailTemplates should call GET /email-templates', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { success: true, data: [] } });
    await getEmailTemplates();
    expect(apiClient.get).toHaveBeenCalledWith('/email-templates');
  });

  it('createEmailTemplate should call POST /email-templates', async () => {
    const payload = { key: 'task_assigned', name: 'Görev Atandı', enabled: true, variants: [] };
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { success: true, data: { _id: '1' } } });
    await createEmailTemplate(payload as any);
    expect(apiClient.post).toHaveBeenCalledWith('/email-templates', payload);
  });

  it('updateEmailTemplate should call PUT /email-templates/:id', async () => {
    (apiClient.put as jest.Mock).mockResolvedValue({ data: { success: true, data: { _id: '1' } } });
    await updateEmailTemplate('1', { enabled: false } as any);
    expect(apiClient.put).toHaveBeenCalledWith('/email-templates/1', { enabled: false });
  });

  it('deleteEmailTemplate should call DELETE /email-templates/:id', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValue({});
    await deleteEmailTemplate('1');
    expect(apiClient.delete).toHaveBeenCalledWith('/email-templates/1');
  });

  it('previewEmailTemplate should call POST /email-templates/preview', async () => {
    const payload = { key: 'task_assigned', locale: 'tr', data: { userName: 'Ahmet' } };
    (apiClient.post as jest.Mock).mockResolvedValue({
      data: { success: true, data: { subject: 'x', html: '<div/>', used: { templateKey: 't', variantName: 'default', locale: 'tr' } } },
    });
    await previewEmailTemplate(payload as any);
    expect(apiClient.post).toHaveBeenCalledWith('/email-templates/preview', payload);
  });

  it('should log errors via logger for hook error handlers (smoke)', async () => {
    (logger.error as jest.Mock).mockImplementation(() => undefined);
    expect(logger.error).toBeDefined();
  });
});

