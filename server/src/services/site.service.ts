import mongoose from 'mongoose';
import { SiteContent } from '../models/SiteContent';
import SiteImage from '../models/SiteImage';
import { AppError } from '../types/common';
import logger from '../utils/logger';
import { getRedisClient } from '../config/redis';

// Old ISiteImage interface kept for SiteImage methods which haven't changed
export interface ISiteImage extends mongoose.Document {
    filename: string;
    originalName: string;
    path: string;
    url: string;
    category: string;
    order: number;
    isActive: boolean;
}

class SiteService {
    private readonly cdnBaseUrl = 'https://res.cloudinary.com/dmeviky6f';

    private async invalidateCache(pattern: string): Promise<void> {
        const redisClient = getRedisClient();
        if (!redisClient) return;
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(keys);
                logger.info(`Redis cache temizlendi: ${pattern}`, { count: keys.length });
            }
        } catch (err) {
            logger.warn('Redis invalidation hatası', { error: String(err) });
        }
    }

    /**
     * Helper: Fix Content URLs (moved from controller)
     */
    async fixContentUrls(content: unknown): Promise<unknown> {
        try {
            if (!content) return content;

            const idsToResolve = new Set<string>();
            const urlMap = new Map<string, { type: 'image' | 'video', originalUrl: string }>();

            // Recursive or structured collection could be better, but sticking to existing logic for parity
            const collectId = (url: unknown, type: 'image' | 'video' = 'image') => {
                try {
                    if (typeof url !== 'string' || !url) return;
                    if (url.includes('cloudinary.com')) return;

                    const idCandidate = url.replace(/^\/?api\/site-images\//, '')
                        .replace(/^\/?uploads\//, '')
                        .replace(/^\//, '');

                    // Strict MongoDB ObjectId validation (24 hex characters)
                    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idCandidate);

                    if (isObjectId) {
                        idsToResolve.add(idCandidate);
                        urlMap.set(url, { type, originalUrl: url });
                    }
                } catch (err) {
                    // Ignore parsing errors for individual fields
                }
            };

            const fixedContent = JSON.parse(JSON.stringify(content));

            // Scan specific known fields - mapped to new schema structure or potential old one
            collectId(fixedContent.backgroundVideo, 'video');
            collectId(fixedContent.backgroundImage, 'image');
            collectId(fixedContent.selectedVideo, 'video');
            collectId(fixedContent.image, 'image');

            if (Array.isArray(fixedContent.availableVideos)) {
                fixedContent.availableVideos.forEach((video: any) => collectId(video?.url, 'video'));
            }

            if (Array.isArray(fixedContent.services)) {
                fixedContent.services.forEach((service: any) => collectId(service?.icon, 'image'));
            }

            // Fetch resolving images
            const imageMap = new Map<string, { filename: string, url: string }>();
            if (idsToResolve.size > 0) {
                const images = await SiteImage.find({ _id: { $in: Array.from(idsToResolve) } });
                images.forEach(img => {
                    imageMap.set(img._id.toString(), {
                        filename: img.filename,
                        url: img.url
                    });
                });
            }

            return this.applyUrlFixes(fixedContent, imageMap);
        } catch (error) {
            logger.error('Content URL fix failed, returning original content:', error);
            return content;
        }
    }

    private buildStrictUrl(filename: string | undefined, existingUrl: string | undefined, type: 'image' | 'video'): string {
        // Priority 1: Keep existing Cloudinary URL with HTTPS fix
        if (existingUrl && existingUrl.includes('res.cloudinary.com')) {
            return existingUrl;
        }

        if (existingUrl && existingUrl.includes('cloudinary.com')) {
            let finalUrl = existingUrl;
            if (finalUrl.startsWith('http:')) {
                finalUrl = finalUrl.replace('http:', 'https:');
            } else if (!finalUrl.startsWith('https:')) {
                finalUrl = `https://${finalUrl.replace(/^\/\//, '')}`;
            }
            return finalUrl;
        }

        // Priority 2: Reconstruct from filename or fix broken URL
        if (filename && !filename.startsWith('http')) {
            let cleanFilename = filename.split('/').pop() || filename;
            const resourceType = type;
            const ext = cleanFilename.split('.').pop()?.toLowerCase();
            const hasExt = ext && (ext.length === 3 || ext.length === 4);

            if (!hasExt) {
                if (resourceType === 'video') cleanFilename += '.mp4';
                else cleanFilename += '.jpg';
            }
            return `${this.cdnBaseUrl}/${resourceType}/upload/v1/${cleanFilename}`;
        }

        // Priority 3: Fix existing URL if it's just a path/ID
        if (existingUrl && !existingUrl.startsWith('http') && !existingUrl.startsWith('/')) {
            // Treat as ID or partial path
            return `${this.cdnBaseUrl}/${type}/upload/v1/${existingUrl}`;
        }

        return existingUrl || '';
    }

    private resolveUrl(
        inputUrl: string | undefined,
        inputFilename: string | undefined,
        type: 'image' | 'video',
        imageMap: Map<string, { filename: string, url: string }>
    ): string | undefined {
        if (inputUrl && inputUrl.includes('cloudinary.com')) {
            return this.buildStrictUrl(undefined, inputUrl, type);
        }

        let idCandidate = inputUrl;
        if (idCandidate) {
            idCandidate = idCandidate.replace(/^\/?api\/site-images\//, '')
                .replace(/^\/?uploads\//, '')
                .replace(/^\//, '');

            if (mongoose.Types.ObjectId.isValid(idCandidate)) {
                const data = imageMap.get(idCandidate!);
                if (data) {
                    return this.buildStrictUrl(data.filename, data.url, type);
                }
            }
        }

        if (inputFilename) {
            return this.buildStrictUrl(inputFilename, undefined, type);
        }

        return this.buildStrictUrl(undefined, inputUrl, type);
    }

    private applyUrlFixes(content: any, imageMap: Map<string, { filename: string, url: string }>): any {
        if (content.backgroundVideo) content.backgroundVideo = this.resolveUrl(content.backgroundVideo, undefined, 'video', imageMap);
        if (content.backgroundImage) content.backgroundImage = this.resolveUrl(content.backgroundImage, undefined, 'image', imageMap);
        if (content.selectedVideo) content.selectedVideo = this.resolveUrl(content.selectedVideo, undefined, 'video', imageMap);
        if (content.image) content.image = this.resolveUrl(content.image, undefined, 'image', imageMap);

        if (Array.isArray(content.availableVideos)) {
            content.availableVideos = content.availableVideos.map((video: any) => {
                let filename = video.filename;
                let url = video.url;

                if (url && !url.includes('cloudinary.com')) {
                    const id = url.replace(/^\/?api\/site-images\//, '').replace(/^\/?uploads\//, '').replace(/^\//, '');
                    if (imageMap.has(id)) {
                        const data = imageMap.get(id)!;
                        filename = data.filename;
                        url = data.url;
                    }
                }
                const strictUrl = this.buildStrictUrl(filename, url, 'video');
                // Eğer strictUrl boş döndüyse ve orijinal url 'cloudinary' içeriyorsa koru
                return {
                    ...video,
                    url: strictUrl || url
                };
            });
        }

        if (Array.isArray(content.services)) {
            content.services = content.services.map((service: any) => ({
                ...service,
                icon: this.resolveUrl(service.icon, undefined, 'image', imageMap) || service.icon
            }));
        }

        return content;
    }

    /**
     * Fix Image Object Helper (Public)
     */
    fixImageUrls(imagePlainObj: any): any {
        if (!imagePlainObj) return imagePlainObj;

        const fix = (filename: string | undefined, existingUrl: string | undefined, category: string) => {
            // Reusing buildStrictUrl logic but slightly adapted for category detection
            if (existingUrl && existingUrl.includes('cloudinary.com')) {
                // ... same https fix ...
                let finalUrl = existingUrl;
                if (finalUrl.startsWith('http:')) finalUrl = finalUrl.replace('http:', 'https:');
                else if (!finalUrl.startsWith('https:')) finalUrl = `https://${finalUrl.replace(/^\/\//, '')}`;
                return finalUrl;
            }

            if (filename) {
                let cleanFilename = filename.split('/').pop() || filename;
                let resourceType = 'image';
                const ext = cleanFilename.split('.').pop()?.toLowerCase();
                const hasExt = ext && (ext.length === 3 || ext.length === 4);

                if (category === 'video' || (hasExt && ['mp4', 'webm', 'mov', 'avi'].includes(ext!))) {
                    resourceType = 'video';
                }

                if (!hasExt) {
                    if (resourceType === 'video') cleanFilename += '.mp4';
                    else cleanFilename += '.jpg';
                }
                return `${this.cdnBaseUrl}/${resourceType}/upload/v1/${cleanFilename}`;
            }
            return '';
        };

        const fixed = { ...imagePlainObj }; // Shallow copy
        if (fixed.filename || fixed.url) {
            fixed.url = fix(fixed.filename, fixed.url, fixed.category || 'gallery');
        }
        return fixed;
    }


    /* --- Content Methods --- */

    async listContents(section?: string, isActive?: boolean): Promise<any[]> {
        const cacheKey = `site:contents:${section || 'all'}:${isActive ?? 'all'}`;
        const redisClient = getRedisClient();

        if (redisClient) {
            try {
                const cached = await redisClient.get(cacheKey);
                if (cached) return JSON.parse(cached);
            } catch (err) {
                logger.warn('Redis okuma hatası', { error: String(err) });
            }
        }

        const filters: any = {};
        if (section) filters.section = section;
        if (isActive !== undefined) filters.isActive = isActive;

        // NOTE: 'order' field removed from schema, removed sort by order
        const contents = await SiteContent.find(filters).select('-__v').sort({ createdAt: -1 }).lean();

        const result = await Promise.all(contents.map(async (doc: any) => {
            const docObj = { ...doc };
            // Use 'data' instead of 'content'
            docObj.data = await this.fixContentUrls(docObj.data) as any;
            return docObj;
        }));

        if (redisClient) {
            try {
                // 1 saat (3600 sn) cache süresi
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));
            } catch (err) {
                logger.warn('Redis yazma hatası', { error: String(err) });
            }
        }

        return result;
    }

    async getContentBySection(section: string): Promise<any | null> {
        const normalized = section.toLowerCase().trim();
        const cacheKey = `site:content:${normalized}`;
        const redisClient = getRedisClient();

        if (redisClient) {
            try {
                const cached = await redisClient.get(cacheKey);
                if (cached) return JSON.parse(cached);
            } catch (err) {
                logger.warn('Redis okuma hatası', { error: String(err) });
            }
        }

        const content = await SiteContent.findOne({ section: normalized, isActive: true }).select('-__v').lean();

        if (!content) return null;

        const docObj = { ...content };
        docObj.data = await this.fixContentUrls((docObj as any).data) as any;

        if (redisClient) {
            try {
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(docObj));
            } catch (err) {
                logger.warn('Redis yazma hatası', { error: String(err) });
            }
        }

        return docObj;
    }

    async createOrUpdateContent(section: string, contentData: any, order?: number, isActive?: boolean): Promise<any> {
        // EĞER HERO VİDEOSU VARSA URL'İ DÜZELT
        if (contentData && (contentData as any).videoUrl) {
            const data = contentData as any;
            if (!data.videoUrl.startsWith('http')) {
                data.videoUrl = `https://res.cloudinary.com/dmeviky6f/video/upload/${data.videoUrl}`;
            }
        }

        let siteContent = await SiteContent.findOne({ section });

        if (siteContent) {
            // Use 'data' instead of 'content'
            siteContent.data = contentData;
            // 'order' removed from schema, ignoring parameter
            if (isActive !== undefined) siteContent.isActive = isActive;
            console.log('Modified content for section (createOrUpdate):', section);
            siteContent.markModified('data');
            await siteContent.save();
        } else {
            siteContent = await SiteContent.create({
                section,
                data: contentData,
                // order: order || 0, // removed
                isActive: isActive !== undefined ? isActive : true
            });
        }

        const docObj = siteContent.toObject();
        docObj.data = await this.fixContentUrls(docObj.data) as any;

        await this.invalidateCache('site:content*');

        return docObj;
    }

    async updateContentById(id: string, data: { content?: any, order?: number, isActive?: boolean }): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Geçersiz ID', 400);

        // Compatibility mapping: if 'content' passed, treat as 'data'
        const inputData = data.content || {};

        // EĞER HERO VİDEOSU VARSA URL'İ DÜZELT
        if (inputData && inputData.videoUrl) {
            if (!inputData.videoUrl.startsWith('http')) {
                inputData.videoUrl = `https://res.cloudinary.com/dmeviky6f/video/upload/${inputData.videoUrl}`;
            }
        }

        const siteContent = await SiteContent.findById(id);
        if (!siteContent) throw new AppError('İçerik bulunamadı', 404);

        if (data.content) siteContent.data = inputData;
        // if (data.order !== undefined) siteContent.order = data.order; // removed
        if (data.isActive !== undefined) siteContent.isActive = data.isActive;

        console.log('Modified content (updateContentById) for id:', id);
        siteContent.markModified('data');
        await siteContent.save();

        const docObj = siteContent.toObject();
        console.log('SITE_CONTENT_SAVED:', docObj.data);
        docObj.data = await this.fixContentUrls(docObj.data) as any;

        await this.invalidateCache('site:content*');

        return docObj;
    }

    async deleteContent(id: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Geçersiz ID', 400);
        await SiteContent.deleteOne({ _id: id });
        await this.invalidateCache('site:content*');
    }

    /* --- Image Methods --- */

    async listImages(category?: string, isActive?: boolean): Promise<any[]> {
        const cacheKey = `site:images:${category || 'all'}:${isActive ?? 'all'}`;
        const redisClient = getRedisClient();

        if (redisClient) {
            try {
                const cached = await redisClient.get(cacheKey);
                if (cached) return JSON.parse(cached);
            } catch (err) {
                logger.warn('Redis okuma hatası', { error: String(err) });
            }
        }

        const filters: any = {};
        if (category) filters.category = category;
        if (isActive !== undefined) filters.isActive = isActive;

        const images = await SiteImage.find(filters).select('-__v').sort({ category: 1, order: 1, createdAt: -1 }).lean();
        const result = images.map((img: any) => this.fixImageUrls(img));

        if (redisClient) {
            try {
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));
            } catch (err) {
                logger.warn('Redis yazma hatası', { error: String(err) });
            }
        }

        return result;
    }

    async getImageById(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Geçersiz ID', 400);
        const image = await SiteImage.findById(id).select('-__v').lean();
        if (!image) throw new AppError('Resim bulunamadı', 404);
        return this.fixImageUrls(image as any);
    }

    async createImage(data: { filename: string, originalName: string, path: string, url: string, category?: string, order?: number }): Promise<any> {
        const image = await SiteImage.create({
            ...data,
            category: (data.category || 'gallery') as any,
            order: data.order || 0,
            isActive: true
        });

        await this.invalidateCache('site:images*');

        return image;
    }

    async updateImage(id: string, data: { category?: string, order?: number, isActive?: boolean }): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Geçersiz ID', 400);
        const image = await SiteImage.findById(id);
        if (!image) throw new AppError('Resim bulunamadı', 404);

        if (data.category) image.category = data.category as any;
        if (data.order !== undefined) image.order = data.order;
        if (data.isActive !== undefined) image.isActive = data.isActive;

        await image.save();

        await this.invalidateCache('site:images*');

        return image;
    }

    async deleteImage(id: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Geçersiz ID', 400);
        await SiteImage.deleteOne({ _id: id });
        await this.invalidateCache('site:images*');
    }

    async deleteMultipleImages(ids: string[]): Promise<void> {
        await SiteImage.deleteMany({ _id: { $in: ids } });
        await this.invalidateCache('site:images*');
    }

    async updateImageOrders(updates: { id: string, order: number }[]): Promise<void> {
        await Promise.all(updates.map(u => SiteImage.findByIdAndUpdate(u.id, { order: u.order })));
        await this.invalidateCache('site:images*');
    }
}

export default new SiteService();
