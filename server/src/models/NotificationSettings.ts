import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationSettings extends Document {
  userId: mongoose.Types.ObjectId;
  // Push notification ayarları
  pushEnabled: boolean;
  pushTypes: {
    TASK_ASSIGNED: boolean;
    TASK_UPDATED: boolean;
    PROJECT_STARTED: boolean;
    PROJECT_UPDATED: boolean;
    PROJECT_COMPLETED: boolean;
    MAINTENANCE_REMINDER: boolean;
    MAINTENANCE_DUE: boolean;
    EQUIPMENT_ASSIGNED: boolean;
    USER_INVITED: boolean;
    SYSTEM: boolean;
  };
  // Email notification ayarları
  emailEnabled: boolean;
  emailTypes: {
    TASK_ASSIGNED: boolean;
    TASK_UPDATED: boolean;
    PROJECT_STARTED: boolean;
    PROJECT_UPDATED: boolean;
    PROJECT_COMPLETED: boolean;
    MAINTENANCE_REMINDER: boolean;
    MAINTENANCE_DUE: boolean;
    EQUIPMENT_ASSIGNED: boolean;
    USER_INVITED: boolean;
    SYSTEM: boolean;
  };
  // In-app notification ayarları (her zaman aktif)
  inAppEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSettingsSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Kullanıcı ID gereklidir'],
      unique: true,
    },
    pushEnabled: {
      type: Boolean,
      default: true,
    },
    pushTypes: {
      TASK_ASSIGNED: { type: Boolean, default: true },
      TASK_UPDATED: { type: Boolean, default: true },
      PROJECT_STARTED: { type: Boolean, default: true },
      PROJECT_UPDATED: { type: Boolean, default: true },
      PROJECT_COMPLETED: { type: Boolean, default: true },
      MAINTENANCE_REMINDER: { type: Boolean, default: true },
      MAINTENANCE_DUE: { type: Boolean, default: true },
      EQUIPMENT_ASSIGNED: { type: Boolean, default: true },
      USER_INVITED: { type: Boolean, default: true },
      SYSTEM: { type: Boolean, default: true },
    },
    emailEnabled: {
      type: Boolean,
      default: true,
    },
    emailTypes: {
      TASK_ASSIGNED: { type: Boolean, default: true },
      TASK_UPDATED: { type: Boolean, default: true },
      PROJECT_STARTED: { type: Boolean, default: true },
      PROJECT_UPDATED: { type: Boolean, default: true },
      PROJECT_COMPLETED: { type: Boolean, default: true },
      MAINTENANCE_REMINDER: { type: Boolean, default: true },
      MAINTENANCE_DUE: { type: Boolean, default: true },
      EQUIPMENT_ASSIGNED: { type: Boolean, default: true },
      USER_INVITED: { type: Boolean, default: true },
      SYSTEM: { type: Boolean, default: true },
    },
    inAppEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<INotificationSettings>('NotificationSettings', NotificationSettingsSchema);

