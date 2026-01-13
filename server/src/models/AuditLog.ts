import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  user: mongoose.Types.ObjectId; // User ID who performed the action
  action: string; // CREATE, UPDATE, DELETE, VIEW, etc.
  resource: string; // Equipment, Project, Task, User, etc.
  resourceId: mongoose.Types.ObjectId; // ID of the affected resource
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[]; // Detailed changes for UPDATE actions
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    method?: string; // HTTP method
    endpoint?: string; // API endpoint
    [key: string]: any;
  };
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'LOGIN', 'LOGOUT', 'PERMISSION_CHANGE'],
    },
    resource: {
      type: String,
      required: true,
      enum: ['Equipment', 'Project', 'Task', 'User', 'Client', 'Maintenance', 'SiteImage', 'SiteContent', 'QRCode', 'Notification', 'System', 'PushSubscription', 'NotificationSettings', 'Widget'],
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    changes: [{
      field: String,
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed,
    }],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
AuditLogSchema.index({ user: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 }); // For time-based queries

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

