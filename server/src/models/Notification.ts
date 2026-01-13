import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'PROJECT_STARTED' | 'PROJECT_UPDATED' | 'PROJECT_COMPLETED' | 'MAINTENANCE_REMINDER' | 'MAINTENANCE_DUE' | 'EQUIPMENT_ASSIGNED' | 'USER_INVITED' | 'SYSTEM';
  title: string;
  message: string;
  data?: {
    taskId?: string;
    projectId?: string;
    equipmentId?: string;
    maintenanceId?: string;
    userId?: string;
    [key: string]: any;
  };
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Kullanıcı ID gereklidir'],
      index: true,
    },
    type: {
      type: String,
      enum: ['TASK_ASSIGNED', 'TASK_UPDATED', 'PROJECT_STARTED', 'PROJECT_UPDATED', 'PROJECT_COMPLETED', 'MAINTENANCE_REMINDER', 'MAINTENANCE_DUE', 'EQUIPMENT_ASSIGNED', 'USER_INVITED', 'SYSTEM'],
      required: [true, 'Bildirim tipi gereklidir'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Bildirim başlığı gereklidir'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Bildirim mesajı gereklidir'],
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index'ler
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);

