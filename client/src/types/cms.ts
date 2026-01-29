export interface HeroContent {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    rotatingTexts?: string[];
    backgroundVideo?: string;
    backgroundImage?: string;
}

export interface AboutContent {
    title?: string;
    description?: string;
    image?: string;
    stats?: Array<{ label: string; value: string; icon?: string }>;
}

export interface ServiceItem {
    title: string;
    description: string;
    icon: string;
}

export interface EquipmentItem {
    name: string;
    description?: string;
    image?: string;
}

export interface EquipmentCategory {
    title: string;
    items: EquipmentItem[];
}

export interface ServicesContent {
    title?: string;
    subtitle?: string;
    services?: ServiceItem[];
    equipment?: EquipmentCategory[];
}

export interface ContactContent {
    address?: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    mapUrl?: string;
    workingHours?: string[];
}

export interface FooterContent {
    socialMedia?: Array<{ platform: string; url: string; icon?: string }>;
    companyDescription?: string;
    quickLinks?: Array<{ label: string; href: string }>;
}

export interface SiteContent {
    hero?: HeroContent;
    about?: AboutContent;
    services?: ServicesContent;
    contact?: ContactContent;
    footer?: FooterContent;
}
