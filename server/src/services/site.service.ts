import mongoose from 'mongoose';
import SiteContent from '../models/SiteContent';
import SiteImage from '../models/SiteImage';
import { AppError } from '../types/common';
import logger from '../utils/logger';


// Interface definitions (would ideally be in types/site.ts or models)
export interface ISiteContent extends mongoose.Document {
    section: string;
    content: Record<string, unknown>;
    order: number;
    isActive: boolean;
}

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

            // Scan specific known fields
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
        const filters: any = {};
        if (section) filters.section = section;
        if (isActive !== undefined) filters.isActive = isActive;

        const contents = await SiteContent.find(filters).sort({ order: 1, createdAt: -1 });

        return Promise.all(contents.map(async (doc) => {
            const docObj = doc.toObject();
            docObj.content = await this.fixContentUrls(docObj.content);
            return docObj;
        }));
    }

    async getContentBySection(section: string): Promise<any | null> {
        const normalized = section.toLowerCase().trim();
        const content = await SiteContent.findOne({ section: normalized, isActive: true });

        if (!content) return null;

        const docObj = content.toObject();
        docObj.content = await this.fixContentUrls(docObj.content);
        return docObj;
    }

    async createOrUpdateContent(section: string, contentData: any, order?: number, isActive?: boolean): Promise<any> {
        let siteContent = await SiteContent.findOne({ section });

        if (siteContent) {
            siteContent.content = contentData;
            if (order !== undefined) siteContent.order = order;
            if (isActive !== undefined) siteContent.isActive = isActive;
            console.log('Modified content for section (createOrUpdate):', section);
            siteContent.markModified('content');
            await siteContent.save();
        } else {
            siteContent = await SiteContent.create({
                section,
                content: contentData,
                order: order || 0,
                isActive: isActive !== undefined ? isActive : true
            });
        }

        const docObj = siteContent.toObject();
        docObj.content = await this.fixContentUrls(docObj.content);
        return docObj;
    }

    async updateContentById(id: string, data: { content?: any, order?: number, isActive?: boolean }): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Geçersiz ID', 400);

        const siteContent = await SiteContent.findById(id);
        if (!siteContent) throw new AppError('İçerik bulunamadı', 404);

        if (data.content) siteContent.content = data.content;
        if (data.order !== undefined) siteContent.order = data.order;
        if (data.isActive !== undefined) siteContent.isActive = data.isActive;

        console.log('Modified content (updateContentById) for id:', id);
        siteContent.markModified('content');
        await siteContent.save();

        const docObj = siteContent.toObject();
        console.log('SITE_CONTENT_SAVED:', docObj.content.hero || docObj.content);
        docObj.content = await this.fixContentUrls(docObj.content);
        return docObj;
    }

    async deleteContent(id: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Geçersiz ID', 400);
        await SiteContent.deleteOne({ _id: id });
    }

    /* --- Image Methods --- */

    async listImages(category?: string, isActive?: boolean): Promise<any[]> {
        const filters: any = {};
        if (category) filters.category = category;
        if (isActive !== undefined) filters.isActive = isActive;

        const images = await SiteImage.find(filters).sort({ category: 1, order: 1, createdAt: -1 });
        return images.map(img => this.fixImageUrls(img.toObject()));
    }

    async getImageById(id: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Geçersiz ID', 400);
        const image = await SiteImage.findById(id);
        if (!image) throw new AppError('Resim bulunamadı', 404);
        return this.fixImageUrls(image.toObject());
    }

    async createImage(data: { filename: string, originalName: string, path: string, url: string, category?: string, order?: number }): Promise<any> {
        const image = await SiteImage.create({
            ...data,
            category: (data.category || 'gallery') as any,
            order: data.order || 0,
            isActive: true
        });
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
        return image;
    }

    async deleteImage(id: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Geçersiz ID', 400);
        await SiteImage.deleteOne({ _id: id });
    }

    async deleteMultipleImages(ids: string[]): Promise<void> {
        await SiteImage.deleteMany({ _id: { $in: ids } });
    }

    async updateImageOrders(updates: { id: string, order: number }[]): Promise<void> {
        await Promise.all(updates.map(u => SiteImage.findByIdAndUpdate(u.id, { order: u.order })));
    }
}

export default new SiteService();
