import { Request, Response } from 'express';
import ContactMessage from '../../models/ContactMessage';
import { createEmailTransporter, createContactEmailTemplate } from '../../config/email.config';
import { sendMessage } from '../../controllers/contact.controller';

jest.mock('../../models/ContactMessage', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock('../../config/email.config', () => ({
  createEmailTransporter: jest.fn(),
  createContactEmailTemplate: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('contact.controller sendMessage', () => {
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should accept honeypot submissions without touching the database', async () => {
    const req = {
      body: {
        name: 'Spam Bot',
        email: 'bot@example.com',
        subject: 'Spam',
        message: 'Spam',
        website: 'https://spam.example.com',
      },
    } as unknown as Request;
    const res = mockResponse();

    await sendMessage(req, res);

    expect(ContactMessage.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Mesajınız alındı.',
    });
  });

  it('should return success when message is saved even if email delivery fails', async () => {
    const req = {
      body: {
        name: 'Ayse',
        email: 'ayse@example.com',
        subject: 'Teklif',
        message: 'Detaylari gonderir misiniz?',
      },
    } as unknown as Request;
    const res = mockResponse();

    (ContactMessage.create as jest.Mock).mockResolvedValue({
      _id: 'message-1',
      name: 'Ayse',
      createdAt: '2026-03-31T10:00:00.000Z',
    });
    (createContactEmailTemplate as jest.Mock).mockReturnValue({ to: 'ops@example.com' });
    (createEmailTransporter as jest.Mock).mockReturnValue({
      sendMail: jest.fn().mockRejectedValue(new Error('SMTP down')),
    });

    await sendMessage(req, res);

    expect(ContactMessage.create).toHaveBeenCalledWith({
      name: 'Ayse',
      email: 'ayse@example.com',
      subject: 'Teklif',
      message: 'Detaylari gonderir misiniz?',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Mesajınız başarıyla alındı. En kısa sürede size dönüş yapacağız.',
      data: {
        id: 'message-1',
        name: 'Ayse',
        createdAt: '2026-03-31T10:00:00.000Z',
      },
    });
  });

  it('should reject invalid email addresses', async () => {
    const req = {
      body: {
        name: 'Ayse',
        email: 'not-an-email',
        subject: 'Teklif',
        message: 'Detaylari gonderir misiniz?',
      },
    } as unknown as Request;
    const res = mockResponse();

    await sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Geçerli bir email adresi giriniz',
    });
  });
});
