import express from 'express';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import { exportCalendarIcs, getCalendarEvents } from '../controllers/calendar.controller';

const router = express.Router();

// Calendar merged events (projects + maintenances)
router.get('/events', authenticate, requirePermission(Permission.PROJECT_VIEW), getCalendarEvents);
router.get('/ics', authenticate, requirePermission(Permission.PROJECT_VIEW), exportCalendarIcs);

export default router;

