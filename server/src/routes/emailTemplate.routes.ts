import express from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import {
  listEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  previewEmailTemplate,
} from '../controllers/emailTemplate.controller';

const router = express.Router();

router.use(authenticate);
router.use(requirePermission(Permission.EMAIL_TEMPLATE_MANAGE));

router.get('/', listEmailTemplates);
router.post('/', createEmailTemplate);
router.post('/preview', previewEmailTemplate);
router.get('/:id', getEmailTemplate);
router.put('/:id', updateEmailTemplate);
router.delete('/:id', deleteEmailTemplate);

export default router;

