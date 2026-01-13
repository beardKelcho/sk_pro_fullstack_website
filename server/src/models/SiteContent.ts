import mongoose, { Document, Schema } from 'mongoose';

// Hero bölümü için
export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundVideo?: string;
  backgroundImage?: string;
  rotatingTexts?: string[];
}

// Hizmet bölümü için
export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
  order: number;
}

// Ekipman bölümü için
export interface EquipmentCategory {
  title: string;
  items: {
    name: string;
    description: string;
  }[];
  order: number;
}

// Hakkımızda bölümü için
export interface AboutContent {
  title: string;
  description: string;
  image?: string;
  stats: {
    label: string;
    value: string;
  }[];
}

// İletişim bilgileri için
export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
  mapLink?: string;
}

// Sosyal medya linkleri için
export interface SocialMedia {
  platform: string;
  url: string;
  icon?: string;
}

// Footer içeriği için
export interface FooterContent {
  copyright: string;
  links?: {
    text: string;
    url: string;
  }[];
}

// Ana site içeriği interface
export interface ISiteContent extends Document {
  section: 'hero' | 'services' | 'equipment' | 'about' | 'contact' | 'footer' | 'social' | 'projects';
  content: HeroContent | ServiceItem[] | EquipmentCategory[] | AboutContent | ContactInfo | FooterContent | SocialMedia[] | any;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SiteContentSchema: Schema = new Schema(
  {
    section: {
      type: String,
      enum: ['hero', 'services', 'equipment', 'about', 'contact', 'footer', 'social', 'projects'],
      required: [true, 'Bölüm adı gereklidir'],
      unique: true,
    },
    content: {
      type: Schema.Types.Mixed,
      required: [true, 'İçerik gereklidir'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Section ve order için index
SiteContentSchema.index({ section: 1, order: 1 });

export default mongoose.model<ISiteContent>('SiteContent', SiteContentSchema);

