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
import siteImageRoutes from './siteImage.routes';
import siteContentRoutes from './siteContent.routes';

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
router.use('/site-images', siteImageRoutes);
router.use('/site-content', siteContentRoutes);

export default router; 