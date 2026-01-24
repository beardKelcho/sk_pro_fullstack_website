export interface SiteContent {
    _id?: string;
    section: string;
    content: Record<string, unknown>; // Flexible content structure
    order: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface SiteImage {
    _id?: string;
    filename: string;
    originalName: string;
    path: string;
    url: string;
    category: 'video' | 'project' | 'gallery' | 'hero' | 'about' | 'other';
    order: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface SiteContentForm {
    section: string;
    content: Record<string, unknown>;
    order?: number;
    isActive?: boolean;
}

export interface SiteImageForm {
    filename: string;
    originalName: string;
    path: string;
    url: string;
    category?: string;
    order?: number;
}
