import mongoose, { Schema, Document } from 'mongoose';
import type { WebhookEventType } from './Webhook';

export type WebhookDeliveryStatus = 'PENDING' | 'RETRYING' | 'SUCCESS' | 'FAILED';

export interface IWebhookDelivery extends Document {
  webhook: mongoose.Types.ObjectId;
  event: WebhookEventType;
  payload: any;
  status: WebhookDeliveryStatus;
  attempts: number;
  nextAttemptAt: Date;
  lastAttemptAt?: Date;
  lastStatusCode?: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookDeliverySchema = new Schema<IWebhookDelivery>(
  {
    webhook: { type: Schema.Types.ObjectId, ref: 'Webhook', required: true, index: true },
    event: {
      type: String,
      required: true,
      enum: ['PROJECT_STATUS_CHANGED', 'TASK_ASSIGNED', 'TASK_UPDATED'],
      index: true,
    },
    payload: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'RETRYING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    attempts: { type: Number, default: 0, index: true },
    nextAttemptAt: { type: Date, required: true, index: true },
    lastAttemptAt: { type: Date },
    lastStatusCode: { type: Number },
    lastError: { type: String },
  },
  { timestamps: true }
);

WebhookDeliverySchema.index({ status: 1, nextAttemptAt: 1, attempts: 1 });
WebhookDeliverySchema.index({ createdAt: -1 });

const WebhookDelivery =
  mongoose.models.WebhookDelivery || mongoose.model<IWebhookDelivery>('WebhookDelivery', WebhookDeliverySchema);

export default WebhookDelivery;

