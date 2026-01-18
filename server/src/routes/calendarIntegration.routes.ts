import express from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import {
  getGoogleCalendarAuthUrl,
  handleGoogleCalendarCallback,
  getOutlookCalendarAuthUrl,
  handleOutlookCalendarCallback,
  listCalendarIntegrations,
  deleteCalendarIntegration,
  syncCalendarImport,
  syncCalendarExport,
} from '../controllers/calendarIntegration.controller';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authenticate);

// Google Calendar OAuth2
router.get('/google/auth-url', requirePermission(Permission.PROJECT_VIEW), getGoogleCalendarAuthUrl);
// Callback authentication gerektirmez (OAuth2 flow - dışarıdan gelir)
router.get('/google/callback', handleGoogleCalendarCallback);

// Outlook Calendar OAuth2
router.get('/outlook/auth-url', requirePermission(Permission.PROJECT_VIEW), getOutlookCalendarAuthUrl);
// Callback authentication gerektirmez (OAuth2 flow - dışarıdan gelir)
router.get('/outlook/callback', handleOutlookCalendarCallback);

// Calendar entegrasyonları
router.get('/list', requirePermission(Permission.PROJECT_VIEW), listCalendarIntegrations);
router.delete('/:id', requirePermission(Permission.PROJECT_CREATE), deleteCalendarIntegration);

// Sync işlemleri
router.post('/:integrationId/import', requirePermission(Permission.PROJECT_CREATE), syncCalendarImport);
router.post('/:integrationId/export', requirePermission(Permission.PROJECT_VIEW), syncCalendarExport);

export default router;
