import express from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import {
  listWebhooks,
  getWebhook,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  listDeliveries,
} from '../controllers/webhook.controller';

const router = express.Router();

router.use(authenticate);
router.use(requirePermission(Permission.WEBHOOK_MANAGE));

router.get('/', listWebhooks);
router.post('/', createWebhook);
router.get('/:id', getWebhook);
router.put('/:id', updateWebhook);
router.delete('/:id', deleteWebhook);
router.post('/:id/test', testWebhook);
router.get('/:id/deliveries', listDeliveries);

export default router;

