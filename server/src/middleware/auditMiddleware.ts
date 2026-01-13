import { Request, Response, NextFunction } from 'express';
import { logAction } from '../utils/auditLogger';
import logger from '../utils/logger';

/**
 * Middleware to automatically log actions
 * Usage: Add to routes that need audit logging
 */
export const auditMiddleware = (
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT',
  resource: 'Equipment' | 'Project' | 'Task' | 'User' | 'Client' | 'Maintenance' | 'SiteImage' | 'SiteContent' | 'QRCode' | 'Notification' | 'System'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to capture response
    res.json = function (body: any) {
      // Extract resource ID from response or params
      let resourceId = req.params.id || req.params.equipmentId || req.params.projectId || 
                       req.params.taskId || req.params.userId || req.params.clientId || 
                       req.params.maintenanceId || body?._id || body?.id || 'unknown';

      // Convert to string if it's an object
      if (typeof resourceId === 'object' && resourceId !== null) {
        resourceId = resourceId.toString();
      }

      // Log the action asynchronously (don't wait)
      logAction(req, action, resource, resourceId as string).catch(err => {
        // Silently fail - audit logging should not break the main flow
        logger.error('Audit log error:', err);
      });

      // Call original json method
      return originalJson(body);
    };

    next();
  };
};

