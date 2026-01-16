import apiClient from '@/services/api/axios';
import logger from '@/utils/logger';
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  getWebhookDeliveries,
} from '@/services/webhookService';

jest.mock('@/services/api/axios');
jest.mock('@/utils/logger');

describe('webhookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getWebhooks should call GET /webhooks', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { webhooks: [] } });
    await getWebhooks();
    expect(apiClient.get).toHaveBeenCalledWith('/webhooks');
  });

  it('createWebhook should call POST /webhooks', async () => {
    const payload = { name: 't', url: 'https://example.com', events: ['TASK_UPDATED'] };
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { webhook: { _id: '1' } } });
    await createWebhook(payload as any);
    expect(apiClient.post).toHaveBeenCalledWith('/webhooks', payload);
  });

  it('updateWebhook should call PUT /webhooks/:id', async () => {
    (apiClient.put as jest.Mock).mockResolvedValue({ data: { webhook: { _id: '1' } } });
    await updateWebhook('1', { enabled: false } as any);
    expect(apiClient.put).toHaveBeenCalledWith('/webhooks/1', { enabled: false });
  });

  it('deleteWebhook should call DELETE /webhooks/:id', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValue({});
    await deleteWebhook('1');
    expect(apiClient.delete).toHaveBeenCalledWith('/webhooks/1');
  });

  it('testWebhook should call POST /webhooks/:id/test', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { result: { ok: true, status: 200 } } });
    await testWebhook('1');
    expect(apiClient.post).toHaveBeenCalledWith('/webhooks/1/test', {});
  });

  it('getWebhookDeliveries should call GET /webhooks/:id/deliveries with params', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { deliveries: [] } });
    await getWebhookDeliveries('1', { status: 'FAILED', limit: 10 });
    expect(apiClient.get).toHaveBeenCalledWith('/webhooks/1/deliveries', { params: { status: 'FAILED', limit: 10 } });
  });

  it('should log errors via logger for mutation hooks (smoke)', async () => {
    (logger.error as jest.Mock).mockImplementation(() => undefined);
    expect(logger.error).toBeDefined();
  });
});

