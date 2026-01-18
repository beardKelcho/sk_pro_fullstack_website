import express from 'express';
import multer from 'multer';
import { authenticate, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '../config/permissions';
import { exportCalendarIcs, getCalendarEvents, importCalendarIcs } from '../controllers/calendar.controller';

const router = express.Router();

// iCal import için multer (sadece .ics dosyaları)
const icsUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/calendar' || file.originalname.toLowerCase().endsWith('.ics')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece .ics dosyaları yüklenebilir'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Calendar merged events (projects + maintenances)
router.get('/events', authenticate, requirePermission(Permission.PROJECT_VIEW), getCalendarEvents);
router.get('/ics', authenticate, requirePermission(Permission.PROJECT_VIEW), exportCalendarIcs);
router.post('/import', authenticate, requirePermission(Permission.PROJECT_CREATE), icsUpload.single('file'), importCalendarIcs);

export default router;

