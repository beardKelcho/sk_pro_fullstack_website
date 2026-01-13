/**
 * Site Image Routes Integration Testleri
 */

import request from 'supertest';
import express from 'express';
import siteImageRoutes from '../../routes/siteImage.routes';
import { authenticate } from '../../middleware/auth.middleware';

// Mock middleware
jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => next()),
  requirePermission: jest.fn((req, res, next) => next()),
}));

// Mock controller
jest.mock('../../controllers/siteImage.controller', () => ({
  getAllImages: jest.fn((req, res) => res.status(200).json({ success: true, images: [] })),
  getImageById: jest.fn((req, res) => res.status(200).json({ success: true, image: {} })),
  serveImageById: jest.fn((req, res) => res.status(200).send('image data')),
  createImage: jest.fn((req, res) => res.status(201).json({ success: true, image: {} })),
  updateImage: jest.fn((req, res) => res.status(200).json({ success: true, image: {} })),
  deleteImage: jest.fn((req, res) => res.status(200).json({ success: true })),
  deleteMultipleImages: jest.fn((req, res) => res.status(200).json({ success: true, deletedCount: 2 })),
}));

describe('Site Image Routes Testleri', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/site-images', siteImageRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/site-images', () => {
    it('tüm resimleri getirmeli', async () => {
      const response = await request(app)
        .get('/api/site-images')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('filtrelerle resimleri getirmeli', async () => {
      const response = await request(app)
        .get('/api/site-images?category=project&isActive=true')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/site-images/:id', () => {
    it('resim detayını getirmeli', async () => {
      const response = await request(app)
        .get('/api/site-images/123')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/site-images/public/:id/image', () => {
    it('resmi serve etmeli', async () => {
      const response = await request(app)
        .get('/api/site-images/public/123/image')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/image|video/);
    });
  });

  describe('DELETE /api/site-images/:id', () => {
    it('resmi silmeli', async () => {
      const response = await request(app)
        .delete('/api/site-images/123')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/site-images/delete-multiple', () => {
    it('birden fazla resmi silmeli', async () => {
      const response = await request(app)
        .post('/api/site-images/delete-multiple')
        .send({ ids: ['1', '2'] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.deletedCount).toBe(2));
    });
  });
});

