import express from 'express';
import authRoutes from './auth.routes';
import equipmentRoutes from './equipment.routes';
import projectRoutes from './project.routes';
import clientRoutes from './client.routes';
import userRoutes from './user.routes';
import maintenanceRoutes from './maintenance.routes';
import taskRoutes from './task.routes';
import dashboardRoutes from './dashboard.routes';
import uploadRoutes from './upload.routes';
import exportRoutes from './export.routes';
import importRoutes from './import.routes';
import siteImageRoutes from './siteImage.routes';
import siteContentRoutes from './siteContent.routes';
import qrCodeRoutes from './qrCode.routes';
import notificationRoutes from './notification.routes';
import auditLogRoutes from './auditLog.routes';
import searchRoutes from './search.routes';
import bulkRoutes from './bulk.routes';
import pushSubscriptionRoutes from './pushSubscription.routes';
import notificationSettingsRoutes from './notificationSettings.routes';
import widgetRoutes from './widget.routes';
import reportScheduleRoutes from './reportSchedule.routes';
import versionHistoryRoutes from './versionHistory.routes';
import sessionRoutes from './session.routes';
import twoFactorRoutes from './twoFactor.routes';
import fileCleanupRoutes from './fileCleanup.routes';
import monitoringRoutes from './monitoring.routes';
import calendarRoutes from './calendar.routes';
import mongoose from 'mongoose';
import webhookRoutes from './webhook.routes';
import commentRoutes from './comment.routes';
import emailTemplateRoutes from './emailTemplate.routes';
import realtimeRoutes from './realtime.routes';
import analyticsRoutes from './analytics.routes';

const router = express.Router();

// Ana route
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'SK Production API',
    version: '1.0.0',
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      readyState: mongoose.connection.readyState,
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    },
  });
});

// Route'ları kaydı
router.use('/auth', authRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/projects', projectRoutes);
router.use('/clients', clientRoutes);
router.use('/users', userRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/upload', uploadRoutes);
router.use('/export', exportRoutes);
router.use('/import', importRoutes);
router.use('/site-images', siteImageRoutes);
router.use('/site-content', siteContentRoutes);
router.use('/qr-codes', qrCodeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/search', searchRoutes);
router.use('/bulk', bulkRoutes);
router.use('/push', pushSubscriptionRoutes);
router.use('/notification-settings', notificationSettingsRoutes);
router.use('/widgets', widgetRoutes);
router.use('/report-schedules', reportScheduleRoutes);
router.use('/version-history', versionHistoryRoutes);
router.use('/sessions', sessionRoutes);
router.use('/file-cleanup', fileCleanupRoutes);
router.use('/two-factor', twoFactorRoutes);
router.use('/monitoring', monitoringRoutes);
router.use('/calendar', calendarRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/comments', commentRoutes);
router.use('/email-templates', emailTemplateRoutes);
router.use('/realtime', realtimeRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
