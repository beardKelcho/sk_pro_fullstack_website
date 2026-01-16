import { Request, Response } from 'express';
import {
  listEmailTemplates,
  createEmailTemplate,
  previewEmailTemplate,
} from '../../controllers/emailTemplate.controller';
import EmailTemplate from '../../models/EmailTemplate';

jest.mock('../../models/EmailTemplate', () => ({
  find: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('EmailTemplate Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = { body: {}, params: {}, query: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('listEmailTemplates 200 dönmeli', async () => {
    (EmailTemplate.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    });
    await listEmailTemplates(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  it('createEmailTemplate key/name yoksa 400 dönmeli', async () => {
    mockRequest.body = { name: 'x' };
    await createEmailTemplate(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it('previewEmailTemplate inline template ile render etmeli', async () => {
    mockRequest.body = {
      key: 'task_assigned',
      locale: 'tr',
      variantName: 'default',
      data: { userName: 'Ahmet' },
      template: {
        key: 'task_assigned',
        variants: [
          {
            name: 'default',
            weight: 100,
            locales: {
              tr: { subject: 'Merhaba {{userName}}', html: '<div>{{userName}}</div>' },
            },
          },
        ],
      },
    };

    await previewEmailTemplate(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    const payload = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data.subject).toContain('Ahmet');
    expect(payload.data.html).toContain('Ahmet');
  });
});

