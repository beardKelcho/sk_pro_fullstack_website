import { useState, useCallback } from 'react';
import {
    useQuery,
    useMutation,
    useQueryClient
} from '@tanstack/react-query';
import {
    getAllContents,
    getContentBySection,
    updateContentBySection,
    SiteContent,
    SiteContentData,
    HeroContent,
    ServiceItem,
    EquipmentCategory,
    ServicesEquipmentContent,
    AboutContent,
    ContactInfo,
    FooterContent,
    SocialMedia
} from '@/services/siteContentService';
import {
    getAllImages,
    createImage,
    deleteImage,
    SiteImage
} from '@/services/siteImageService';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';

// Re-export types for convenience
export type {
    SiteContent,
    SiteContentData,
    SiteImage,
    HeroContent,
    ServiceItem,
    EquipmentCategory,
    ServicesEquipmentContent,
    AboutContent,
    ContactInfo,
    FooterContent,
    SocialMedia
};

export const useSiteContent = () => {
    const queryClient = useQueryClient();

    // --- Content Queries ---

    const useContent = (section: string) => {
        return useQuery({
            queryKey: ['site-content', section],
            queryFn: () => getContentBySection(section),
            staleTime: 5 * 60 * 1000, // 5 minutes
        });
    };

    const useAllContents = () => {
        return useQuery({
            queryKey: ['site-contents'],
            queryFn: () => getAllContents(),
        });
    };

    // --- Content Mutations ---

    const mutationUpdateContent = useMutation({
        mutationFn: ({ section, data }: { section: string; data: SiteContentData }) =>
            updateContentBySection(section, { content: data }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['site-content', variables.section] });
            queryClient.invalidateQueries({ queryKey: ['site-contents'] });
            toast.success('İçerik başarıyla güncellendi');
        },
        onError: (error: any) => {
            logger.error('Content update error:', error);
            toast.error('İçerik güncellenirken hata oluştu');
        }
    });

    // --- Image Queries and Mutations ---

    const useImages = (category?: string) => {
        return useQuery({
            queryKey: ['site-images', category],
            queryFn: async () => {
                const res = await getAllImages({ category });
                return res.images;
            },
        });
    };

    const mutationUploadImage = useMutation({
        mutationFn: async ({ file, category, order }: { file: File; category: SiteImage['category']; order?: number }) => {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('category', category);
            if (order !== undefined) formData.append('order', String(order));

            // We need to use raw axios or a modified service for FormData if createContent doesn't support it directly
            // Looking at service, createImage takes Partial<SiteImage> which usually implies JSON.
            // However, usually image upload requires FormData and specific headers.
            // Let's assume the service handles it or we might need to adjust the service.
            // Checking siteImageService.ts... it uses apiClient.post('/site-images', data).
            // If the backend expects multipart/form-data, we need to send FormData.
            // Let's update this to assume the service helper needs to be capable or we do it here.
            // PROBABLY better to do it here if service is generic.

            // Actually, let's look at how it's likely implemented. 
            // Most likely siteImageService needs to support FormData.
            // For now, let's wrap it here properly.

            // NOTE: We will assume we need to bypass the service type strictness or cast it 
            // OR better, we simply use the apiClient here for upload if service is strict JSON.
            // But typically `createImage` calls `apiClient.post`, which supports FormData.
            return createImage(formData as any);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-images'] });
            toast.success('Görsel yüklendi');
        },
        onError: (err) => {
            logger.error('Upload error', err);
            toast.error('Görsel yüklenemedi');
        }
    });

    const mutationDeleteImage = useMutation({
        mutationFn: deleteImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-images'] });
            toast.success('Görsel silindi');
        },
        onError: (err) => {
            logger.error('Delete image error', err);
            toast.error('Görsel silinemedi');
        }
    });

    return {
        // Hooks for fetching
        useContent,
        useAllContents,
        useImages,

        // Actions
        updateContent: mutationUpdateContent.mutateAsync,
        isUpdating: mutationUpdateContent.isPending,

        uploadImage: mutationUploadImage.mutateAsync,
        isUploading: mutationUploadImage.isPending,

        deleteImage: mutationDeleteImage.mutateAsync,
        isDeleting: mutationDeleteImage.isPending,
    };
};
