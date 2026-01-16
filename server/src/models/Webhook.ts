import mongoose, { Schema, Document } from 'mongoose';

export type WebhookEventType =
  | 'PROJECT_STATUS_CHANGED'
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED';

export interface IWebhook extends Document {
  name: string;
  url: string;
  enabled: boolean;
  events: WebhookEventType[];
  secret?: string; // HMAC imzalama için opsiyonel secret
  maxAttempts: number; // retry üst sınırı
  timeoutMs: number; // HTTP timeout
  createdAt: Date;
  updatedAt: Date;
}

const WebhookSchema = new Schema<IWebhook>(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true, index: true },
    events: {
      type: [String],
      required: true,
      enum: ['PROJECT_STATUS_CHANGED', 'TASK_ASSIGNED', 'TASK_UPDATED'],
      index: true,
    },
    secret: { type: String, required: false },
    maxAttempts: { type: Number, default: 10, min: 1, max: 50 },
    timeoutMs: { type: Number, default: 10000, min: 1000, max: 60000 },
  },
  { timestamps: true }
);

WebhookSchema.index({ enabled: 1, events: 1 });
WebhookSchema.index({ createdAt: -1 });

const Webhook = mongoose.models.Webhook || mongoose.model<IWebhook>('Webhook', WebhookSchema);
export default Webhook;

