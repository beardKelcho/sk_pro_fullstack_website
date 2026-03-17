import mongoose, { Document, Schema } from 'mongoose';

export interface ICalendarIntegration extends Document {
  user: mongoose.Types.ObjectId;
  provider: 'google' | 'outlook';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  calendarId?: string; // Google Calendar ID veya Outlook calendar ID
  syncEnabled: boolean;
  lastSyncAt?: Date;
  syncDirection: 'import' | 'export' | 'bidirectional';
  syncToken?: string; // Google Calendar Incremental Sync Token
  channelId?: string; // Google Push Webhook Channel ID
  channelExpiration?: Date; // Google Push Webhook Channel Expiration Date
  createdAt: Date;
  updatedAt: Date;
}

const CalendarIntegrationSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['google', 'outlook'],
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    expiresAt: {
      type: Date,
      required: false,
    },
    calendarId: {
      type: String,
      required: false,
    },
    syncEnabled: {
      type: Boolean,
      default: true,
    },
    lastSyncAt: {
      type: Date,
      required: false,
    },
    syncDirection: {
      type: String,
      enum: ['import', 'export', 'bidirectional'],
      default: 'bidirectional',
    },
    syncToken: {
      type: String,
      required: false,
    },
    channelId: {
      type: String,
      required: false,
      index: true,
    },
    channelExpiration: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: user + provider (bir kullanıcı için her provider'dan sadece bir entegrasyon)
CalendarIntegrationSchema.index({ user: 1, provider: 1 }, { unique: true });

export const CalendarIntegration = mongoose.model<ICalendarIntegration>(
  'CalendarIntegration',
  CalendarIntegrationSchema
);
