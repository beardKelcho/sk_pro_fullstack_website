import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteImage extends Document {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  category: 'project' | 'gallery' | 'hero' | 'about' | 'other';
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SiteImageSchema: Schema = new Schema(
  {
    filename: {
      type: String,
      required: [true, 'Dosya adı gereklidir'],
    },
    originalName: {
      type: String,
      required: [true, 'Orijinal dosya adı gereklidir'],
    },
    path: {
      type: String,
      required: [true, 'Dosya yolu gereklidir'],
    },
    url: {
      type: String,
      required: [true, 'URL gereklidir'],
    },
    category: {
      type: String,
      enum: ['project', 'gallery', 'hero', 'about', 'other'],
      default: 'gallery',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Sıralama için index
SiteImageSchema.index({ category: 1, order: 1 });

export default mongoose.model<ISiteImage>('SiteImage', SiteImageSchema);

