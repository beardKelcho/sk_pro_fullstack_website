import mongoose, { Schema, Document } from 'mongoose';

export type EmailTemplateLocale = 'tr' | 'en' | string;

export interface IEmailTemplateLocalizedContent {
  subject: string;
  html: string;
}

export interface IEmailTemplateVariant {
  name: string;
  weight: number;
  locales: Record<EmailTemplateLocale, IEmailTemplateLocalizedContent>;
}

export interface IEmailTemplate extends Document {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  variants: IEmailTemplateVariant[];
  createdAt: Date;
  updatedAt: Date;
}

const LocalizedContentSchema = new Schema<IEmailTemplateLocalizedContent>(
  {
    subject: { type: String, required: true, trim: true },
    html: { type: String, required: true },
  },
  { _id: false }
);

const VariantSchema = new Schema<IEmailTemplateVariant>(
  {
    name: { type: String, required: true, trim: true },
    weight: { type: Number, required: true, default: 100, min: 0 },
    locales: { type: Schema.Types.Mixed, required: true, default: {} },
  },
  { _id: false }
);

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    key: { type: String, required: true, trim: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    enabled: { type: Boolean, required: true, default: true },
    variants: { type: [VariantSchema], required: true, default: [] },
  },
  { timestamps: true }
);

const EmailTemplate = mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
export default EmailTemplate;

