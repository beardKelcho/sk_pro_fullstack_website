// Controller re-exports
import authController from './auth.controller';
// import equipmentController from './equipment.controller';
import projectController from './project.controller';
import * as clientController from './client.controller';
import userController from './user.controller';
import * as maintenanceController from './maintenance.controller';
import * as taskController from './task.controller';
import * as dashboardController from './dashboard.controller';
import * as exportController from './export.controller';
import * as siteImageController from './siteImage.controller';
import * as siteContentController from './siteContent.controller';
import * as qrCodeController from './qrCode.controller';
import * as auditLogController from './auditLog.controller';
import * as pushSubscriptionController from './pushSubscription.controller';
import * as pushNotificationController from './pushNotification.controller';
import * as notificationSettingsController from './notificationSettings.controller';
import * as twoFactorController from './twoFactor.controller';

export {
  authController,
  // equipmentController, // Removed - replaced by inventoryController
  projectController,
  clientController,
  userController,
  maintenanceController,
  taskController,
  dashboardController,
  exportController,
  siteImageController,
  siteContentController,
  qrCodeController,
  auditLogController,
  pushSubscriptionController,
  pushNotificationController,
  notificationSettingsController,
  twoFactorController
}; 