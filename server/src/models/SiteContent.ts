import mongoose, { Document, Schema } from 'mongoose';

// Localized String Helper
export interface LocalizedString {
  tr: string;
  en: string;
  fr?: string;
  es?: string;
}

// Hero bölümü için
export interface HeroContent {
  title: LocalizedString;
  subtitle: LocalizedString;
  description: LocalizedString;
  buttonText: LocalizedString;
  buttonLink: string;
  backgroundVideo?: string; // Seçili video URL'i
  selectedVideo?: string; // Aktif olarak gösterilen video URL'i
  availableVideos?: Array<{ url: string; filename: string; uploadedAt?: string }>;
  backgroundImage?: string;
  rotatingTexts?: LocalizedString[];
}

// Hizmet bölümü için
export interface ServiceItem {
  title: LocalizedString;
  description: LocalizedString;
  icon: string;
  order: number;
}

// Ekipman bölümü için
export interface EquipmentCategory {
  title: LocalizedString;
  items: {
    name: string;
    description: LocalizedString;
  }[];
  order: number;
}

// Hakkımızda bölümü için
export interface AboutContent {
  title: LocalizedString;
  description: LocalizedString;
  image?: string;
  stats: {
    label: LocalizedString;
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
  copyright: LocalizedString;
  links?: {
    text: LocalizedString;
    url: string;
  }[];
}

// Hizmetler ve Ekipmanlar birleşik bölümü için
export interface ServicesEquipmentContent {
  title: LocalizedString;
  subtitle: LocalizedString;
  services: ServiceItem[];
  equipment: EquipmentCategory[];
  backgroundImage?: string;
  order: number;
}

// Ana site içeriği interface
export interface ISiteContent extends Document {
  section: 'hero' | 'services' | 'equipment' | 'services-equipment' | 'about' | 'contact' | 'footer' | 'social' | 'projects';
  content: HeroContent | ServiceItem[] | EquipmentCategory[] | ServicesEquipmentContent | AboutContent | ContactInfo | FooterContent | SocialMedia[] | any;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SiteContentSchema: Schema = new Schema(
  {
    section: {
      type: String,
      enum: ['hero', 'services', 'equipment', 'services-equipment', 'about', 'contact', 'footer', 'social', 'projects'],
      default: 'hero', // Default added instead of required
      unique: true,
    },
    content: {
      type: Schema.Types.Mixed,
      default: function () {
        // @ts-ignore
        const section = this.section;
        if (section === 'hero') {
          return {
            title: { tr: "Piksellerin Ötesinde Görüntü Çözümleri", en: "Visual Solutions Beyond Pixels" },
            subtitle: { tr: "Profesyonel Sahne Teknolojileri", en: "Professional Stage Technologies" },
            description: {
              tr: "SK Production ile etkinliklerinize profesyonel görüntü rejisi ve medya server çözümleri sunuyoruz.",
              en: "We offer professional visual direction and media server solutions for your events with SK Production."
            },
            buttonText: { tr: "Projelerimiz", en: "Our Projects" },
            buttonLink: "#projects",
            rotatingTexts: [
              { tr: "Piksellerin Ötesinde", en: "Beyond Pixels" },
              { tr: "Görüntü Yönetimi", en: "Visual Management" },
              { tr: "Medya Server", en: "Media Server" }
            ]
          };
        }
        if (section === 'about') {
          return {
            title: { tr: "Hakkımızda", en: "About Us" },
            description: {
              tr: "10+ Yıllık sektör tecrübemizle, en son teknoloji medya sunucu sistemleri ve profesyonel ekibimizle hizmetinizdeyiz.",
              en: "With over 10 years of industry experience, we are at your service with state-of-the-art media server systems and our professional team."
            },
            stats: [
              { label: { tr: "Sektör Tecrübesi", en: "Industry Experience" }, value: "9+ Yıl" },
              { label: { tr: "Tamamlanan Proje", en: "Completed Projects" }, value: "250+" }
            ]
          };
        }
        return {};
      },
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
