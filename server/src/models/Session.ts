import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string; // JWT token (hash'lenmiş)
  refreshToken?: string; // Refresh token (hash'lenmiş)
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
  };
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      index: true,
    },
    deviceInfo: {
      userAgent: String,
      ipAddress: String,
      deviceType: String,
      browser: String,
      os: String,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index - expiresAt tarihinden sonra otomatik sil
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index
SessionSchema.index({ userId: 1, isActive: 1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);

