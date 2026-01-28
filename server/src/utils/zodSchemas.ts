import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
    email: z.string().trim().min(1, 'Email veya telefon gereklidir'), // Email or Phone regex validation can be added
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır')
});

export const requestPasswordResetSchema = z.object({
    email: z.string().email('Geçerli bir email adresi giriniz')
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token gereklidir'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır')
});

// Site Image Schemas
export const siteImageCategoryEnum = z.enum(['project', 'gallery', 'hero', 'about', 'video', 'other']);

export const createSiteImageSchema = z.object({
    filename: z.string().optional(),
    originalName: z.string().optional(),
    category: siteImageCategoryEnum.default('gallery'),
    order: z.coerce.number().default(0),
    isActive: z.coerce.boolean().default(true),
    // File upload fields are handled separately usually, but metadata can be validated here
});

export const updateSiteImageSchema = z.object({
    category: siteImageCategoryEnum.optional(),
    order: z.coerce.number().optional(),
    isActive: z.coerce.boolean().optional(),
    title: z.string().optional(),
    description: z.string().optional()
});

// Site Content Schemas
export const contentSectionEnum = z.enum(['about-us', 'contact', 'services', 'metrics', 'social-media', 'seo', 'footer', 'general']);

export const createSiteContentSchema = z.object({
    section: contentSectionEnum,
    content: z.any(), // Flexible content structure matching Mongoose Mixed type
    isPublic: z.boolean().default(true).optional(),
    order: z.coerce.number().default(0),
    isActive: z.coerce.boolean().default(true)
});

export const updateSiteContentSchema = createSiteContentSchema.partial();
