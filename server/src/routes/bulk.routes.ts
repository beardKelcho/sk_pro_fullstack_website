import express from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import { bulkDelete, bulkUpdateStatus, bulkAssign } from '../controllers/bulk.controller';

const router = express.Router();

/**
 * @swagger
 * /bulk/delete:
 *   delete:
 *     summary: Toplu silme işlemi
 *     tags: [Bulk Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource
 *               - ids
 *             properties:
 *               resource:
 *                 type: string
 *                 enum: [equipment, project, task, user, maintenance]
 *                 example: equipment
 *                 description: Silinecek kaynak tipi
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                 description: Silinecek kayıt ID'leri
 *     responses:
 *       200:
 *         description: Başarılı silme
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 deletedCount:
 *                   type: integer
 *                   example: 2
 *                 message:
 *                   type: string
 *                   example: 2 öğe başarıyla silindi
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
router.delete(
  '/delete',
  authenticate,
  requirePermission(Permission.USER_DELETE), // Genel silme yetkisi kontrolü
  bulkDelete
);

/**
 * @swagger
 * /bulk/status:
 *   put:
 *     summary: Toplu durum değiştirme
 *     tags: [Bulk Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource
 *               - ids
 *               - status
 *             properties:
 *               resource:
 *                 type: string
 *                 enum: [equipment, project, task, user, maintenance]
 *                 example: equipment
 *                 description: Güncellenecek kaynak tipi
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011"]
 *                 description: Güncellenecek kayıt ID'leri
 *               status:
 *                 type: string
 *                 example: Available
 *                 description: Yeni durum değeri
 *     responses:
 *       200:
 *         description: Başarılı güncelleme
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 updatedCount:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 1 öğenin durumu güncellendi
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
router.put(
  '/status',
  authenticate,
  bulkUpdateStatus
);

/**
 * @swagger
 * /bulk/assign:
 *   put:
 *     summary: Toplu atama (görevler için)
 *     tags: [Bulk Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource
 *               - ids
 *               - assignedTo
 *             properties:
 *               resource:
 *                 type: string
 *                 enum: [task]
 *                 example: task
 *                 description: Sadece task kaynak tipi desteklenir
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011"]
 *                 description: Atanacak görev ID'leri
 *               assignedTo:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439013
 *                 description: Atanacak kullanıcı ID'si
 *     responses:
 *       200:
 *         description: Başarılı atama
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 updatedCount:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 1 görev atandı
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
router.put(
  '/assign',
  authenticate,
  requirePermission(Permission.TASK_UPDATE),
  bulkAssign
);

export default router;
