import mongoose, { Schema, Document } from 'mongoose';

export interface IReportSchedule extends Document {
  name: string;
  type: 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  reportType: 'DASHBOARD' | 'EQUIPMENT' | 'PROJECTS' | 'TASKS' | 'MAINTENANCE' | 'ALL';
  recipients: string[]; // Email adresleri
  schedule: {
    frequency: 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
    dayOfWeek?: number; // 0-6 (Pazar=0)
    dayOfMonth?: number; // 1-31
    time?: string; // HH:mm formatında
    cronExpression?: string; // Custom cron expression
  };
  filters?: {
    equipmentType?: string;
    projectStatus?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  format: 'PDF' | 'EXCEL' | 'CSV';
  isActive: boolean;
  lastSent?: Date;
  nextRun?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReportScheduleSchema = new Schema<IReportSchedule>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['WEEKLY', 'MONTHLY', 'CUSTOM'],
      required: true,
    },
    reportType: {
      type: String,
      enum: ['DASHBOARD', 'EQUIPMENT', 'PROJECTS', 'TASKS', 'MAINTENANCE', 'ALL'],
      required: true,
    },
    recipients: [{
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    }],
    schedule: {
      frequency: {
        type: String,
        enum: ['WEEKLY', 'MONTHLY', 'CUSTOM'],
        required: true,
      },
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6,
      },
      dayOfMonth: {
        type: Number,
        min: 1,
        max: 31,
      },
      time: {
        type: String,
        match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, // HH:mm formatı
      },
      cronExpression: {
        type: String,
      },
    },
    filters: {
      equipmentType: String,
      projectStatus: String,
      dateRange: {
        start: Date,
        end: Date,
      },
    },
    format: {
      type: String,
      enum: ['PDF', 'EXCEL', 'CSV'],
      default: 'PDF',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSent: Date,
    nextRun: Date,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index'ler
ReportScheduleSchema.index({ isActive: 1, nextRun: 1 });
ReportScheduleSchema.index({ createdBy: 1 });

export const ReportSchedule = mongoose.model<IReportSchedule>('ReportSchedule', ReportScheduleSchema);

