import mongoose, { Document, Schema } from 'mongoose';

export interface IPushSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PushSubscriptionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Kullanıcı ID gereklidir'],
      index: true,
    },
    endpoint: {
      type: String,
      required: [true, 'Endpoint gereklidir'],
      unique: true,
      trim: true,
    },
    keys: {
      p256dh: {
        type: String,
        required: [true, 'p256dh key gereklidir'],
      },
      auth: {
        type: String,
        required: [true, 'auth key gereklidir'],
      },
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PushSubscriptionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);

