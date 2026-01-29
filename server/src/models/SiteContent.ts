import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteContent extends Document {
  section: 'hero' | 'about' | 'services' | 'contact' | 'footer';
  isActive: boolean;
  data: {
    // Hero section
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    rotatingTexts?: string[];
    backgroundVideo?: string; // Cloudinary URL
    backgroundImage?: string; // Cloudinary URL

    // About section
    stats?: Array<{ label: string; value: string; icon?: string }>;

    // Services section
    services?: Array<{ title: string; description: string; icon: string }>;

    // Contact section
    address?: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    mapUrl?: string;

    // Footer section
    socialMedia?: Array<{ platform: string; url: string; icon?: string }>;
    workingHours?: string[];
    companyDescription?: string;
    quickLinks?: Array<{ label: string; href: string }>;
  };
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const SiteContentSchema: Schema = new Schema(
  {
    section: {
      type: String,
      required: true,
      enum: ['hero', 'about', 'services', 'contact', 'footer'],
      unique: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
SiteContentSchema.index({ section: 1, isActive: 1 });

export const SiteContent = mongoose.model<ISiteContent>('SiteContent', SiteContentSchema);
