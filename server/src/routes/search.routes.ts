import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { globalSearch, getSearchSuggestions } from '../controllers/search.controller';
import savedSearchRoutes from './savedSearch.routes';

const router = express.Router();

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Global arama - Tüm modüllerde arama yap
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Arama sorgusu (en az 2 karakter)
 *         example: Analog Way
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Sonuç sayısı limiti
 *     responses:
 *       200:
 *         description: Arama sonuçları
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 query:
 *                   type: string
 *                   example: Analog Way
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 results:
 *                   type: object
 *                   properties:
 *                     equipment:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: equipment
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                     clients:
 *                       type: array
 *                       items:
 *                         type: object
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                     maintenance:
 *                       type: array
 *                       items:
 *                         type: object
 *                 all:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Geçersiz istek
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Yetkisiz erişim
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, globalSearch);

/**
 * @swagger
 * /search/suggestions:
 *   get:
 *     summary: Arama önerileri (autocomplete)
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Arama sorgusu (en az 2 karakter)
 *         example: Acme
 *     responses:
 *       200:
 *         description: Arama önerileri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Acme Corp", "Acme Conference"]
 *       401:
 *         description: Yetkisiz erişim
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/suggestions', authenticate, getSearchSuggestions);

// Kaydedilmiş aramalar ve arama geçmişi
router.use('/', savedSearchRoutes);

export default router;
