import { Request, Response } from 'express';
import About from '../../models/About';
import Contact from '../../models/Contact';
import { SiteContent } from '../../models/SiteContent';
import { updateAbout, updateContact } from '../../controllers/cms.controller';

jest.mock('../../models/About', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock('../../models/Contact', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock('../../models/SiteContent', () => ({
  SiteContent: {
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

describe('cms.controller sync behaviour', () => {
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update both legacy About and site-content records', async () => {
    const req = {
      body: {
        title: 'SK Production Hakkında',
        description: 'Detaylı açıklama',
        imageUrl: 'https://res.cloudinary.com/demo/about.jpg',
        stats: [{ label: 'Proje', value: '100+' }],
      },
      user: { id: 'user-1' },
    } as unknown as Request;
    const res = mockResponse();

    (About.findOneAndUpdate as jest.Mock).mockResolvedValue({ updatedAt: '2026-04-04T00:00:00.000Z' });
    (SiteContent.findOneAndUpdate as jest.Mock).mockResolvedValue({ updatedAt: '2026-04-04T00:00:00.000Z' });

    await updateAbout(req, res);

    expect(About.findOneAndUpdate).toHaveBeenCalledWith(
      {},
      {
        title: 'SK Production Hakkında',
        description: 'Detaylı açıklama',
        imageUrl: 'https://res.cloudinary.com/demo/about.jpg',
        stats: [{ label: 'Proje', value: '100+' }],
      },
      { new: true, upsert: true, runValidators: true }
    );
    expect(SiteContent.findOneAndUpdate).toHaveBeenCalledWith(
      { section: 'about' },
      expect.objectContaining({
        section: 'about',
        isActive: true,
        updatedBy: 'user-1',
        data: {
          title: 'SK Production Hakkında',
          description: 'Detaylı açıklama',
          imageUrl: 'https://res.cloudinary.com/demo/about.jpg',
          stats: [{ label: 'Proje', value: '100+' }],
        },
      }),
      { new: true, upsert: true, runValidators: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should update both legacy Contact and site-content records', async () => {
    const req = {
      body: {
        address: 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
        phone: '+90 544 644 93 04',
        email: 'info@skpro.com.tr',
        mapUrl: 'https://maps.google.com/maps?q=istanbul&output=embed',
        socialLinks: {
          instagram: 'https://www.instagram.com/skprotr/?hl=tr',
          linkedin: 'https://www.linkedin.com/company/skpro/',
        },
      },
      user: { id: 'user-2' },
    } as unknown as Request;
    const res = mockResponse();

    (Contact.findOneAndUpdate as jest.Mock).mockResolvedValue({ updatedAt: '2026-04-04T00:00:00.000Z' });
    (SiteContent.findOneAndUpdate as jest.Mock).mockResolvedValue({ updatedAt: '2026-04-04T00:00:00.000Z' });

    await updateContact(req, res);

    expect(Contact.findOneAndUpdate).toHaveBeenCalledWith(
      {},
      {
        address: 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
        phone: '+90 544 644 93 04',
        email: 'info@skpro.com.tr',
        mapUrl: 'https://maps.google.com/maps?q=istanbul&output=embed',
        socialLinks: {
          instagram: 'https://www.instagram.com/skprotr/?hl=tr',
          linkedin: 'https://www.linkedin.com/company/skpro/',
        },
      },
      { new: true, upsert: true, runValidators: true }
    );
    expect(SiteContent.findOneAndUpdate).toHaveBeenCalledWith(
      { section: 'contact' },
      expect.objectContaining({
        section: 'contact',
        isActive: true,
        updatedBy: 'user-2',
        data: {
          address: 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
          phone: '+90 544 644 93 04',
          email: 'info@skpro.com.tr',
          mapUrl: 'https://maps.google.com/maps?q=istanbul&output=embed',
          socialLinks: {
            instagram: 'https://www.instagram.com/skprotr/?hl=tr',
            linkedin: 'https://www.linkedin.com/company/skpro/',
          },
        },
      }),
      { new: true, upsert: true, runValidators: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
